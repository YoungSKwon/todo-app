'use strict';

// ── State ──────────────────────────────────────────────────────────────────
let todos  = JSON.parse(localStorage.getItem('todos') || '[]');
let filter = 'all';
let theme  = localStorage.getItem('theme') || 'light';

// ── DOM refs ───────────────────────────────────────────────────────────────
const inputForm   = document.getElementById('inputForm');
const inputField  = document.getElementById('inputField');
const todoList    = document.getElementById('todoList');
const countEl     = document.getElementById('count');
const footer      = document.getElementById('footer');
const clearBtn    = document.getElementById('clearBtn');
const themeToggle = document.getElementById('themeToggle');
const filterBtns  = document.querySelectorAll('.filter-btn');

// ── Helpers ────────────────────────────────────────────────────────────────
const save = () => localStorage.setItem('todos', JSON.stringify(todos));
const uid  = () => Date.now().toString(36) + Math.random().toString(36).slice(2);

// ── Theme ──────────────────────────────────────────────────────────────────
function applyTheme(t) {
  theme = t;
  document.documentElement.setAttribute('data-theme', t);
  themeToggle.textContent = t === 'dark' ? '\u2600\uFE0F' : '\uD83C\uDF19';
  localStorage.setItem('theme', t);
}

themeToggle.addEventListener('click', () =>
  applyTheme(theme === 'dark' ? 'light' : 'dark')
);

// ── Render ─────────────────────────────────────────────────────────────────
function render() {
  const visible = todos.filter(t => {
    if (filter === 'active')    return !t.done;
    if (filter === 'completed') return  t.done;
    return true;
  });

  todoList.innerHTML = '';

  if (visible.length === 0) {
    const empty = document.createElement('li');
    empty.className = 'empty show';
    const messages = {
      all:       ['\uD83D\uDCCB', '\uD560 \uC77C\uC774 \uC5C6\uC2B5\uB2C8\uB2E4'],
      active:    ['\u2705', '\uC9C4\uD589\uC911\uC778 \uD56D\uBAA9\uC774 \uC5C6\uC2B5\uB2C8\uB2E4'],
      completed: ['\uD83C\uDF89', '\uC644\uB8CC\uB41C \uD56D\uBAA9\uC774 \uC5C6\uC2B5\uB2C8\uB2E4'],
    };
    const [icon, text] = messages[filter];
    empty.innerHTML = `<div class="empty-icon">${icon}</div>${text}`;
    todoList.appendChild(empty);
  } else {
    visible.forEach(todo => todoList.appendChild(createItem(todo)));
  }

  const activeCount = todos.filter(t => !t.done).length;
  countEl.textContent = `${activeCount}\uAC1C \uB0A8\uC74C`;

  const hasCompleted = todos.some(t => t.done);
  footer.classList.toggle('hidden', todos.length === 0);
  clearBtn.style.visibility = hasCompleted ? 'visible' : 'hidden';
}

// ── Create Item Element ────────────────────────────────────────────────────
function createItem(todo) {
  const li = document.createElement('li');
  li.className = `todo-item${todo.done ? ' completed' : ''}`;
  li.dataset.id = todo.id;

  // checkbox
  const check = document.createElement('input');
  check.type      = 'checkbox';
  check.className = 'todo-check';
  check.checked   = todo.done;
  check.addEventListener('change', () => toggle(todo.id));

  // label
  const label = document.createElement('span');
  label.className   = 'todo-label';
  label.textContent = todo.text;
  label.addEventListener('dblclick', () => startEdit(li, todo));

  // actions
  const actions = document.createElement('div');
  actions.className = 'todo-actions';

  const editBtn = document.createElement('button');
  editBtn.className = 'action-btn';
  editBtn.textContent = '\u270F\uFE0F';
  editBtn.title = '\uC218\uC815';
  editBtn.addEventListener('click', () => startEdit(li, todo));

  const delBtn = document.createElement('button');
  delBtn.className = 'action-btn';
  delBtn.textContent = '\uD83D\uDDD1\uFE0F';
  delBtn.title = '\uC0AD\uC81C';
  delBtn.addEventListener('click', () => remove(todo.id));

  actions.append(editBtn, delBtn);
  li.append(check, label, actions);
  return li;
}

// ── Inline Edit ────────────────────────────────────────────────────────────
function startEdit(li, todo) {
  if (todo.done) return;
  const label = li.querySelector('.todo-label');
  const input = document.createElement('input');
  input.type      = 'text';
  input.className = 'todo-edit';
  input.value     = todo.text;
  input.maxLength = 200;

  label.replaceWith(input);
  input.focus();
  input.select();

  const commit = () => {
    const val = input.value.trim();
    if (val && val !== todo.text) {
      todo.text = val;
      save();
    }
    render();
  };

  input.addEventListener('keydown', e => {
    if (e.key === 'Enter')  { e.preventDefault(); commit(); }
    if (e.key === 'Escape') render();
  });
  input.addEventListener('blur', commit);
}

// ── CRUD ───────────────────────────────────────────────────────────────────
function addTodo(text) {
  todos.unshift({ id: uid(), text, done: false, createdAt: Date.now() });
  save();
  render();
}

function toggle(id) {
  const t = todos.find(t => t.id === id);
  if (t) { t.done = !t.done; save(); render(); }
}

function remove(id) {
  const li = todoList.querySelector(`[data-id="${id}"]`);
  if (li) {
    li.style.transform = 'translateX(40px)';
    li.style.opacity   = '0';
    li.style.transition = 'transform .2s ease, opacity .2s ease';
    setTimeout(() => {
      todos = todos.filter(t => t.id !== id);
      save();
      render();
    }, 200);
  }
}

// ── Event Listeners ────────────────────────────────────────────────────────
inputForm.addEventListener('submit', e => {
  e.preventDefault();
  const text = inputField.value.trim();
  if (!text) { inputField.classList.add('shake'); setTimeout(() => inputField.classList.remove('shake'), 400); return; }
  addTodo(text);
  inputField.value = '';
  inputField.focus();
});

filterBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    filter = btn.dataset.filter;
    filterBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    render();
  });
});

clearBtn.addEventListener('click', () => {
  todos = todos.filter(t => !t.done);
  save();
  render();
});

// ── Init ───────────────────────────────────────────────────────────────────
applyTheme(theme);
render();
