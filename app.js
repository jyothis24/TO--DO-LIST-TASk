

(() => {
  const STORAGE_KEY = 'demo.todo.v1';

  // App state
  let tasks = []; // {id, text, completed, createdAt}
  let filter = 'all';
  let searchTerm = '';

  // Elements
  const taskForm = document.getElementById('task-form');
  const taskInput = document.getElementById('task-input');
  const taskList = document.getElementById('task-list');
  const countEl = document.getElementById('count');
  const filterButtons = document.querySelectorAll('.filter-btn');
  const searchInput = document.getElementById('search');
  const clearCompletedBtn = document.getElementById('clear-completed');

  // Helpers
  const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);

  function save() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  }
  function load() {
    const raw = localStorage.getItem(STORAGE_KEY);
    tasks = raw ? JSON.parse(raw) : [];
  }

  // Render
  function render() {
    // filter & search
    const visible = tasks.filter(t => {
      if (filter === 'active' && t.completed) return false;
      if (filter === 'completed' && !t.completed) return false;
      if (searchTerm && !t.text.toLowerCase().includes(searchTerm.toLowerCase())) return false;
      return true;
    });

    taskList.innerHTML = '';
    if (visible.length === 0) {
      const li = document.createElement('li');
      li.className = 'task-item';
      li.innerHTML = `<div class="task-left"><div class="task-text" style="color:var(--muted)">No tasks found.</div></div>`;
      taskList.appendChild(li);
    } else {
      visible.forEach(task => {
        const li = document.createElement('li');
        li.className = 'task-item' + (task.completed ? ' completed' : '');
        li.dataset.id = task.id;

        const left = document.createElement('div');
        left.className = 'task-left';

        const toggle = document.createElement('button');
        toggle.className = 'toggle' + (task.completed ? ' checked' : '');
        toggle.title = task.completed ? 'Mark as active' : 'Mark as completed';
        toggle.setAttribute('aria-pressed', task.completed ? 'true' : 'false');
        toggle.addEventListener('click', () => toggleTask(task.id));
        toggle.innerHTML = task.completed ? '&#10003;' : '';

        const text = document.createElement('div');
        text.className = 'task-text';
        text.textContent = task.text;
        text.title = 'Double-click to edit';
        text.addEventListener('dblclick', () => startEdit(task.id, text));

        left.appendChild(toggle);
        left.appendChild(text);

        const actions = document.createElement('div');
        actions.className = 'actions';

        const editBtn = document.createElement('button');
        editBtn.className = 'icon-btn';
        editBtn.title = 'Edit';
        editBtn.innerHTML = '✎';
        editBtn.addEventListener('click', () => startEdit(task.id, text));

        const delBtn = document.createElement('button');
        delBtn.className = 'icon-btn';
        delBtn.title = 'Delete';
        delBtn.innerHTML = '🗑';
        delBtn.addEventListener('click', () => deleteTask(task.id));

        actions.appendChild(editBtn);
        actions.appendChild(delBtn);

        li.appendChild(left);
        li.appendChild(actions);

        taskList.appendChild(li);
      });
    }

    // footer
    const remaining = tasks.filter(t => !t.completed).length;
    countEl.textContent = `${remaining} task${remaining !== 1 ? 's' : ''} remaining`;

    // update filter UI
    filterButtons.forEach(btn => btn.classList.toggle('active', btn.dataset.filter === filter));
  }

  // Actions
  function addTask(text) {
    text = text.trim();
    if (!text) return;
    const newTask = { id: uid(), text, completed: false, createdAt: Date.now() };
    tasks.unshift(newTask); // newest on top
    save();
    render();
  }

  function toggleTask(id) {
    const t = tasks.find(x => x.id === id);
    if (!t) return;
    t.completed = !t.completed;
    save();
    render();
  }

  function deleteTask(id) {
    tasks = tasks.filter(t => t.id !== id);
    save();
    render();
  }

  function startEdit(id, textNode) {
    // Replace textNode with an input
    const originalText = textNode.textContent;
    const input = document.createElement('input');
    input.type = 'text';
    input.value = originalText;
    input.style.width = '100%';
    input.className = 'edit-input';
    textNode.replaceWith(input);
    input.focus();
    // Save on Enter or blur
    function finish() {
      const newText = input.value.trim();
      if (!newText) {
        // if empty, delete
        deleteTask(id);
      } else {
        const t = tasks.find(x => x.id === id);
        if (t) t.text = newText;
        save();
      }
      render();
    }
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        finish();
      } else if (e.key === 'Escape') {
        render();
      }
    });
    input.addEventListener('blur', finish);
  }

  function clearCompleted() {
    const before = tasks.length;
    tasks = tasks.filter(t => !t.completed);
    if (tasks.length !== before) {
      save();
      render();
    }
  }

  // Events
  taskForm.addEventListener('submit', (e) => {
    e.preventDefault();
    addTask(taskInput.value);
    taskInput.value = '';
    taskInput.focus();
  });

  filterButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      filter = btn.dataset.filter;
      render();
    });
  });

  searchInput.addEventListener('input', (e) => {
    searchTerm = e.target.value;
    render();
  });

  clearCompletedBtn.addEventListener('click', () => {
    clearCompleted();
  });

  // initial load
  function init() {
    load();
    render();
    // accessibility: focus input on load
    taskInput.focus();
  }

  init();
})();
