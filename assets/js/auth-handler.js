/**
 * Synapse AI – Authentication Handler
 *
 * Manages the full authentication lifecycle:
 *   • Register a new account
 *   • Login with existing credentials
 *   • JWT token persistence (localStorage)
 *   • Automatic logout on 401 responses
 *   • Session creation after login
 *
 * Depends on SynapseClient (synapse-api-client.js) for HTTP calls
 * and SynapseConfig (api-config.js) for the API base URL.
 */

/* global localStorage, SynapseClient, SynapseConfig */

var SynapseAuth = (function () {
  'use strict';

  // ── Storage keys ──────────────────────────────────────────────────────────
  var TOKEN_KEY     = 'synapse_user_token';
  var SESSION_KEY   = 'synapse_session_token';
  var USER_KEY      = 'synapse_user';

  // ── Internal state ────────────────────────────────────────────────────────
  var _onLogout = null;   // callback invoked when a forced logout occurs
  var _onLogin  = null;   // callback invoked after successful login/register

  // ── Storage helpers ───────────────────────────────────────────────────────
  function _store(k, v) { try { localStorage.setItem(k, v); } catch (_) { /* ignore */ } }
  function _load(k)      { try { return localStorage.getItem(k) || ''; } catch (_) { return ''; } }
  function _remove(k)    { try { localStorage.removeItem(k); } catch (_) { /* ignore */ } }

  // ── Token helpers ─────────────────────────────────────────────────────────

  /** Check whether a user is currently authenticated. */
  function isLoggedIn() {
    return !!_load(TOKEN_KEY);
  }

  /** Return the stored user JWT (empty string when not logged in). */
  function getToken() {
    return _load(TOKEN_KEY);
  }

  /** Return the stored session JWT. */
  function getSessionToken() {
    return _load(SESSION_KEY);
  }

  /** Return the stored user object (parsed from JSON), or null. */
  function getUser() {
    var raw = _load(USER_KEY);
    if (!raw) return null;
    try { return JSON.parse(raw); } catch (_) { return null; }
  }

  // ── Authentication actions ────────────────────────────────────────────────

  /**
   * Register a new user account.
   *
   * @param {string} email
   * @param {string} password
   * @returns {Promise<object>} Resolved with user data on success.
   */
  function register(email, password) {
    return SynapseClient.register(email, password)
      .then(function (data) {
        // Store user info
        if (data && data.token && data.token.access_token) {
          _store(TOKEN_KEY, data.token.access_token);
        }
        if (data && data.id) {
          _store(USER_KEY, JSON.stringify({ id: data.id, email: data.email }));
        }
        if (_onLogin) _onLogin(data);
        return data;
      });
  }

  /**
   * Login with existing credentials.
   *
   * @param {string} email
   * @param {string} password
   * @returns {Promise<object>} Resolved with token data on success.
   */
  function login(email, password) {
    return SynapseClient.login(email, password)
      .then(function (data) {
        if (data && data.access_token) {
          _store(TOKEN_KEY, data.access_token);
        }
        if (_onLogin) _onLogin(data);
        return data;
      });
  }

  /**
   * Create a chat session after authentication.
   *
   * @param {string} [name] – Optional session display name.
   * @returns {Promise<object>} Resolved with session data.
   */
  function createSession(name) {
    return SynapseClient.createSession(name)
      .then(function (data) {
        if (data && data.token && data.token.access_token) {
          _store(SESSION_KEY, data.token.access_token);
        }
        return data;
      });
  }

  /**
   * Logout the current user.  Clears all stored tokens and user data.
   */
  function logout() {
    _remove(TOKEN_KEY);
    _remove(SESSION_KEY);
    _remove(USER_KEY);
    SynapseClient.clearTokens();
    if (_onLogout) _onLogout();
  }

  // ── 401 Interceptor ──────────────────────────────────────────────────────

  /**
   * Install a global fetch interceptor that automatically logs out the
   * user whenever a 401 Unauthorized response is received.
   *
   * Call this once during application startup.
   */
  function installAutoLogout() {
    var _origFetch = window.fetch;

    window.fetch = function () {
      return _origFetch.apply(this, arguments).then(function (response) {
        if (response.status === 401 && isLoggedIn()) {
          logout();
        }
        return response;
      });
    };
  }

  // ── Lifecycle callbacks ──────────────────────────────────────────────────

  /** Register a callback that fires after successful login or register. */
  function onLogin(cb) { _onLogin = cb; }

  /** Register a callback that fires after forced or manual logout. */
  function onLogout(cb) { _onLogout = cb; }

  // ── Public API ───────────────────────────────────────────────────────────

  return {
    isLoggedIn:         isLoggedIn,
    getToken:           getToken,
    getSessionToken:    getSessionToken,
    getUser:            getUser,
    register:           register,
    login:              login,
    createSession:      createSession,
    logout:             logout,
    installAutoLogout:  installAutoLogout,
    onLogin:            onLogin,
    onLogout:           onLogout,
  };
})();
