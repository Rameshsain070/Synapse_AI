/* ============================================================
   Synapse Todo — Application Logic
   Pure Vanilla JavaScript · Local Storage Persistence
   ============================================================ */

(function () {
  'use strict';

  /* ---------- Constants ---------- */
  var STORAGE_KEY = 'synapse_todo_tasks';
  var THEME_KEY = 'synapse_theme';

  /* ---------- DOM Refs ---------- */
  var taskForm       = document.getElementById('task-form');
  var taskInput      = document.getElementById('task-input');
  var taskPriority   = document.getElementById('task-priority');
  var taskCategory   = document.getElementById('task-category');
  var taskDueDate    = document.getElementById('task-due-date');
  var taskList       = document.getElementById('task-list');
  var emptyState     = document.getElementById('empty-state');
  var searchInput    = document.getElementById('search-input');
  var totalCount     = document.getElementById('total-count');
  var activeCount    = document.getElementById('active-count');
  var completedCount = document.getElementById('completed-count');
  var clearBtn       = document.getElementById('clear-completed');
  var themeToggle    = document.getElementById('theme-toggle');
  var editModal      = document.getElementById('edit-modal');
  var editForm       = document.getElementById('edit-form');
  var editTitle      = document.getElementById('edit-title');
  var editPriority   = document.getElementById('edit-priority');
  var editCategory   = document.getElementById('edit-category');
  var editDueDate    = document.getElementById('edit-due-date');
  var modalClose     = document.getElementById('modal-close');
  var modalCancel    = document.getElementById('modal-cancel');
  var categoryList   = document.getElementById('category-list');
  var editCategoryList = document.getElementById('edit-category-list');
  var toastContainer = document.getElementById('toast-container');

  /* ---------- State ---------- */
  var tasks = [];
  var currentFilter = 'all';
  var searchQuery = '';
  var editingTaskId = null;

  /* ---------- UUID helper ---------- */
  function generateId() {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      return crypto.randomUUID();
    }
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      var r = (Math.random() * 16) | 0;
      var v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }

  /* ---------- Local Storage ---------- */
  function saveTasks() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    } catch (_) { /* storage full – silently ignore */ }
  }

  function loadTasks() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        tasks = JSON.parse(raw);
        if (!Array.isArray(tasks)) tasks = [];
      }
    } catch (_) {
      tasks = [];
    }
  }

  /* ---------- Theme ---------- */
  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    try { localStorage.setItem(THEME_KEY, theme); } catch (_) { /* ignore */ }
  }

  function loadTheme() {
    var saved = null;
    try { saved = localStorage.getItem(THEME_KEY); } catch (_) { /* ignore */ }
    if (saved === 'dark' || saved === 'light') {
      applyTheme(saved);
    } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      applyTheme('dark');
    } else {
      applyTheme('light');
    }
  }

  function toggleTheme() {
    var current = document.documentElement.getAttribute('data-theme');
    applyTheme(current === 'dark' ? 'light' : 'dark');
  }

  /* ---------- Toast Notifications ---------- */
  function showToast(message, type) {
    type = type || 'success';
    var toast = document.createElement('div');
    toast.className = 'toast ' + type;
    toast.textContent = message;
    toastContainer.appendChild(toast);
    setTimeout(function () {
      toast.classList.add('removing');
      setTimeout(function () { toast.remove(); }, 300);
    }, 2500);
  }

  /* ---------- Categories datalist ---------- */
  function updateCategoryDatalist() {
    var cats = {};
    tasks.forEach(function (t) {
      if (t.category) cats[t.category] = true;
    });
    categoryList.innerHTML = '';
    editCategoryList.innerHTML = '';
    Object.keys(cats).forEach(function (c) {
      var opt1 = document.createElement('option');
      opt1.value = c;
      categoryList.appendChild(opt1);
      var opt2 = document.createElement('option');
      opt2.value = c;
      editCategoryList.appendChild(opt2);
    });
  }

  /* ---------- Date helpers ---------- */
  var MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  var DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

  function formatDate(dateStr) {
    if (!dateStr || !DATE_RE.test(dateStr)) return dateStr || '';
    var parts = dateStr.split('-');
    var monthIdx = parseInt(parts[1], 10) - 1;
    if (monthIdx < 0 || monthIdx > 11) return dateStr;
    return MONTH_NAMES[monthIdx] + ' ' + parseInt(parts[2], 10) + ', ' + parts[0];
  }

  function isOverdue(dateStr) {
    if (!dateStr || !DATE_RE.test(dateStr)) return false;
    var today = new Date();
    today.setHours(0, 0, 0, 0);
    var due = new Date(dateStr + 'T00:00:00');
    return !isNaN(due.getTime()) && due < today;
  }

  /* ---------- Add Task ---------- */
  function addTask(title, priority, category, dueDate) {
    var task = {
      id: generateId(),
      title: title.trim(),
      completed: false,
      priority: priority || 'medium',
      category: category ? category.trim() : '',
      dueDate: dueDate || '',
      createdAt: new Date().toISOString()
    };
    tasks.unshift(task);
    saveTasks();
    render();
    showToast('Task added!');
    updateCategoryDatalist();
  }

  /* ---------- Delete Task ---------- */
  function deleteTask(id) {
    var item = document.querySelector('[data-id="' + id + '"]');
    if (item) {
      item.classList.add('removing');
      setTimeout(function () {
        tasks = tasks.filter(function (t) { return t.id !== id; });
        saveTasks();
        render();
        showToast('Task deleted', 'error');
        updateCategoryDatalist();
      }, 300);
    } else {
      tasks = tasks.filter(function (t) { return t.id !== id; });
      saveTasks();
      render();
    }
  }

  /* ---------- Toggle Complete ---------- */
  function toggleComplete(id) {
    for (var i = 0; i < tasks.length; i++) {
      if (tasks[i].id === id) {
        tasks[i].completed = !tasks[i].completed;
        var cb = document.querySelector('[data-id="' + id + '"] .task-checkbox');
        if (cb) cb.classList.add('check-pop');
        break;
      }
    }
    saveTasks();
    render();
  }

  /* ---------- Edit Task (open modal) ---------- */
  function openEditModal(id) {
    var task = tasks.find(function (t) { return t.id === id; });
    if (!task) return;
    editingTaskId = id;
    editTitle.value = task.title;
    editPriority.value = task.priority;
    editCategory.value = task.category;
    editDueDate.value = task.dueDate;
    editModal.hidden = false;
    editTitle.focus();
  }

  function closeEditModal() {
    editModal.hidden = true;
    editingTaskId = null;
  }

  function saveEdit(e) {
    e.preventDefault();
    if (!editingTaskId) return;
    var title = editTitle.value.trim();
    if (!title) return;
    for (var i = 0; i < tasks.length; i++) {
      if (tasks[i].id === editingTaskId) {
        tasks[i].title = title;
        tasks[i].priority = editPriority.value;
        tasks[i].category = editCategory.value.trim();
        tasks[i].dueDate = editDueDate.value;
        break;
      }
    }
    saveTasks();
    closeEditModal();
    render();
    showToast('Task updated!', 'info');
    updateCategoryDatalist();
  }

  /* ---------- Clear Completed ---------- */
  function clearCompleted() {
    var count = tasks.filter(function (t) { return t.completed; }).length;
    if (count === 0) return;
    if (!confirm('Remove ' + count + ' completed task' + (count > 1 ? 's' : '') + '?')) return;
    tasks = tasks.filter(function (t) { return !t.completed; });
    saveTasks();
    render();
    showToast(count + ' task' + (count > 1 ? 's' : '') + ' cleared', 'info');
    updateCategoryDatalist();
  }

  /* ---------- Filter / Search ---------- */
  function getFilteredTasks() {
    return tasks.filter(function (t) {
      if (currentFilter === 'active' && t.completed) return false;
      if (currentFilter === 'completed' && !t.completed) return false;
      if (searchQuery) {
        var q = searchQuery.toLowerCase();
        var inTitle = t.title.toLowerCase().indexOf(q) !== -1;
        var inCat = t.category && t.category.toLowerCase().indexOf(q) !== -1;
        if (!inTitle && !inCat) return false;
      }
      return true;
    });
  }

  /* ---------- Render ---------- */
  var VALID_PRIORITIES = { high: true, medium: true, low: true };
  var ICON_WARNING = '⚠ ';
  var ICON_CALENDAR = '📅 ';

  /* SVG namespace */
  var SVG_NS = 'http://www.w3.org/2000/svg';

  function createSvgIcon(paths) {
    var svg = document.createElementNS(SVG_NS, 'svg');
    svg.setAttribute('class', 'icon');
    svg.setAttribute('viewBox', '0 0 24 24');
    svg.setAttribute('fill', 'none');
    svg.setAttribute('stroke', 'currentColor');
    svg.setAttribute('stroke-width', '2');
    svg.setAttribute('stroke-linecap', 'round');
    svg.setAttribute('stroke-linejoin', 'round');
    paths.forEach(function (p) {
      if (p.tag === 'path') {
        var el = document.createElementNS(SVG_NS, 'path');
        el.setAttribute('d', p.d);
        svg.appendChild(el);
      } else if (p.tag === 'polyline') {
        var el2 = document.createElementNS(SVG_NS, 'polyline');
        el2.setAttribute('points', p.points);
        svg.appendChild(el2);
      }
    });
    return svg;
  }

  function createBadge(className, text) {
    var span = document.createElement('span');
    span.className = 'task-badge ' + className;
    span.textContent = text;
    return span;
  }

  function render() {
    var filtered = getFilteredTasks();

    /* Counters */
    var total = tasks.length;
    var done = tasks.filter(function (t) { return t.completed; }).length;
    var active = total - done;
    totalCount.textContent = total;
    activeCount.textContent = active;
    completedCount.textContent = done;
    clearBtn.hidden = done === 0;

    /* Empty state */
    emptyState.hidden = filtered.length > 0;

    /* Build list using safe DOM APIs */
    taskList.innerHTML = '';
    filtered.forEach(function (task) {
      var priority = VALID_PRIORITIES[task.priority] ? task.priority : 'medium';

      var li = document.createElement('li');
      li.className = 'task-item priority-' + priority + (task.completed ? ' completed' : '');
      li.setAttribute('data-id', task.id);

      /* Checkbox */
      var cb = document.createElement('input');
      cb.type = 'checkbox';
      cb.className = 'task-checkbox';
      cb.checked = !!task.completed;
      cb.setAttribute('aria-label', 'Mark ' + task.title + ' as ' + (task.completed ? 'incomplete' : 'complete'));
      li.appendChild(cb);

      /* Content wrapper */
      var content = document.createElement('div');
      content.className = 'task-content';

      var titleEl = document.createElement('div');
      titleEl.className = 'task-title';
      titleEl.textContent = task.title;
      content.appendChild(titleEl);

      var meta = document.createElement('div');
      meta.className = 'task-meta';
      meta.appendChild(createBadge('badge-' + priority, priority));
      if (task.category) {
        meta.appendChild(createBadge('badge-category', task.category));
      }
      if (task.dueDate) {
        var overdue = !task.completed && isOverdue(task.dueDate);
        var dueBadge = createBadge(
          overdue ? 'badge-overdue' : 'badge-due',
          (overdue ? ICON_WARNING : ICON_CALENDAR) + formatDate(task.dueDate)
        );
        meta.appendChild(dueBadge);
      }
      content.appendChild(meta);
      li.appendChild(content);

      /* Action buttons */
      var actions = document.createElement('div');
      actions.className = 'task-actions';

      var editBtn = document.createElement('button');
      editBtn.className = 'task-action-btn edit';
      editBtn.setAttribute('aria-label', 'Edit task');
      editBtn.title = 'Edit';
      editBtn.appendChild(createSvgIcon([
        { tag: 'path', d: 'M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7' },
        { tag: 'path', d: 'M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z' }
      ]));
      actions.appendChild(editBtn);

      var delBtn = document.createElement('button');
      delBtn.className = 'task-action-btn delete';
      delBtn.setAttribute('aria-label', 'Delete task');
      delBtn.title = 'Delete';
      delBtn.appendChild(createSvgIcon([
        { tag: 'polyline', points: '3 6 5 6 21 6' },
        { tag: 'path', d: 'M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2' }
      ]));
      actions.appendChild(delBtn);

      li.appendChild(actions);
      taskList.appendChild(li);
    });
  }

  /* ---------- Demo tasks (first visit) ---------- */
  function seedDemoTasks() {
    var today = new Date();
    var tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    var nextWeek = new Date(today);
    nextWeek.setDate(nextWeek.getDate() + 7);

    function pad(n) { return n < 10 ? '0' + n : '' + n; }
    function dateStr(d) { return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); }

    tasks = [
      {
        id: generateId(),
        title: 'Welcome to Synapse Todo! Click the checkbox to complete this task',
        completed: false,
        priority: 'high',
        category: 'Getting Started',
        dueDate: dateStr(tomorrow),
        createdAt: new Date().toISOString()
      },
      {
        id: generateId(),
        title: 'Try editing this task by clicking the pencil icon',
        completed: false,
        priority: 'medium',
        category: 'Getting Started',
        dueDate: '',
        createdAt: new Date().toISOString()
      },
      {
        id: generateId(),
        title: 'Add a new task using the form above',
        completed: false,
        priority: 'medium',
        category: 'Getting Started',
        dueDate: dateStr(nextWeek),
        createdAt: new Date().toISOString()
      },
      {
        id: generateId(),
        title: 'This is a completed demo task',
        completed: true,
        priority: 'low',
        category: 'Getting Started',
        dueDate: '',
        createdAt: new Date().toISOString()
      },
      {
        id: generateId(),
        title: 'Try the dark mode toggle in the header!',
        completed: false,
        priority: 'low',
        category: 'Tips',
        dueDate: '',
        createdAt: new Date().toISOString()
      }
    ];
    saveTasks();
  }

  /* ---------- Event Listeners ---------- */

  /* Add task */
  taskForm.addEventListener('submit', function (e) {
    e.preventDefault();
    var title = taskInput.value.trim();
    if (!title) return;
    addTask(title, taskPriority.value, taskCategory.value, taskDueDate.value);
    taskInput.value = '';
    taskCategory.value = '';
    taskDueDate.value = '';
    taskPriority.value = 'medium';
    taskInput.focus();
  });

  /* Task list delegation – checkbox, edit, delete */
  taskList.addEventListener('click', function (e) {
    var target = e.target;
    var li = target.closest('.task-item');
    if (!li) return;
    var id = li.getAttribute('data-id');

    if (target.classList.contains('task-checkbox')) {
      toggleComplete(id);
      return;
    }
    if (target.closest('.edit')) {
      openEditModal(id);
      return;
    }
    if (target.closest('.delete')) {
      deleteTask(id);
    }
  });

  /* Filter tabs */
  document.querySelectorAll('.filter-tab').forEach(function (tab) {
    tab.addEventListener('click', function () {
      document.querySelectorAll('.filter-tab').forEach(function (t) {
        t.classList.remove('active');
        t.setAttribute('aria-selected', 'false');
      });
      tab.classList.add('active');
      tab.setAttribute('aria-selected', 'true');
      currentFilter = tab.getAttribute('data-filter');
      render();
    });
  });

  /* Search */
  searchInput.addEventListener('input', function () {
    searchQuery = searchInput.value;
    render();
  });

  /* Clear completed */
  clearBtn.addEventListener('click', clearCompleted);

  /* Theme toggle */
  themeToggle.addEventListener('click', toggleTheme);

  /* Edit modal */
  editForm.addEventListener('submit', saveEdit);
  modalClose.addEventListener('click', closeEditModal);
  modalCancel.addEventListener('click', closeEditModal);

  /* Close modal on overlay click */
  editModal.addEventListener('click', function (e) {
    if (e.target === editModal) closeEditModal();
  });

  /* Keyboard shortcuts */
  document.addEventListener('keydown', function (e) {
    /* Escape closes modal */
    if (e.key === 'Escape' && !editModal.hidden) {
      closeEditModal();
    }
  });

  /* ---------- Init ---------- */
  loadTheme();
  loadTasks();
  if (tasks.length === 0) {
    seedDemoTasks();
  }
  updateCategoryDatalist();
  render();
})();
