/**
 * Synapse AI – Main Application
 *
 * Application initialization, event listeners, routing, UI state
 * management, session handling, and auto-reconnection.
 *
 * Pre-configured Railway backend:
 *   https://synapseai-production-3489.up.railway.app
 *
 * Depends on: SynapseUI (ui.js), SynapseAuth (auth.js),
 *             SynapseChat (chat.js), SynapseTasks (tasks.js)
 *
 * Uses the shared global state at window.SA.
 */

/* global window, document, SynapseUI, SynapseAuth, SynapseChat, SynapseTasks */

(function () {
  'use strict';

  /* ── Default backend URL — sourced from SynapseAPI to avoid duplication ── */
  var DEFAULT_API_URL = (typeof SynapseAPI !== 'undefined' && SynapseAPI.DEFAULT_API_URL)
    ? SynapseAPI.DEFAULT_API_URL
    : 'https://synapseai-production-3489.up.railway.app';

  /* ── Shared application state ── */
  window.SA = {
    apiUrl: DEFAULT_API_URL,
    userToken: '',
    sessionToken: '',
    userEmail: '',
    currentSessionId: '',
    sessions: [],
    messages: [],
    tasks: [],
    taskFilter: 'all',
    taskSearch: '',
    editingId: null,
    streaming: false,
    theme: 'light'
  };

  function S() { return window.SA; }

  /* ── Sessions ── */
  function renderSessions() {
    var c = document.getElementById('sessions-list');
    if (!c) return;
    c.innerHTML = '';
    if (!S().sessions.length) {
      c.innerHTML = '<div class="text-xs" style="padding:.35rem .75rem;color:var(--text2)">No sessions yet</div>';
      return;
    }
    S().sessions.forEach(function (s) {
      var el = document.createElement('div');
      el.className = 'sess-item' + (s.session_id === S().currentSessionId ? ' active' : '');
      el.innerHTML = '<span class="sess-title">' + SynapseUI.esc(s.name || 'Chat ' + (s.session_id || '').slice(0, 6)) + '</span>';
      el.addEventListener('click', function () { switchSession(s); });
      c.appendChild(el);
    });
  }

  async function loadSessions() {
    try {
      var list = await SynapseAuth.getSessions();
      S().sessions = Array.isArray(list) ? list : [];
      renderSessions();
    } catch (e) { /* non-fatal */ }
  }

  async function createNewSession(name) {
    try {
      var sess = await SynapseAuth.createSession(name || 'New Chat');
      S().sessions.unshift(sess);
      renderSessions();
      S().messages = [];
      SynapseChat.renderMessages();
      SynapseUI.toast('New chat session created', 'success');
    } catch (e) {
      SynapseUI.toast('Session error: ' + e.message, 'error');
    }
  }

  async function switchSession(sess) {
    S().currentSessionId = sess.session_id;
    S().sessionToken = sess.token.access_token;
    try { localStorage.setItem('synapse_session_token', sess.token.access_token); } catch (e) { /* ignore */ }
    try { localStorage.setItem('synapse_current_session_id', sess.session_id); } catch (e) { /* ignore */ }
    renderSessions();
    await SynapseChat.loadMessages();
    SynapseUI.toast('Switched: ' + (sess.name || 'Chat'), 'info');
    SynapseUI.closeSidebar();
  }

  /* ── Enter app (after login) ── */
  var _healthInterval = null;
  async function enterApp() {
    SynapseUI.showScreen('app');
    var emailEl = document.getElementById('user-email-display');
    var avEl = document.getElementById('user-avatar');
    if (emailEl) emailEl.textContent = S().userEmail || 'User';
    if (avEl && S().userEmail) avEl.textContent = S().userEmail[0].toUpperCase();

    /* Initial health check */
    checkHealth();

    /* Periodic health checks every 30 seconds for auto-reconnect */
    if (_healthInterval) clearInterval(_healthInterval);
    _healthInterval = setInterval(checkHealth, 30000);

    await loadSessions();

    if (!S().sessionToken) {
      try { await createNewSession('My Chat'); } catch (e) { /* non-fatal */ }
    }
    if (S().sessionToken) {
      await SynapseChat.loadMessages();
    }
    SynapseUI.showView('chat');
  }

  function checkHealth() {
    var base = S().apiUrl.replace(/\/+$/, '');
    fetch(base + '/health', { method: 'GET' })
      .then(function (r) {
        if (!r.ok) throw new Error('HTTP ' + r.status);
        return r.json();
      })
      .then(function (data) {
        var ok = data && (data.status === 'healthy' || data.status === 'ok');
        SynapseUI.setStatus(ok !== false);
        updateConnectionBanner(true);
      })
      .catch(function () {
        SynapseUI.setStatus(false);
        updateConnectionBanner(false);
      });
  }

  function updateConnectionBanner(online) {
    var banner = document.getElementById('connection-banner');
    if (!banner) return;
    if (online) {
      banner.classList.add('hidden');
    } else {
      banner.classList.remove('hidden');
    }
  }

  /* ── Initialize app ── */
  async function init() {
    SynapseAuth.restoreState();

    var savedTheme = SynapseUI.getStoredTheme();
    S().theme = SynapseUI.applyTheme(savedTheme || (window.matchMedia('(prefers-color-scheme:dark)').matches ? 'dark' : 'light'));

    /* Auto-connect: if no API URL is stored, use the default Railway URL */
    if (!S().apiUrl) {
      S().apiUrl = DEFAULT_API_URL;
    }

    /* Pre-fill setup URL */
    var setupUrl = document.getElementById('setup-url');
    if (setupUrl && !setupUrl.value) {
      setupUrl.value = S().apiUrl;
    }

    /* If we have an API URL, try to skip setup */
    if (S().apiUrl) {
      if (S().userToken) {
        await enterApp();
        return;
      }
      /* Have URL but not logged in: go to auth screen */
      SynapseUI.showScreen('auth');
      return;
    }

    /* No URL configured: show setup */
    SynapseUI.showScreen('setup');
  }

  /* ── Bind all event listeners ── */
  document.addEventListener('DOMContentLoaded', function () {

    /* Setup screen */
    var setupUrl = document.getElementById('setup-url');
    var setupBtn = document.getElementById('setup-connect-btn');
    var setupStatus = document.getElementById('setup-status');
    if (setupBtn) {
      setupBtn.addEventListener('click', async function () {
        var url = setupUrl ? setupUrl.value.trim() : '';
        if (!url) { setupStatus.textContent = 'Please enter a URL'; setupStatus.style.color = 'var(--danger)'; return; }
        if (!/^https?:\/\/.+/.test(url)) { setupStatus.textContent = 'Please enter a valid URL starting with http:// or https://'; setupStatus.style.color = 'var(--danger)'; return; }
        setupBtn.disabled = true; setupBtn.textContent = 'Testing\u2026';
        setupStatus.textContent = 'Connecting\u2026'; setupStatus.style.color = 'var(--text2)';
        try {
          var cleanUrl = url.replace(/\/+$/, '');
          var r = await fetch(cleanUrl + '/health');
          var d = await r.json();
          SynapseAuth.saveApiUrl(cleanUrl);
          setupStatus.textContent = '\u2705 Connected!' + (d.version ? ' (v' + d.version + ')' : '');
          setupStatus.style.color = 'var(--success)';
          setTimeout(function () { SynapseUI.showScreen('auth'); }, 600);
        } catch (e) {
          var errMsg = 'Cannot reach backend.';
          if (e.message && e.message.indexOf('Failed to fetch') !== -1) {
            errMsg = '\u274C Cannot reach backend. Possible causes:\n\u2022 Backend is not running\n\u2022 CORS not configured (add your GitHub Pages URL to ALLOWED_ORIGINS)\n\u2022 URL is incorrect';
          } else if (e.message) {
            errMsg = '\u274C Connection error: ' + e.message;
          } else {
            errMsg = '\u274C Cannot reach backend. Check URL and CORS settings.';
          }
          setupStatus.textContent = errMsg;
          setupStatus.style.color = 'var(--danger)';
          setupStatus.style.whiteSpace = 'pre-line';
        } finally {
          setupBtn.disabled = false; setupBtn.textContent = 'Connect & Continue \u2192';
        }
      });
    }
    if (setupUrl) setupUrl.addEventListener('keydown', function (e) { if (e.key === 'Enter' && setupBtn) setupBtn.click(); });

    /* Auth tabs */
    document.querySelectorAll('.auth-tab').forEach(function (tab) {
      tab.addEventListener('click', function () {
        document.querySelectorAll('.auth-tab').forEach(function (t) { t.classList.remove('active'); });
        tab.classList.add('active');
        var name = tab.getAttribute('data-tab');
        document.getElementById('login-form').classList.toggle('hidden', name !== 'login');
        document.getElementById('register-form').classList.toggle('hidden', name !== 'register');
      });
    });

    /* Login */
    var loginBtn = document.getElementById('login-btn');
    if (loginBtn) {
      loginBtn.addEventListener('click', async function () {
        var email = document.getElementById('login-email').value.trim();
        var pw = document.getElementById('login-password').value;
        var errEl = document.getElementById('login-error');
        if (!email || !pw) { errEl.textContent = 'Email and password required'; errEl.classList.remove('hidden'); return; }
        loginBtn.disabled = true; loginBtn.textContent = 'Signing in\u2026'; errEl.classList.add('hidden');
        try {
          await SynapseAuth.login(email, pw);
          SynapseUI.toast('Welcome back, ' + email + '!', 'success');
          await enterApp();
        } catch (e) { errEl.textContent = e.message; errEl.classList.remove('hidden'); }
        finally { loginBtn.disabled = false; loginBtn.textContent = 'Sign In'; }
      });
    }
    ['login-email','login-password'].forEach(function (id) {
      var el = document.getElementById(id);
      if (el) el.addEventListener('keydown', function (e) { if (e.key === 'Enter' && loginBtn) loginBtn.click(); });
    });

    /* Register */
    var regBtn = document.getElementById('reg-btn');
    if (regBtn) {
      regBtn.addEventListener('click', async function () {
        var email = document.getElementById('reg-email').value.trim();
        var pw = document.getElementById('reg-password').value;
        var errEl = document.getElementById('reg-error');
        if (!email || !pw) { errEl.textContent = 'Email and password required'; errEl.classList.remove('hidden'); return; }
        regBtn.disabled = true; regBtn.textContent = 'Creating account\u2026'; errEl.classList.add('hidden');
        try {
          await SynapseAuth.register(email, pw);
          SynapseUI.toast('Account created! Welcome, ' + email + '!', 'success');
          await enterApp();
        } catch (e) { errEl.textContent = e.message; errEl.classList.remove('hidden'); }
        finally { regBtn.disabled = false; regBtn.textContent = 'Create Account'; }
      });
    }
    ['reg-email','reg-password'].forEach(function (id) {
      var el = document.getElementById(id);
      if (el) el.addEventListener('keydown', function (e) { if (e.key === 'Enter' && regBtn) regBtn.click(); });
    });

    /* Change backend */
    var changeLink = document.getElementById('change-backend-link');
    if (changeLink) {
      changeLink.addEventListener('click', function () {
        SynapseAuth.clearApiUrl();
        SynapseUI.showScreen('setup');
      });
    }

    /* Nav links */
    document.querySelectorAll('.nav-link[data-view]').forEach(function (link) {
      link.addEventListener('click', function () {
        var v = link.getAttribute('data-view');
        SynapseUI.showView(v);
        if (v === 'tasks' && !S().tasks.length) SynapseTasks.loadTasks();
        SynapseUI.closeSidebar();
      });
    });

    /* New session */
    function handleNewSession() {
      var name = prompt('Session name (optional):') || 'New Chat';
      createNewSession(name);
    }
    var ns1 = document.getElementById('new-session-btn');
    var ns2 = document.getElementById('new-session-btn2');
    if (ns1) ns1.addEventListener('click', handleNewSession);
    if (ns2) ns2.addEventListener('click', handleNewSession);

    /* Logout */
    var logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', function () {
        if (!confirm('Sign out of Synapse AI?')) return;
        SynapseAuth.logout();
        SynapseUI.showScreen('auth');
        SynapseUI.toast('Signed out', 'info');
      });
    }

    /* Theme */
    var themeBtn = document.getElementById('theme-toggle-btn');
    if (themeBtn) themeBtn.addEventListener('click', function () {
      S().theme = SynapseUI.applyTheme(S().theme === 'dark' ? 'light' : 'dark');
    });

    /* Hamburger */
    var hamburger = document.getElementById('hamburger');
    if (hamburger) {
      hamburger.addEventListener('click', function () {
        SynapseUI.toggleSidebar();
      });
    }
    var sov = document.getElementById('sidebar-overlay');
    if (sov) sov.addEventListener('click', SynapseUI.closeSidebar);

    /* Chat textarea */
    var chatTa = document.getElementById('chat-ta');
    if (chatTa) {
      chatTa.addEventListener('input', function () { this.style.height = 'auto'; this.style.height = Math.min(this.scrollHeight, 120) + 'px'; });
      chatTa.addEventListener('keydown', function (e) { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); SynapseChat.sendChat(); } });
    }
    var sendBtn = document.getElementById('send-btn');
    if (sendBtn) sendBtn.addEventListener('click', SynapseChat.sendChat);

    var clearChatBtn = document.getElementById('clear-chat-btn');
    if (clearChatBtn) clearChatBtn.addEventListener('click', SynapseChat.clearChat);

    /* Add task */
    var addTaskBtn = document.getElementById('add-task-btn');
    if (addTaskBtn) addTaskBtn.addEventListener('click', SynapseTasks.addTask);
    var newTitleEl = document.getElementById('new-task-title');
    if (newTitleEl) newTitleEl.addEventListener('keydown', function (e) { if (e.key === 'Enter') SynapseTasks.addTask(); });

    /* Task search */
    var tsearch = document.getElementById('task-search-input');
    if (tsearch) tsearch.addEventListener('input', function () { S().taskSearch = this.value; SynapseTasks.renderTasks(); });

    /* Filter buttons */
    document.querySelectorAll('.fbtn').forEach(function (btn) {
      btn.addEventListener('click', function () {
        document.querySelectorAll('.fbtn').forEach(function (b) { b.classList.remove('active'); });
        btn.classList.add('active');
        S().taskFilter = btn.getAttribute('data-filter');
        SynapseTasks.renderTasks();
      });
    });

    /* Edit modal */
    var closeEdit = document.getElementById('close-edit-modal');
    var cancelEdit = document.getElementById('cancel-edit');
    var saveEditBtn = document.getElementById('save-edit');
    if (closeEdit) closeEdit.addEventListener('click', SynapseTasks.closeEditModal);
    if (cancelEdit) cancelEdit.addEventListener('click', SynapseTasks.closeEditModal);
    if (saveEditBtn) saveEditBtn.addEventListener('click', SynapseTasks.saveEdit);
    var editModal = document.getElementById('edit-modal');
    if (editModal) editModal.addEventListener('click', function (e) { if (e.target === this) SynapseTasks.closeEditModal(); });

    /* AI Search modal */
    var aiSearchBtn = document.getElementById('ai-search-btn');
    if (aiSearchBtn) aiSearchBtn.addEventListener('click', function () { document.getElementById('ai-search-modal').classList.remove('hidden'); document.getElementById('ai-q').focus(); });
    var closeAiSearch = document.getElementById('close-ai-search');
    if (closeAiSearch) closeAiSearch.addEventListener('click', function () { document.getElementById('ai-search-modal').classList.add('hidden'); });
    var aiSearchModal = document.getElementById('ai-search-modal');
    if (aiSearchModal) aiSearchModal.addEventListener('click', function (e) { if (e.target === this) this.classList.add('hidden'); });
    var runSearch = document.getElementById('run-ai-search');
    if (runSearch) runSearch.addEventListener('click', function () { var q = document.getElementById('ai-q').value.trim(); if (q) SynapseTasks.runAISearch(q); });
    var aiQEl = document.getElementById('ai-q');
    if (aiQEl) aiQEl.addEventListener('keydown', function (e) { if (e.key === 'Enter') { var q = this.value.trim(); if (q) SynapseTasks.runAISearch(q); } });

    /* Global Escape key */
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') {
        SynapseTasks.closeEditModal();
        var aim = document.getElementById('ai-search-modal');
        if (aim) aim.classList.add('hidden');
      }
    });

    init();
  });

})();
