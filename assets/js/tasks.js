/**
 * Synapse AI – Tasks Module
 *
 * Task CRUD operations, filtering, AI suggestions, semantic search,
 * priority management, due date handling, and rendering.
 *
 * Depends on: SynapseUI (ui.js)
 *
 * Uses the shared global state at window.SA.
 */

/* global window, document, fetch, SynapseUI */

var SynapseTasks = (function () {
  'use strict';

  function S() { return window.SA; }
  function base() { return S().apiUrl.replace(/\/+$/, ''); }
  function hdr() {
    return { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + S().userToken };
  }

  /* ── API helpers ── */
  function apiReq(method, path, body) {
    var opts = { method: method, headers: hdr() };
    if (body !== undefined) opts.body = JSON.stringify(body);
    return fetch(base() + path, opts).then(function (r) {
      if (r.status === 204) return null;
      if (!r.ok) return r.json().catch(function () { return { detail: r.statusText }; }).then(function (e) {
        var msg = typeof e.detail === 'string' ? e.detail : (Array.isArray(e.detail) ? e.detail.map(function (d) { return d.msg || JSON.stringify(d); }).join(', ') : JSON.stringify(e));
        throw new Error(msg);
      });
      return r.json();
    });
  }

  function apiListTasks()        { return apiReq('GET', '/api/v1/tasks'); }
  function apiCreateTask(t)      { return apiReq('POST', '/api/v1/tasks', t); }
  function apiUpdateTask(id, t)  { return apiReq('PUT', '/api/v1/tasks/' + id, t); }
  function apiDeleteTask(id)     { return apiReq('DELETE', '/api/v1/tasks/' + id); }
  function apiAISuggestions(id)  { return apiReq('GET', '/api/v1/tasks/' + id + '/ai-suggestions'); }
  function apiSearchTasks(q)     { return apiReq('POST', '/api/v1/tasks/search', { query: q }); }

  /* ── Filtering ── */
  function filtered() {
    return S().tasks.filter(function (t) {
      if (S().taskFilter === 'active' && t.completed) return false;
      if (S().taskFilter === 'completed' && !t.completed) return false;
      if (S().taskSearch) {
        var q = S().taskSearch.toLowerCase();
        return ((t.title || '').toLowerCase().includes(q) ||
                (t.description || '').toLowerCase().includes(q) ||
                (t.category || '').toLowerCase().includes(q));
      }
      return true;
    });
  }

  /* ── Render task stats ── */
  function renderTaskStats() {
    var c = document.getElementById('task-stats-bar');
    if (!c) return;
    var total = S().tasks.length;
    var done = S().tasks.filter(function (t) { return t.completed; }).length;
    c.innerHTML =
      '<span class="stat-chip"><strong>' + total + '</strong> Total</span>' +
      '<span class="stat-chip"><strong>' + (total - done) + '</strong> Active</span>' +
      '<span class="stat-chip"><strong>' + done + '</strong> Done</span>';
  }

  /* ── Render tasks list ── */
  function renderTasks() {
    renderTaskStats();
    var wrap = document.getElementById('task-list-wrap');
    if (!wrap) return;
    var list = filtered();
    if (!list.length) {
      wrap.innerHTML = '<div class="empty-state"><div class="ei">\uD83D\uDCCB</div><h3>No tasks</h3><p>' +
        (S().taskSearch || S().taskFilter !== 'all' ? 'No tasks match your filter.' : 'Add your first task above!') + '</p></div>';
      return;
    }
    wrap.innerHTML = '';
    list.forEach(function (task) {
      var p = task.priority || 'medium';
      var ov = !task.completed && SynapseUI.isOverdue(task.due_date);
      var card = document.createElement('div');
      card.className = 'task-card' + (task.completed ? ' completed' : '');
      var cb = document.createElement('input');
      cb.type = 'checkbox';
      cb.className = 'task-cb';
      cb.checked = !!task.completed;
      cb.setAttribute('aria-label', 'Toggle complete');
      cb.addEventListener('change', function () { toggleTask(task.id, cb.checked); });
      var bwrap = document.createElement('div');
      bwrap.className = 'task-body-wrap';
      var tTitle = document.createElement('div');
      tTitle.className = 'task-title';
      tTitle.textContent = task.title;
      var meta = document.createElement('div');
      meta.className = 'task-meta-row';
      meta.innerHTML =
        '<span class="badge badge-' + p + '">' + p + '</span>' +
        (task.category ? '<span class="badge badge-cat">' + SynapseUI.esc(task.category) + '</span>' : '') +
        (task.due_date ? '<span class="badge ' + (ov ? 'badge-overdue' : 'badge-due') + '">' + (ov ? '\u26A0 ' : '\uD83D\uDCC5 ') + SynapseUI.fmtDate(task.due_date) + '</span>' : '') +
        (task.ai_priority_score != null ? '<span class="badge badge-ai">AI ' + Math.round(task.ai_priority_score * 100) + '%</span>' : '');
      bwrap.appendChild(tTitle);
      bwrap.appendChild(meta);
      var acts = document.createElement('div');
      acts.className = 'task-actions-row';
      var aiBtn = document.createElement('button');
      aiBtn.className = 'tab-btn';
      aiBtn.title = 'AI Suggestions';
      aiBtn.textContent = '\uD83E\uDD16';
      aiBtn.addEventListener('click', function () { toggleAIPanel(task, card, bwrap); });
      var editBtn = document.createElement('button');
      editBtn.className = 'tab-btn';
      editBtn.title = 'Edit';
      editBtn.textContent = '\u270F';
      editBtn.addEventListener('click', function () { openEditModal(task); });
      var delBtn = document.createElement('button');
      delBtn.className = 'tab-btn del';
      delBtn.title = 'Delete';
      delBtn.textContent = '\uD83D\uDDD1';
      delBtn.addEventListener('click', function () { deleteTask(task.id); });
      acts.appendChild(aiBtn);
      acts.appendChild(editBtn);
      acts.appendChild(delBtn);
      card.appendChild(cb);
      card.appendChild(bwrap);
      card.appendChild(acts);
      wrap.appendChild(card);
    });
  }

  /* ── Load tasks from API ── */
  async function loadTasks() {
    var wrap = document.getElementById('task-list-wrap');
    if (wrap) wrap.innerHTML = '<div class="loading-row"><span class="spinner"></span> Loading tasks\u2026</div>';
    try {
      var data = await apiListTasks();
      S().tasks = (data && data.tasks) ? data.tasks : [];
      renderTasks();
    } catch (e) {
      SynapseUI.toast('Failed to load tasks: ' + e.message, 'error');
      renderTasks();
    }
  }

  /* ── Add task ── */
  async function addTask() {
    var titleEl = document.getElementById('new-task-title');
    var title = titleEl ? titleEl.value.trim() : '';
    if (!title) { SynapseUI.toast('Please enter a task title', 'error'); if (titleEl) titleEl.focus(); return; }
    var btn = document.getElementById('add-task-btn');
    if (btn) { btn.disabled = true; btn.textContent = 'Adding\u2026'; }
    try {
      var t = await apiCreateTask({
        title: title,
        description: (document.getElementById('new-task-desc') || {}).value || '',
        priority: (document.getElementById('new-task-priority') || {}).value || 'medium',
        category: (document.getElementById('new-task-category') || {}).value || '',
        due_date: (document.getElementById('new-task-due') || {}).value || ''
      });
      S().tasks.unshift(t);
      renderTasks();
      titleEl.value = '';
      ['new-task-category','new-task-due','new-task-desc'].forEach(function (id) {
        var el = document.getElementById(id);
        if (el) el.value = '';
      });
      var prioEl = document.getElementById('new-task-priority');
      if (prioEl) prioEl.value = 'medium';
      SynapseUI.toast('Task added!', 'success');
    } catch (e) {
      SynapseUI.toast('Failed: ' + e.message, 'error');
    } finally {
      if (btn) { btn.disabled = false; btn.textContent = '+ Add Task'; }
    }
  }

  /* ── Toggle task completion ── */
  async function toggleTask(id, completed) {
    try {
      var updated = await apiUpdateTask(id, { completed: completed });
      var idx = S().tasks.findIndex(function (t) { return t.id === id; });
      if (idx !== -1) S().tasks[idx] = updated;
      renderTasks();
    } catch (e) {
      SynapseUI.toast('Update failed', 'error');
      renderTasks();
    }
  }

  /* ── Delete task ── */
  async function deleteTask(id) {
    if (!confirm('Delete this task?')) return;
    try {
      await apiDeleteTask(id);
      S().tasks = S().tasks.filter(function (t) { return t.id !== id; });
      renderTasks();
      SynapseUI.toast('Deleted', 'error');
    } catch (e) {
      SynapseUI.toast('Delete failed: ' + e.message, 'error');
    }
  }

  /* ── Edit modal ── */
  function openEditModal(task) {
    S().editingId = task.id;
    document.getElementById('edit-title').value = task.title || '';
    document.getElementById('edit-desc').value = task.description || '';
    document.getElementById('edit-priority').value = task.priority || 'medium';
    document.getElementById('edit-category').value = task.category || '';
    document.getElementById('edit-due').value = task.due_date || '';
    document.getElementById('edit-modal').classList.remove('hidden');
    document.getElementById('edit-title').focus();
  }

  function closeEditModal() {
    document.getElementById('edit-modal').classList.add('hidden');
    S().editingId = null;
  }

  async function saveEdit() {
    if (!S().editingId) return;
    var title = document.getElementById('edit-title').value.trim();
    if (!title) { SynapseUI.toast('Title required', 'error'); return; }
    var btn = document.getElementById('save-edit');
    if (btn) { btn.disabled = true; btn.textContent = 'Saving\u2026'; }
    try {
      var updated = await apiUpdateTask(S().editingId, {
        title: title,
        description: document.getElementById('edit-desc').value.trim(),
        priority: document.getElementById('edit-priority').value,
        category: document.getElementById('edit-category').value.trim(),
        due_date: document.getElementById('edit-due').value
      });
      var idx = S().tasks.findIndex(function (t) { return t.id === S().editingId; });
      if (idx !== -1) S().tasks[idx] = updated;
      closeEditModal();
      renderTasks();
      SynapseUI.toast('Task updated!', 'success');
    } catch (e) {
      SynapseUI.toast('Update failed: ' + e.message, 'error');
    } finally {
      if (btn) { btn.disabled = false; btn.textContent = 'Save Changes'; }
    }
  }

  /* ── AI suggestions panel ── */
  async function toggleAIPanel(task, card, bwrap) {
    var existing = card.querySelector('.ai-panel');
    if (existing) { existing.remove(); return; }
    var panel = document.createElement('div');
    panel.className = 'ai-panel';
    panel.innerHTML = '<div style="display:flex;align-items:center;gap:.5rem"><span class="spinner"></span><span style="color:var(--text2)">Getting AI suggestions\u2026</span></div>';
    bwrap.appendChild(panel);
    try {
      var s = await apiAISuggestions(task.id);
      var html = '<h4>\uD83E\uDD16 AI Suggestions</h4>';
      if (s.priority_suggestion) {
        html += '<p><strong>Priority:</strong> ' + SynapseUI.esc(s.priority_suggestion);
        if (s.priority_score != null) html += ' <em style="color:var(--text2)">(' + Math.round(s.priority_score * 100) + '% confidence)</em>';
        html += '</p>';
      }
      if (s.suggested_due_date) html += '<p><strong>Suggested due date:</strong> ' + SynapseUI.esc(s.suggested_due_date) + '</p>';
      if (s.breakdown && s.breakdown.length) {
        html += '<p><strong>Steps:</strong></p><ol>';
        s.breakdown.forEach(function (b) { html += '<li>' + SynapseUI.esc(b) + '</li>'; });
        html += '</ol>';
      }
      if (s.recommendations && s.recommendations.length) {
        html += '<p><strong>Recommendations:</strong></p><ul>';
        s.recommendations.forEach(function (r) { html += '<li>' + SynapseUI.esc(r) + '</li>'; });
        html += '</ul>';
      }
      panel.innerHTML = html;
      var idx = S().tasks.findIndex(function (t) { return t.id === task.id; });
      if (idx !== -1 && s.priority_score != null) S().tasks[idx].ai_priority_score = s.priority_score;
    } catch (e) {
      panel.innerHTML = '<p class="text-danger">AI suggestions failed: ' + SynapseUI.esc(e.message) + '</p>';
    }
  }

  /* ── AI semantic search ── */
  async function runAISearch(q) {
    var c = document.getElementById('ai-search-results');
    if (!c) return;
    c.innerHTML = '<div class="loading-row"><span class="spinner"></span> Searching\u2026</div>';
    try {
      var data = await apiSearchTasks(q);
      var results = (data && data.results) ? data.results : [];
      if (!results.length) {
        c.innerHTML = '<p class="text-sm" style="color:var(--text2)">No results for \u201C' + SynapseUI.esc(q) + '\u201D</p>';
        return;
      }
      c.innerHTML = '<p class="font-semibold text-sm" style="margin-bottom:.5rem">' + results.length + ' result(s) for \u201C' + SynapseUI.esc(q) + '\u201D:</p>';
      results.forEach(function (t) {
        var el = document.createElement('div');
        el.className = 'task-card';
        el.innerHTML = '<div class="task-body-wrap"><div class="task-title">' + SynapseUI.esc(t.title) + '</div>' +
          '<div class="task-meta-row"><span class="badge badge-' + (t.priority || 'medium') + '">' + (t.priority || 'medium') + '</span>' +
          (t.category ? '<span class="badge badge-cat">' + SynapseUI.esc(t.category) + '</span>' : '') + '</div></div>';
        c.appendChild(el);
      });
    } catch (e) {
      c.innerHTML = '<p class="text-danger text-sm">Search failed: ' + SynapseUI.esc(e.message) + '</p>';
    }
  }

  /* ── Public API ── */
  return {
    loadTasks: loadTasks,
    renderTasks: renderTasks,
    addTask: addTask,
    toggleTask: toggleTask,
    deleteTask: deleteTask,
    openEditModal: openEditModal,
    closeEditModal: closeEditModal,
    saveEdit: saveEdit,
    toggleAIPanel: toggleAIPanel,
    runAISearch: runAISearch
  };
})();
