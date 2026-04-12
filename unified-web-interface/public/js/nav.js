/**
 * Synapse AI - Navigation
 * Mobile menu, active links, smooth scroll, and scroll-aware navbar.
 */
(function () {
  'use strict';

  var SCROLL_THRESHOLD = 50;

  function initMobileMenu() {
    var toggle = document.querySelector('.nav-hamburger');
    var navbar = document.querySelector('.navbar');
    if (!toggle || !navbar) return;

    toggle.addEventListener('click', function (e) {
      e.stopPropagation();
      navbar.classList.toggle('nav-open');
    });

    // Close when clicking a nav link
    var links = navbar.querySelectorAll('.nav-link');
    for (var i = 0; i < links.length; i++) {
      links[i].addEventListener('click', function () {
        navbar.classList.remove('nav-open');
      });
    }

    // Close when clicking outside
    document.addEventListener('click', function (e) {
      if (!navbar.contains(e.target)) {
        navbar.classList.remove('nav-open');
      }
    });
  }

  function highlightActiveLink() {
    var currentPath = window.location.pathname;
    var links = document.querySelectorAll('.nav-link');
    for (var i = 0; i < links.length; i++) {
      var link = links[i];
      link.classList.remove('active');
      try {
        var linkPath = new URL(link.href, window.location.origin).pathname;
        if (linkPath === currentPath) {
          link.classList.add('active');
        }
      } catch {
        // Invalid URL, skip
      }
    }
  }

  function initSmoothScroll() {
    document.addEventListener('click', function (e) {
      var anchor = e.target.closest('a[href^="#"]');
      if (!anchor) return;

      var targetId = anchor.getAttribute('href');
      if (targetId === '#') return;

      var target = document.querySelector(targetId);
      if (!target) return;

      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });

      // Update URL without triggering scroll
      if (window.history && window.history.pushState) {
        window.history.pushState(null, '', targetId);
      }
    });
  }

  function initScrollBehavior() {
    var navbar = document.querySelector('.navbar');
    if (!navbar) return;

    var ticking = false;
    window.addEventListener('scroll', function () {
      if (!ticking) {
        window.requestAnimationFrame(function () {
          if (window.scrollY > SCROLL_THRESHOLD) {
            navbar.classList.add('scrolled');
          } else {
            navbar.classList.remove('scrolled');
          }
          ticking = false;
        });
        ticking = true;
      }
    });
  }

  function init() {
    initMobileMenu();
    highlightActiveLink();
    initSmoothScroll();
    initScrollBehavior();
  }

  document.addEventListener('DOMContentLoaded', init);

  window.SynapseNav = {
    init: init
  };
})();
