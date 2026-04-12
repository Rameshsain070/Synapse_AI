/**
 * Synapse AI – API Configuration
 *
 * Manages the backend API URL, validates connectivity, and persists
 * the setting in localStorage so the user only has to configure once.
 */

/* global localStorage, fetch */

var SynapseConfig = (function () {
  'use strict';

  var STORAGE_KEY = 'synapse_api_url';

  /**
   * Return the stored API base URL (without a trailing slash).
   * @returns {string}
   */
  function getApiUrl() {
    try {
      return (localStorage.getItem(STORAGE_KEY) || '').replace(/\/+$/, '');
    } catch (_) {
      return '';
    }
  }

  /**
   * Persist a new API base URL.
   * @param {string} url
   */
  function setApiUrl(url) {
    var clean = (url || '').replace(/\/+$/, '');
    try {
      localStorage.setItem(STORAGE_KEY, clean);
    } catch (_) { /* storage unavailable */ }
    return clean;
  }

  /**
   * Remove the stored API URL (e.g. on "change backend").
   */
  function clearApiUrl() {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (_) { /* ignore */ }
  }

  /**
   * Check whether an API URL has been configured.
   * @returns {boolean}
   */
  function isConfigured() {
    return !!getApiUrl();
  }

  /**
   * Validate connectivity by hitting the /api/v1/health endpoint.
   * Resolves with the health JSON on success, rejects on failure.
   *
   * @param {string} [url] – URL to test; defaults to the stored URL.
   * @returns {Promise<object>}
   */
  function validateConnection(url) {
    var base = (url || getApiUrl()).replace(/\/+$/, '');
    if (!base) return Promise.reject(new Error('No API URL provided'));

    return fetch(base + '/api/v1/health', { method: 'GET' })
      .then(function (res) {
        if (!res.ok) throw new Error('Health check failed (' + res.status + ')');
        return res.json();
      })
      .then(function (data) {
        if (data && data.status === 'healthy') return data;
        throw new Error('Unexpected health response');
      });
  }

  return {
    getApiUrl: getApiUrl,
    setApiUrl: setApiUrl,
    clearApiUrl: clearApiUrl,
    isConfigured: isConfigured,
    validateConnection: validateConnection,
  };
})();
