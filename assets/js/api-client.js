/**
 * Synapse AI – API Client
 *
 * Full API integration with the Synapse AI FastAPI backend.
 * Handles JWT authentication, task CRUD, AI suggestions,
 * semantic search, chat streaming, and automatic retry logic.
 *
 * Pre-configured with Railway backend URL.
 *
 * API_BASE = "https://synapseai-production-3489.up.railway.app/api/v1"
 */

/* global localStorage, fetch, AbortController */

var SynapseAPI = (function () {
  'use strict';

  var DEFAULT_API_URL = 'https://synapseai-production-3489.up.railway.app';
  var TOKEN_KEY = 'synapse_user_token';
  var SESSION_TOKEN_KEY = 'synapse_session_token';
  var MAX_RETRIES = 2;

  var _baseUrl = DEFAULT_API_URL;
  var _token = '';
  var _sessionToken = '';

  function configure(opts) {
    if (opts.baseUrl) _baseUrl = opts.baseUrl.replace(/\/+$/, '');
    if (opts.token) { _token = opts.token; _store(TOKEN_KEY, _token); }
    if (opts.sessionToken) { _sessionToken = opts.sessionToken; _store(SESSION_TOKEN_KEY, _sessionToken); }
  }

  function getBaseUrl() { return _baseUrl; }

  function _store(k, v) { try { localStorage.setItem(k, v); } catch (_) { /* ignore */ } }
  function _load(k) { try { return localStorage.getItem(k) || ''; } catch (_) { return ''; } }
  function _remove(k) { try { localStorage.removeItem(k); } catch (_) { /* ignore */ } }

  function getToken() { if (!_token) _token = _load(TOKEN_KEY); return _token; }
  function getSessionToken() { if (!_sessionToken) _sessionToken = _load(SESSION_TOKEN_KEY); return _sessionToken; }
  function clearToken() { _token = ''; _sessionToken = ''; _remove(TOKEN_KEY); _remove(SESSION_TOKEN_KEY); }
  function isAuthenticated() { return !!getToken(); }

  function _headers(useSession) {
    var tok = useSession ? getSessionToken() : getToken();
    var h = { 'Content-Type': 'application/json' };
    if (tok) h['Authorization'] = 'Bearer ' + tok;
    return h;
  }

  function _request(method, path, body, useSession, attempt, contentType) {
    attempt = attempt || 0;
    var url = _baseUrl + path;
    var h = _headers(useSession);
    if (contentType) h['Content-Type'] = contentType;
    var opts = { method: method, headers: h };
    if (body !== undefined && body !== null) {
      opts.body = (typeof body === 'string') ? body : JSON.stringify(body);
    }
    return fetch(url, opts).then(function (res) {
      if (res.status === 204) return null;
      if (res.ok) return res.json();
      if (res.status >= 500 && attempt < MAX_RETRIES) {
        return new Promise(function (resolve) {
          setTimeout(function () {
            resolve(_request(method, path, body, useSession, attempt + 1, contentType));
          }, 1000 * (attempt + 1));
        });
      }
      return res.json().catch(function () { return { detail: res.statusText }; }).then(function (err) {
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

  /* ── Auth ── */
  function register(email, password) {
    return _request('POST', '/api/v1/auth/register', { email: email, password: password })
      .then(function (data) {
        if (data && data.token && data.token.access_token) {
          configure({ token: data.token.access_token });
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
          configure({ token: data.access_token });
        }
        return data;
      });
  }

  function logout() { clearToken(); }

  /* ── Sessions ── */
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

  function listSessions() { return _request('GET', '/api/v1/auth/sessions'); }

  /* ── Chat (SSE streaming) ── */
  function chatStream(messages, onChunk, onDone, onError) {
    var url = _baseUrl + '/api/v1/chatbot/chat/stream';
    var controller = new AbortController();
    fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + getSessionToken() },
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
              } catch (_) { /* skip */ }
            });
            read();
          });
        }
        read();
      })
      .catch(function (err) {
        if (err.name !== 'AbortError' && onError) onError(err);
      });
    return controller;
  }

  function getMessages() { return _request('GET', '/api/v1/chatbot/messages', null, true); }
  function clearMessages() { return _request('DELETE', '/api/v1/chatbot/messages', null, true); }

  /* ── Tasks ── */
  function createTask(task) { return _request('POST', '/api/v1/tasks', task); }
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
  function getTask(taskId) { return _request('GET', '/api/v1/tasks/' + taskId); }
  function updateTask(taskId, updates) { return _request('PUT', '/api/v1/tasks/' + taskId, updates); }
  function deleteTask(taskId) { return _request('DELETE', '/api/v1/tasks/' + taskId); }
  function getAISuggestions(taskId) { return _request('GET', '/api/v1/tasks/' + taskId + '/ai-suggestions'); }
  function searchTasks(query) { return _request('POST', '/api/v1/tasks/search', { query: query }); }

  /* ── Connection validation ── */
  function validateConnection(url) {
    var testUrl = (url || _baseUrl).replace(/\/+$/, '');
    return fetch(testUrl + '/health').then(function (r) {
      if (!r.ok) throw new Error('Health check failed');
      return r.json();
    });
  }

  return {
    DEFAULT_API_URL: DEFAULT_API_URL,
    configure: configure,
    getBaseUrl: getBaseUrl,
    getToken: getToken,
    getSessionToken: getSessionToken,
    clearToken: clearToken,
    isAuthenticated: isAuthenticated,
    validateConnection: validateConnection,
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
