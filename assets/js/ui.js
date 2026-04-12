/**
 * Synapse AI – UI Helpers
 *
 * Toast notifications, screen/view management, theme toggle,
 * loading states, and utility functions.
 */

/* global document, window, localStorage */

var SynapseUI = (function () {
  'use strict';

  /* ── HTML escape ── */
  function esc(s) {
    var d = document.createElement('div');
    d.appendChild(document.createTextNode(s || ''));
    return d.innerHTML;
  }

  /* ── Date formatting ── */
  var MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  function fmtDate(s) {
    if (!s) return '';
    var p = s.split('-');
    if (p.length !== 3) return s;
    var mIdx = parseInt(p[1], 10) - 1;
    if (mIdx < 0 || mIdx > 11) return s;
    return MONTHS[mIdx] + ' ' + parseInt(p[2], 10) + ', ' + p[0];
  }

  function isOverdue(s) {
    if (!s) return false;
    var today = new Date();
    today.setHours(0, 0, 0, 0);
    var d = new Date(s + 'T00:00:00');
    return !isNaN(d.getTime()) && d < today;
  }

  /* ── Toast notifications ── */
  function toast(msg, type) {
    var c = document.getElementById('toast-wrap');
    if (!c) return;
    var el = document.createElement('div');
    el.className = 'toast ' + (type || 'info');
    el.textContent = msg;
    c.appendChild(el);
    setTimeout(function () {
      el.classList.add('out');
      setTimeout(function () { el.remove(); }, 260);
    }, 2800);
  }

  /* ── Screen management ── */
  function showScreen(name) {
    ['setup', 'auth', 'app'].forEach(function (s) {
      var el = document.getElementById('screen-' + s);
      if (el) el.classList.toggle('hidden', s !== name);
    });
  }

  /* ── View switching (chat / tasks) ── */
  function showView(name) {
    ['chat', 'tasks'].forEach(function (v) {
      var el = document.getElementById('view-' + v);
      if (el) el.classList.toggle('hidden', v !== name);
    });
    document.querySelectorAll('.nav-link[data-view]').forEach(function (l) {
      l.classList.toggle('active', l.getAttribute('data-view') === name);
    });
    var titles = { chat: '\uD83D\uDCAC AI Chat', tasks: '\u2705 Tasks' };
    var el = document.getElementById('topbar-title');
    if (el) el.textContent = titles[name] || '';
  }

  /* ── Theme ── */
  function applyTheme(t) {
    document.documentElement.setAttribute('data-theme', t);
    try { localStorage.setItem('synapse_theme', t); } catch (e) { /* ignore */ }
    var ic = document.getElementById('theme-icon');
    if (ic) ic.textContent = t === 'dark' ? '\u2600' : '\uD83C\uDF19';
    return t;
  }

  function getStoredTheme() {
    try { return localStorage.getItem('synapse_theme') || ''; } catch (e) { return ''; }
  }

  /* ── Status indicator ── */
  function setStatus(ok) {
    var d = document.getElementById('status-dot');
    var t = document.getElementById('status-text');
    if (d) d.className = 'status-dot' + (ok ? '' : ' offline');
    if (t) t.textContent = ok ? 'Connected' : 'Offline';
  }

  /* ── Sidebar ── */
  function closeSidebar() {
    var sb = document.getElementById('sidebar');
    var ov = document.getElementById('sidebar-overlay');
    if (sb) sb.classList.remove('open');
    if (ov) ov.classList.remove('open');
  }

  function toggleSidebar() {
    var sb = document.getElementById('sidebar');
    var ov = document.getElementById('sidebar-overlay');
    if (sb) sb.classList.toggle('open');
    if (ov) ov.classList.toggle('open');
  }

  /* ── Public API ── */
  return {
    esc: esc,
    fmtDate: fmtDate,
    isOverdue: isOverdue,
    toast: toast,
    showScreen: showScreen,
    showView: showView,
    applyTheme: applyTheme,
    getStoredTheme: getStoredTheme,
    setStatus: setStatus,
    closeSidebar: closeSidebar,
    toggleSidebar: toggleSidebar
  };
})();
