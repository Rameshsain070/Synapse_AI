/**
 * Synapse AI – Authentication Module
 *
 * User registration, login, session creation, JWT token management,
 * auto-logout on 401, and protected route helpers.
 *
 * Depends on: SynapseUI (ui.js)
 *
 * Uses the shared global state at window.SA.
 */

/* global window, document, localStorage, fetch, SynapseUI */

var SynapseAuth = (function () {
  'use strict';

  var K = {
    URL:   'synapse_api_url',
    USER:  'synapse_user_token',
    SESS:  'synapse_session_token',
    EMAIL: 'synapse_user_email',
    SID:   'synapse_current_session_id'
  };

  /* ── Storage helpers ── */
  function ls(k) { try { return localStorage.getItem(k) || ''; } catch (e) { return ''; } }
  function ss(k, v) { try { localStorage.setItem(k, v); } catch (e) { /* ignore */ } }
  function rs(k) { try { localStorage.removeItem(k); } catch (e) { /* ignore */ } }

  /* ── State access ── */
  function S() { return window.SA; }

  /* ── HTTP helpers ── */
  function base() { return S().apiUrl.replace(/\/+$/, ''); }

  function extractErr(e) {
    if (!e) return 'Unknown error';
    if (typeof e === 'string') return e;
    if (typeof e.detail === 'string') return e.detail;
    if (Array.isArray(e.detail)) return e.detail.map(function (d) { return d.msg || JSON.stringify(d); }).join(', ');
    return JSON.stringify(e);
  }

  /* ── Auth API calls ── */
  function login(email, pw) {
    var body = new URLSearchParams({ username: email, password: pw, grant_type: 'password' }).toString();
    return fetch(base() + '/api/v1/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: body
    }).then(function (r) {
      if (!r.ok) return r.json().catch(function () { return { detail: r.statusText }; }).then(function (e) { throw new Error(extractErr(e)); });
      return r.json();
    }).then(function (data) {
      S().userToken = data.access_token;
      S().userEmail = email;
      ss(K.USER, data.access_token);
      ss(K.EMAIL, email);
      return data;
    });
  }

  function register(email, pw) {
    return fetch(base() + '/api/v1/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email, password: pw })
    }).then(function (r) {
      if (!r.ok) return r.json().catch(function () { return { detail: r.statusText }; }).then(function (e) { throw new Error(extractErr(e)); });
      return r.json();
    }).then(function (data) {
      S().userToken = data.token.access_token;
      S().userEmail = email;
      ss(K.USER, data.token.access_token);
      ss(K.EMAIL, email);
      return data;
    });
  }

  function createSession(name) {
    return fetch(base() + '/api/v1/auth/session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + S().userToken },
      body: name ? JSON.stringify({ name: name }) : undefined
    }).then(function (r) {
      if (!r.ok) return r.json().catch(function () { return {}; }).then(function (e) { throw new Error(extractErr(e)); });
      return r.json();
    }).then(function (sess) {
      S().currentSessionId = sess.session_id;
      S().sessionToken = sess.token.access_token;
      ss(K.SESS, sess.token.access_token);
      ss(K.SID, sess.session_id);
      return sess;
    });
  }

  function getSessions() {
    return fetch(base() + '/api/v1/auth/sessions', {
      headers: { 'Authorization': 'Bearer ' + S().userToken }
    }).then(function (r) {
      if (!r.ok) throw new Error('Failed to load sessions');
      return r.json();
    });
  }

  function logout() {
    [K.USER, K.SESS, K.EMAIL, K.SID].forEach(rs);
    var s = S();
    s.userToken = s.sessionToken = s.userEmail = s.currentSessionId = '';
    s.messages = [];
    s.tasks = [];
    s.sessions = [];
  }

  /* ── Restore state from storage ── */
  function restoreState() {
    var s = S();
    var stored = ls(K.URL);
    if (stored) s.apiUrl = stored;
    s.userToken = ls(K.USER);
    s.sessionToken = ls(K.SESS);
    s.userEmail = ls(K.EMAIL);
    s.currentSessionId = ls(K.SID);
  }

  function isLoggedIn() {
    return !!S().userToken;
  }

  function saveApiUrl(url) {
    S().apiUrl = url;
    ss(K.URL, url);
  }

  function clearApiUrl() {
    rs(K.URL);
    S().apiUrl = '';
  }

  /* ── Public API ── */
  return {
    K: K,
    login: login,
    register: register,
    createSession: createSession,
    getSessions: getSessions,
    logout: logout,
    restoreState: restoreState,
    isLoggedIn: isLoggedIn,
    saveApiUrl: saveApiUrl,
    clearApiUrl: clearApiUrl
  };
})();
