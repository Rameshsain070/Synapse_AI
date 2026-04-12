/**
 * Synapse AI - Theme Management
 * Dark/light theme switching with localStorage persistence.
 */
(function () {
  'use strict';

  var STORAGE_KEY = 'synapse-theme';
  var DEFAULT_THEME = 'dark';

  function getTheme() {
    try {
      return localStorage.getItem(STORAGE_KEY) || DEFAULT_THEME;
    } catch (e) {
      return DEFAULT_THEME;
    }
  }

  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    updateToggleIcon(theme);
  }

  function updateToggleIcon(theme) {
    var btn = document.querySelector('.theme-toggle');
    if (!btn) return;
    btn.setAttribute('aria-label', theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');
    btn.textContent = theme === 'dark' ? '\u2600\uFE0F' : '\uD83C\uDF19';
  }

  function toggleTheme() {
    var current = getTheme();
    var next = current === 'dark' ? 'light' : 'dark';
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch (e) {
      // Storage unavailable
    }
    applyTheme(next);
    return next;
  }

  function init() {
    var theme = getTheme();
    applyTheme(theme);

    var btn = document.querySelector('.theme-toggle');
    if (btn) {
      btn.addEventListener('click', function () {
        toggleTheme();
      });
    }
  }

  document.addEventListener('DOMContentLoaded', init);

  window.SynapseTheme = {
    toggle: toggleTheme,
    get: getTheme,
    init: init
  };
})();
