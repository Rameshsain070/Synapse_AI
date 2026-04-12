/**
 * Synapse AI - Main Application
 * Shared utilities: toasts, modals, FAQ accordion, escapeHtml, demo banner.
 */
(function () {
  'use strict';

  // ── Toast Notifications ──────────────────────────────────────────

  function ensureToastContainer() {
    var container = document.getElementById('synapse-toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'synapse-toast-container';
      container.setAttribute('role', 'status');
      container.setAttribute('aria-live', 'polite');
      container.style.cssText =
        'position:fixed;top:1rem;right:1rem;z-index:10000;display:flex;flex-direction:column;gap:0.5rem;pointer-events:none;';
      document.body.appendChild(container);
    }
    return container;
  }

  function showToast(message, type, duration) {
    type = type || 'info';
    duration = duration !== undefined ? duration : 3000;

    var container = ensureToastContainer();
    var toast = document.createElement('div');
    toast.className = 'synapse-toast synapse-toast--' + type;
    toast.style.cssText =
      'pointer-events:auto;padding:0.75rem 1.25rem;border-radius:0.5rem;color:#fff;font-size:0.9rem;' +
      'opacity:0;transform:translateX(100%);transition:all 0.3s ease;max-width:360px;word-break:break-word;';

    var bgMap = { info: '#3b82f6', success: '#22c55e', warning: '#f59e0b', error: '#ef4444' };
    toast.style.background = bgMap[type] || bgMap.info;
    toast.textContent = message;

    container.appendChild(toast);

    // Trigger enter animation
    requestAnimationFrame(function () {
      toast.style.opacity = '1';
      toast.style.transform = 'translateX(0)';
    });

    if (duration > 0) {
      setTimeout(function () { removeToast(toast); }, duration);
    }
    return toast;
  }

  function removeToast(toast) {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(100%)';
    setTimeout(function () {
      if (toast.parentNode) toast.parentNode.removeChild(toast);
    }, 300);
  }

  // ── FAQ Accordion ────────────────────────────────────────────────

  function initFAQ() {
    document.addEventListener('click', function (e) {
      var question = e.target.closest('.faq-question');
      if (!question) return;

      var item = question.closest('.faq-item');
      if (!item) return;

      var isActive = item.classList.contains('active');

      // Close all items
      var allItems = document.querySelectorAll('.faq-item');
      for (var i = 0; i < allItems.length; i++) {
        allItems[i].classList.remove('active');
      }

      // Toggle the clicked one
      if (!isActive) {
        item.classList.add('active');
      }
    });
  }

  // ── Modal System ─────────────────────────────────────────────────

  function openModal(id) {
    var modal = document.getElementById(id);
    if (!modal) return;
    modal.classList.add('modal-open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';

    // Focus the first focusable element
    var focusable = modal.querySelector('input, textarea, select, button, [tabindex]');
    if (focusable) focusable.focus();
  }

  function closeModal(id) {
    var modal = document.getElementById(id);
    if (!modal) return;
    modal.classList.remove('modal-open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  function initModals() {
    // Close on overlay/backdrop click (only direct clicks, not clicks on modal content)
    document.addEventListener('click', function (e) {
      if (e.target.classList.contains('modal-overlay')) {
        var modal = e.target.closest('.modal');
        if (modal && modal.id) closeModal(modal.id);
      } else if (e.target.classList.contains('modal') && e.target.id) {
        closeModal(e.target.id);
      }
      // Close button
      if (e.target.closest('.modal-close')) {
        var parent = e.target.closest('.modal');
        if (parent && parent.id) closeModal(parent.id);
      }
    });

    // Close on Escape
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') {
        var openModals = document.querySelectorAll('.modal.modal-open');
        for (var i = 0; i < openModals.length; i++) {
          closeModal(openModals[i].id);
        }
      }
    });
  }

  // ── Utilities ────────────────────────────────────────────────────

  function formatDate(date) {
    if (!(date instanceof Date)) date = new Date(date);
    if (isNaN(date.getTime())) return '';
    var opts = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return date.toLocaleDateString(undefined, opts);
  }

  function generateId() {
    return 'id_' + Math.random().toString(36).substring(2, 11) + Date.now().toString(36);
  }

  function debounce(fn, delay) {
    var timer;
    return function () {
      var context = this;
      var args = arguments;
      clearTimeout(timer);
      timer = setTimeout(function () {
        fn.apply(context, args);
      }, delay);
    };
  }

  function escapeHtml(str) {
    if (typeof str !== 'string') return '';
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  // ── Demo Mode Banner ────────────────────────────────────────────

  function initDemoBanner() {
    var backendUrl;
    try {
      backendUrl = localStorage.getItem('synapse-backend-url');
    } catch (e) {
      backendUrl = null;
    }

    if (backendUrl) return;

    var banner = document.createElement('div');
    banner.id = 'synapse-demo-banner';
    banner.setAttribute('role', 'status');
    banner.style.cssText =
      'position:fixed;bottom:0;left:0;right:0;z-index:9999;text-align:center;padding:0.4rem 1rem;' +
      'font-size:0.8rem;background:linear-gradient(90deg,#6366f1,#8b5cf6);color:#fff;opacity:0.92;';
    banner.textContent = '\uD83D\uDEE0\uFE0F Running in Demo Mode \u2014 No backend connected';
    document.body.appendChild(banner);
  }

  // ── Initialization ───────────────────────────────────────────────

  function init() {
    initFAQ();
    initModals();
    initDemoBanner();
  }

  document.addEventListener('DOMContentLoaded', init);

  window.SynapseApp = {
    showToast: showToast,
    openModal: openModal,
    closeModal: closeModal,
    formatDate: formatDate,
    generateId: generateId,
    debounce: debounce,
    escapeHtml: escapeHtml,
    init: init
  };
})();
