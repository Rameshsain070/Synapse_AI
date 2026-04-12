/**
 * Synapse AI - Task Management
 * Full CRUD with localStorage, filtering, sorting, and demo seed data.
 */
(function () {
  'use strict';

  var STORAGE_KEY = 'synapse-tasks';
  var PRIORITIES = ['high', 'medium', 'low'];
  var STATUSES = ['todo', 'in-progress', 'done'];
  var CATEGORIES = ['general', 'work', 'personal', 'learning'];
  var STATUS_CYCLE = { 'todo': 'in-progress', 'in-progress': 'done', 'done': 'todo' };

  var tasks = [];
  var currentFilter = { status: 'all', priority: 'all', category: 'all', search: '' };
  var currentSort = { field: 'createdAt', direction: 'desc' };

  var esc = function (s) { return window.SynapseApp ? window.SynapseApp.escapeHtml(s) : s; };

  // ── Demo Seed Data ───────────────────────────────────────────────

  var SEED_TASKS = [
    { title: 'Set up Synapse AI backend', description: 'Configure FastAPI server, database connections, and environment variables for the Synapse AI platform.', priority: 'high', status: 'in-progress', category: 'work' },
    { title: 'Explore RAG search features', description: 'Test semantic search with sample documents and evaluate retrieval quality.', priority: 'medium', status: 'todo', category: 'learning' },
    { title: 'Configure Pinecone vector DB', description: 'Set up Pinecone index, configure embedding dimensions, and test upsert/query operations.', priority: 'high', status: 'todo', category: 'work' },
    { title: 'Review LangGraph documentation', description: 'Read through LangGraph docs to understand stateful agent workflows and graph-based processing.', priority: 'medium', status: 'todo', category: 'learning' },
    { title: 'Deploy to production', description: 'Prepare Docker Compose configuration and deploy all services to production environment.', priority: 'low', status: 'todo', category: 'work' }
  ];

  // ── Persistence ──────────────────────────────────────────────────

  function loadTasks() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      tasks = raw ? JSON.parse(raw) : [];
    } catch (e) {
      tasks = [];
    }
    if (tasks.length === 0) {
      seedTasks();
    }
  }

  function saveTasks() {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks)); } catch (e) { /* */ }
  }

  function seedTasks() {
    var now = new Date();
    for (var i = 0; i < SEED_TASKS.length; i++) {
      var seed = SEED_TASKS[i];
      var id = window.SynapseApp ? window.SynapseApp.generateId() : 'task_' + Math.random().toString(36).substring(2, 9);
      tasks.push({
        id: id,
        title: seed.title,
        description: seed.description,
        priority: seed.priority,
        status: seed.status,
        category: seed.category,
        createdAt: new Date(now.getTime() - (SEED_TASKS.length - i) * 86400000).toISOString(),
        updatedAt: new Date(now.getTime() - (SEED_TASKS.length - i) * 86400000).toISOString()
      });
    }
    saveTasks();
  }

  // ── CRUD ─────────────────────────────────────────────────────────

  function addTask(taskData) {
    var now = new Date().toISOString();
    var id = window.SynapseApp ? window.SynapseApp.generateId() : 'task_' + Math.random().toString(36).substring(2, 9);
    var task = {
      id: id,
      title: (taskData.title || '').trim(),
      description: (taskData.description || '').trim(),
      priority: PRIORITIES.indexOf(taskData.priority) !== -1 ? taskData.priority : 'medium',
      status: STATUSES.indexOf(taskData.status) !== -1 ? taskData.status : 'todo',
      category: CATEGORIES.indexOf(taskData.category) !== -1 ? taskData.category : 'general',
      createdAt: now,
      updatedAt: now
    };
    if (!task.title) return null;
    tasks.unshift(task);
    saveTasks();
    renderTasks();
    renderStats();
    if (window.SynapseApp) window.SynapseApp.showToast('Task added!', 'success');
    return task;
  }

  function updateTask(id, updates) {
    var task = getTask(id);
    if (!task) return null;
    var allowed = ['title', 'description', 'priority', 'status', 'category'];
    for (var i = 0; i < allowed.length; i++) {
      var key = allowed[i];
      if (updates[key] !== undefined) {
        if (key === 'priority' && PRIORITIES.indexOf(updates[key]) === -1) continue;
        if (key === 'status' && STATUSES.indexOf(updates[key]) === -1) continue;
        if (key === 'category' && CATEGORIES.indexOf(updates[key]) === -1) continue;
        task[key] = typeof updates[key] === 'string' ? updates[key].trim() : updates[key];
      }
    }
    task.updatedAt = new Date().toISOString();
    saveTasks();
    renderTasks();
    renderStats();
    return task;
  }

  function deleteTask(id) {
    var len = tasks.length;
    tasks = tasks.filter(function (t) { return t.id !== id; });
    if (tasks.length < len) {
      saveTasks();
      renderTasks();
      renderStats();
      if (window.SynapseApp) window.SynapseApp.showToast('Task deleted', 'info');
      return true;
    }
    return false;
  }

  function getTask(id) {
    for (var i = 0; i < tasks.length; i++) {
      if (tasks[i].id === id) return tasks[i];
    }
    return null;
  }

  function toggleComplete(id) {
    var task = getTask(id);
    if (!task) return null;
    task.status = STATUS_CYCLE[task.status] || 'todo';
    task.updatedAt = new Date().toISOString();
    saveTasks();
    renderTasks();
    renderStats();
    return task;
  }

  // ── Filter & Sort ────────────────────────────────────────────────

  function filterTasks(filter) {
    if (filter) {
      if (filter.status !== undefined) currentFilter.status = filter.status;
      if (filter.priority !== undefined) currentFilter.priority = filter.priority;
      if (filter.category !== undefined) currentFilter.category = filter.category;
      if (filter.search !== undefined) currentFilter.search = filter.search;
    }

    var result = tasks.slice();

    if (currentFilter.status && currentFilter.status !== 'all') {
      result = result.filter(function (t) { return t.status === currentFilter.status; });
    }
    if (currentFilter.priority && currentFilter.priority !== 'all') {
      result = result.filter(function (t) { return t.priority === currentFilter.priority; });
    }
    if (currentFilter.category && currentFilter.category !== 'all') {
      result = result.filter(function (t) { return t.category === currentFilter.category; });
    }
    if (currentFilter.search) {
      var q = currentFilter.search.toLowerCase();
      result = result.filter(function (t) {
        return t.title.toLowerCase().indexOf(q) !== -1 ||
               t.description.toLowerCase().indexOf(q) !== -1;
      });
    }

    return sortTasks(currentSort.field, currentSort.direction, result);
  }

  function sortTasks(field, direction, list) {
    if (field) currentSort.field = field;
    if (direction) currentSort.direction = direction;
    var arr = list || tasks.slice();
    var dir = currentSort.direction === 'asc' ? 1 : -1;

    arr.sort(function (a, b) {
      var va = a[currentSort.field];
      var vb = b[currentSort.field];
      if (currentSort.field === 'priority') {
        va = PRIORITIES.indexOf(va);
        vb = PRIORITIES.indexOf(vb);
      }
      if (va < vb) return -1 * dir;
      if (va > vb) return 1 * dir;
      return 0;
    });

    return arr;
  }

  // ── Rendering ────────────────────────────────────────────────────

  function renderTasks() {
    var container = document.getElementById('task-list');
    if (!container) return;

    var filtered = filterTasks();
    if (filtered.length === 0) {
      container.innerHTML =
        '<div class="tasks-empty"><p>No tasks found. Create one to get started!</p></div>';
      return;
    }

    var html = '';
    for (var i = 0; i < filtered.length; i++) {
      var t = filtered[i];
      var checked = t.status === 'done' ? ' checked' : '';
      var doneClass = t.status === 'done' ? ' task-item--done' : '';
      var fmtDate = window.SynapseApp ? window.SynapseApp.formatDate(t.createdAt) : t.createdAt;

      html +=
        '<div class="task-item task-item--' + esc(t.priority) + doneClass + '" data-task-id="' + esc(t.id) + '">' +
          '<div class="task-item-main">' +
            '<label class="task-checkbox">' +
              '<input type="checkbox" data-toggle-task="' + esc(t.id) + '"' + checked + '>' +
              '<span class="task-title">' + esc(t.title) + '</span>' +
            '</label>' +
            '<div class="task-meta">' +
              '<span class="task-badge task-badge--' + esc(t.priority) + '">' + esc(t.priority) + '</span>' +
              '<span class="task-badge task-badge--status-' + esc(t.status) + '">' + esc(t.status) + '</span>' +
              '<span class="task-badge task-badge--category">' + esc(t.category) + '</span>' +
              '<span class="task-date">' + esc(fmtDate) + '</span>' +
            '</div>' +
          '</div>' +
          '<div class="task-description">' + esc(t.description) + '</div>' +
          '<div class="task-actions">' +
            '<button class="task-btn task-btn--edit" data-edit-task="' + esc(t.id) + '" title="Edit">&#9998;</button>' +
            '<button class="task-btn task-btn--delete" data-delete-task="' + esc(t.id) + '" title="Delete">&times;</button>' +
          '</div>' +
        '</div>';
    }
    container.innerHTML = html;
  }

  function renderStats() {
    var container = document.getElementById('task-stats');
    if (!container) return;

    var stats = getStats();
    container.innerHTML =
      '<div class="task-stat"><span class="task-stat-count">' + stats.total + '</span><span class="task-stat-label">Total</span></div>' +
      '<div class="task-stat"><span class="task-stat-count">' + stats.todo + '</span><span class="task-stat-label">To Do</span></div>' +
      '<div class="task-stat"><span class="task-stat-count">' + stats.inProgress + '</span><span class="task-stat-label">In Progress</span></div>' +
      '<div class="task-stat"><span class="task-stat-count">' + stats.done + '</span><span class="task-stat-label">Done</span></div>';
  }

  function getStats() {
    var stats = { total: tasks.length, todo: 0, inProgress: 0, done: 0 };
    for (var i = 0; i < tasks.length; i++) {
      if (tasks[i].status === 'todo') stats.todo++;
      else if (tasks[i].status === 'in-progress') stats.inProgress++;
      else if (tasks[i].status === 'done') stats.done++;
    }
    return stats;
  }

  // ── Task Form (Modal) ───────────────────────────────────────────

  function showTaskForm(taskId) {
    var task = taskId ? getTask(taskId) : null;
    var modalId = 'task-modal';
    var modal = document.getElementById(modalId);
    if (!modal) return;

    var form = modal.querySelector('#task-form');
    if (!form) return;

    var titleInput = form.querySelector('[name="title"]');
    var descInput = form.querySelector('[name="description"]');
    var priorityInput = form.querySelector('[name="priority"]');
    var statusInput = form.querySelector('[name="status"]');
    var categoryInput = form.querySelector('[name="category"]');
    var idInput = form.querySelector('[name="task-id"]');
    var heading = modal.querySelector('.modal-title');

    if (titleInput) titleInput.value = task ? task.title : '';
    if (descInput) descInput.value = task ? task.description : '';
    if (priorityInput) priorityInput.value = task ? task.priority : 'medium';
    if (statusInput) statusInput.value = task ? task.status : 'todo';
    if (categoryInput) categoryInput.value = task ? task.category : 'general';
    if (idInput) idInput.value = task ? task.id : '';
    if (heading) heading.textContent = task ? 'Edit Task' : 'Add Task';

    if (window.SynapseApp) window.SynapseApp.openModal(modalId);
  }

  function handleFormSubmit(form) {
    var titleInput = form.querySelector('[name="title"]');
    var descInput = form.querySelector('[name="description"]');
    var priorityInput = form.querySelector('[name="priority"]');
    var statusInput = form.querySelector('[name="status"]');
    var categoryInput = form.querySelector('[name="category"]');
    var idInput = form.querySelector('[name="task-id"]');

    var title = titleInput ? titleInput.value.trim() : '';
    if (!title) {
      if (window.SynapseApp) window.SynapseApp.showToast('Title is required', 'error');
      return;
    }

    var data = {
      title: title,
      description: descInput ? descInput.value.trim() : '',
      priority: priorityInput ? priorityInput.value : 'medium',
      status: statusInput ? statusInput.value : 'todo',
      category: categoryInput ? categoryInput.value : 'general'
    };

    var existingId = idInput ? idInput.value : '';
    if (existingId) {
      updateTask(existingId, data);
      if (window.SynapseApp) window.SynapseApp.showToast('Task updated!', 'success');
    } else {
      addTask(data);
    }

    if (window.SynapseApp) window.SynapseApp.closeModal('task-modal');
  }

  // ── Event Listeners ──────────────────────────────────────────────

  function initEventListeners() {
    var debounce = window.SynapseApp ? window.SynapseApp.debounce : function (fn) { return fn; };

    document.addEventListener('click', function (e) {
      // Toggle task status
      if (e.target.dataset && e.target.dataset.toggleTask) {
        e.stopPropagation();
        toggleComplete(e.target.dataset.toggleTask);
        return;
      }

      // Delete task
      var deleteBtn = e.target.closest('[data-delete-task]');
      if (deleteBtn) {
        deleteTask(deleteBtn.dataset.deleteTask);
        return;
      }

      // Edit task
      var editBtn = e.target.closest('[data-edit-task]');
      if (editBtn) {
        showTaskForm(editBtn.dataset.editTask);
        return;
      }

      // Add task button
      if (e.target.closest('#task-add-btn')) {
        showTaskForm(null);
        return;
      }
    });

    // Form submit
    document.addEventListener('submit', function (e) {
      if (e.target.id === 'task-form') {
        e.preventDefault();
        handleFormSubmit(e.target);
      }
    });

    // Filters
    var filterEls = ['task-filter-status', 'task-filter-priority', 'task-filter-category'];
    for (var i = 0; i < filterEls.length; i++) {
      (function (elId) {
        var el = document.getElementById(elId);
        if (!el) return;
        el.addEventListener('change', function () {
          var key = elId.replace('task-filter-', '');
          var filter = {};
          filter[key] = el.value;
          filterTasks(filter);
          renderTasks();
        });
      })(filterEls[i]);
    }

    // Search
    var searchInput = document.getElementById('task-search');
    if (searchInput) {
      searchInput.addEventListener('input', debounce(function () {
        filterTasks({ search: searchInput.value });
        renderTasks();
      }, 300));
    }

    // Sort
    var sortEl = document.getElementById('task-sort');
    if (sortEl) {
      sortEl.addEventListener('change', function () {
        var parts = sortEl.value.split('-');
        currentSort.field = parts[0];
        currentSort.direction = parts[1] || 'desc';
        renderTasks();
      });
    }
  }

  // ── Initialization ───────────────────────────────────────────────

  function init() {
    loadTasks();
    renderStats();
    renderTasks();
    initEventListeners();
  }

  document.addEventListener('DOMContentLoaded', init);

  window.SynapseTasks = {
    init: init,
    addTask: addTask,
    updateTask: updateTask,
    deleteTask: deleteTask,
    toggleComplete: toggleComplete,
    filterTasks: filterTasks
  };
})();
