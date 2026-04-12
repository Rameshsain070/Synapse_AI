/**
 * Synapse AI – Full API Client
 *
 * Self-contained module that wraps every Synapse AI backend endpoint:
 *   • Authentication  (register, login, logout)
 *   • Session CRUD    (create, list, switch)
 *   • Chat            (streaming SSE + regular)
 *   • Tasks           (CRUD, AI suggestions, semantic search)
 *
 * Depends on SynapseConfig (api-config.js) being loaded first for the
 * base URL, but can also be configured directly via configure().
 *
 * Token management: user JWT is stored under `synapse_user_token`,
 * session JWT under `synapse_session_token` in localStorage.
 */

/* global localStorage, fetch, AbortController, SynapseConfig */

var SynapseClient = (function () {
  'use strict';

  // ── Keys ──────────────────────────────────────────────────────────────────
  var TOKEN_KEY = 'synapse_user_token';
  var SESSION_TOKEN_KEY = 'synapse_session_token';
  var MAX_RETRIES = 2;

  // ── Internal state ────────────────────────────────────────────────────────
  var _baseUrl = '';
  var _userToken = '';
  var _sessionToken = '';

  // ── Configuration ─────────────────────────────────────────────────────────

  /**
   * Manually set the API base URL and/or tokens.
   * @param {{ baseUrl?: string, userToken?: string, sessionToken?: string }} opts
   */
  function configure(opts) {
    if (opts.baseUrl) _baseUrl = opts.baseUrl.replace(/\/+$/, '');
    if (opts.userToken) { _userToken = opts.userToken; _store(TOKEN_KEY, _userToken); }
    if (opts.sessionToken) { _sessionToken = opts.sessionToken; _store(SESSION_TOKEN_KEY, _sessionToken); }
  }

  function _base() {
    if (_baseUrl) return _baseUrl;
    if (typeof SynapseConfig !== 'undefined') return SynapseConfig.getApiUrl();
    return '';
  }

  // ── Storage helpers ───────────────────────────────────────────────────────
  function _store(k, v) { try { localStorage.setItem(k, v); } catch (_) {} }
  function _load(k) { try { return localStorage.getItem(k) || ''; } catch (_) { return ''; } }
  function _remove(k) { try { localStorage.removeItem(k); } catch (_) {} }

  // ── Token helpers ─────────────────────────────────────────────────────────
  function getUserToken() { if (!_userToken) _userToken = _load(TOKEN_KEY); return _userToken; }
  function getSessionToken() { if (!_sessionToken) _sessionToken = _load(SESSION_TOKEN_KEY); return _sessionToken; }
  function isAuthenticated() { return !!getUserToken(); }

  function clearTokens() {
    _userToken = ''; _sessionToken = '';
    _remove(TOKEN_KEY); _remove(SESSION_TOKEN_KEY);
  }

  // ── HTTP helpers ──────────────────────────────────────────────────────────
  function _headers(useSession) {
    var tok = useSession ? getSessionToken() : getUserToken();
    var h = { 'Content-Type': 'application/json' };
    if (tok) h['Authorization'] = 'Bearer ' + tok;
    return h;
  }

  function _request(method, path, body, useSession, attempt, contentType) {
    attempt = attempt || 0;
    var url = _base() + path;
    var h = _headers(useSession);
    if (contentType) h['Content-Type'] = contentType;

    var opts = { method: method, headers: h };
    if (body !== undefined && body !== null) {
      opts.body = (typeof body === 'string') ? body : JSON.stringify(body);
    }

    return fetch(url, opts).then(function (res) {
      if (res.status === 204) return null;
      if (res.ok) return res.json();
      // Retry 5xx
      if (res.status >= 500 && attempt < MAX_RETRIES) {
        return new Promise(function (resolve) {
          setTimeout(function () {
            resolve(_request(method, path, body, useSession, attempt + 1, contentType));
          }, 1000 * (attempt + 1));
        });
      }
      return res.json().then(function (err) {
        var msg = _extractErr(err);
        throw new Error(msg);
      });
    });
  }

  function _extractErr(e) {
    if (!e) return 'Unknown error';
    if (typeof e === 'string') return e;
    if (typeof e.detail === 'string') return e.detail;
    if (Array.isArray(e.detail)) return e.detail.map(function (d) { return d.msg || JSON.stringify(d); }).join(', ');
    return JSON.stringify(e);
  }

  // ── Auth ───────────────────────────────────────────────────────────────────

  function register(email, password) {
    return _request('POST', '/api/v1/auth/register', { email: email, password: password })
      .then(function (data) {
        if (data && data.token && data.token.access_token) {
          _userToken = data.token.access_token;
          _store(TOKEN_KEY, _userToken);
        }
        return data;
      });
  }

  function login(email, password) {
    var formBody = new URLSearchParams({
      username: email,
      password: password,
      grant_type: 'password',
    }).toString();
    return _request('POST', '/api/v1/auth/login', formBody, false, 0, 'application/x-www-form-urlencoded')
      .then(function (data) {
        if (data && data.access_token) {
          _userToken = data.access_token;
          _store(TOKEN_KEY, _userToken);
        }
        return data;
      });
  }

  function logout() { clearTokens(); }

  // ── Sessions ──────────────────────────────────────────────────────────────

  function createSession(name) {
    return _request('POST', '/api/v1/auth/session', name ? { name: name } : undefined)
      .then(function (data) {
        if (data && data.token && data.token.access_token) {
          _sessionToken = data.token.access_token;
          _store(SESSION_TOKEN_KEY, _sessionToken);
        }
        return data;
      });
  }

  function listSessions() {
    return _request('GET', '/api/v1/auth/sessions');
  }

  // ── Chat (SSE streaming) ──────────────────────────────────────────────────

  /**
   * Stream chat via SSE. Returns an AbortController the caller can use to
   * cancel the stream.
   *
   * @param {Array}    messages  – Array of { role, content } objects.
   * @param {Function} onChunk  – Called with each text chunk.
   * @param {Function} onDone   – Called when the stream finishes.
   * @param {Function} [onError] – Called on error.
   * @returns {AbortController}
   */
  function chatStream(messages, onChunk, onDone, onError) {
    var url = _base() + '/api/v1/chatbot/chat/stream';
    var controller = new AbortController();

    fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + getSessionToken(),
      },
      body: JSON.stringify({ messages: messages }),
      signal: controller.signal,
    })
      .then(function (res) {
        if (!res.ok) throw new Error('Stream request failed (' + res.status + ')');
        var reader = res.body.getReader();
        var decoder = new TextDecoder();
        var buffer = '';

        function read() {
          reader.read().then(function (result) {
            if (result.done) { if (onDone) onDone(); return; }
            buffer += decoder.decode(result.value, { stream: true });
            var lines = buffer.split('\n');
            buffer = lines.pop() || '';
            lines.forEach(function (line) {
              var trimmed = line.trim();
              if (!trimmed.startsWith('data:')) return;
              var json = trimmed.slice(5).trim();
              if (json === '[DONE]') { if (onDone) onDone(); return; }
              try {
                var parsed = JSON.parse(json);
                if (parsed.done) { if (onDone) onDone(); return; }
                if (parsed.content && onChunk) onChunk(parsed.content);
              } catch (_) { /* skip unparseable chunks */ }
            });
            read();
          });
        }
        read();
      })
      .catch(function (err) {
        if (err.name !== 'AbortError') {
          if (onError) onError(err);
        }
      });

    return controller;
  }

  function getMessages() {
    return _request('GET', '/api/v1/chatbot/messages', null, true);
  }

  function clearMessages() {
    return _request('DELETE', '/api/v1/chatbot/messages', null, true);
  }

  // ── Tasks ─────────────────────────────────────────────────────────────────

  function createTask(task) {
    return _request('POST', '/api/v1/tasks', task);
  }

  function listTasks(filters) {
    var params = [];
    if (filters) {
      if (filters.completed !== undefined && filters.completed !== null) params.push('completed=' + filters.completed);
      if (filters.priority) params.push('priority=' + encodeURIComponent(filters.priority));
      if (filters.category) params.push('category=' + encodeURIComponent(filters.category));
    }
    var qs = params.length ? '?' + params.join('&') : '';
    return _request('GET', '/api/v1/tasks' + qs);
  }

  function getTask(taskId) {
    return _request('GET', '/api/v1/tasks/' + taskId);
  }

  function updateTask(taskId, updates) {
    return _request('PUT', '/api/v1/tasks/' + taskId, updates);
  }

  function deleteTask(taskId) {
    return _request('DELETE', '/api/v1/tasks/' + taskId);
  }

  function getAISuggestions(taskId) {
    return _request('GET', '/api/v1/tasks/' + taskId + '/ai-suggestions');
  }

  function searchTasks(query) {
    return _request('POST', '/api/v1/tasks/search', { query: query });
  }

  // ── Public API ────────────────────────────────────────────────────────────

  return {
    configure: configure,
    getUserToken: getUserToken,
    getSessionToken: getSessionToken,
    isAuthenticated: isAuthenticated,
    clearTokens: clearTokens,
    register: register,
    login: login,
    logout: logout,
    createSession: createSession,
    listSessions: listSessions,
    chatStream: chatStream,
    getMessages: getMessages,
    clearMessages: clearMessages,
    createTask: createTask,
    listTasks: listTasks,
    getTask: getTask,
    updateTask: updateTask,
    deleteTask: deleteTask,
    getAISuggestions: getAISuggestions,
    searchTasks: searchTasks,
  };
})();
