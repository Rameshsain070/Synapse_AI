/**
 * Synapse AI – API Client
 *
 * Full API integration with the Synapse AI FastAPI backend.
 * Handles JWT authentication, task CRUD, AI suggestions,
 * semantic search, chat streaming, and automatic retry logic.
 *
 * Backend URL is configured dynamically via the setup screen
 * and stored in localStorage.
 */

/* global localStorage, fetch, AbortController */

var SynapseAPI = (function () {
  'use strict';

  // Backend URL — configured dynamically via the setup screen.
  // Other modules reference SynapseAPI.DEFAULT_API_URL.
  var DEFAULT_API_URL = '';
  var TOKEN_KEY = 'synapse_user_token';
  var SESSION_TOKEN_KEY = 'synapse_session_token';
  var MAX_RETRIES = 3;
  var REQUEST_TIMEOUT_MS = 30000;

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

  /** Wrap fetch with a timeout so requests don't hang forever. */
  function _fetchWithTimeout(url, opts, timeoutMs) {
    timeoutMs = timeoutMs || REQUEST_TIMEOUT_MS;
    var controller = new AbortController();
    opts.signal = controller.signal;
    var timer = setTimeout(function () { controller.abort(); }, timeoutMs);
    return fetch(url, opts).finally(function () { clearTimeout(timer); });
  }

  /** Classify a fetch error into a user-friendly message. */
  function _friendlyNetworkError(err) {
    if (!err) return 'Unknown network error';
    var msg = err.message || '';
    console.error('[SynapseAI] Network error:', msg, err);
    if (err.name === 'AbortError' || msg.indexOf('aborted') !== -1) {
      return 'Request timed out — the backend may be slow or unreachable. Please try again.';
    }
    if (msg.indexOf('Failed to fetch') !== -1 || msg.indexOf('NetworkError') !== -1 || msg.indexOf('Network request failed') !== -1) {
      return 'Cannot reach the backend. Check your internet connection and ensure the backend URL is correct and CORS is configured.';
    }
    if (msg.indexOf('CORS') !== -1 || msg.indexOf('blocked') !== -1) {
      return 'CORS error — the backend must allow requests from ' + window.location.origin + '. Check the ALLOWED_ORIGINS setting.';
    }
    return msg || 'Unknown network error';
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
    return _fetchWithTimeout(url, opts).then(function (res) {
      if (res.status === 204) return null;
      if (res.ok) return res.json();
      if (res.status >= 500 && attempt < MAX_RETRIES) {
        var delay = Math.min(1000 * Math.pow(2, attempt), 8000);
        return new Promise(function (resolve) {
          setTimeout(function () {
            resolve(_request(method, path, body, useSession, attempt + 1, contentType));
          }, delay);
        });
      }
      return res.json().catch(function () { return { detail: res.statusText }; }).then(function (err) {
        var msg = _extractErr(err);
        throw new Error(msg);
      });
    }).catch(function (err) {
      console.error('[SynapseAI] API request failed:', method, path, err);
      if (err instanceof Error && (err.message.indexOf('Cannot reach') !== -1 || err.message.indexOf('CORS') !== -1 || err.message.indexOf('timed out') !== -1)) {
        throw err;
      }
      if (err.name === 'AbortError' || (err.message && (err.message.indexOf('Failed to fetch') !== -1 || err.message.indexOf('NetworkError') !== -1))) {
        if (attempt < MAX_RETRIES) {
          var retryDelay = Math.min(1000 * Math.pow(2, attempt), 8000);
          console.warn('[SynapseAI] Retrying request (attempt ' + (attempt + 1) + '/' + MAX_RETRIES + '):', method, path);
          return new Promise(function (resolve) {
            setTimeout(function () {
              resolve(_request(method, path, body, useSession, attempt + 1, contentType));
            }, retryDelay);
          });
        }
        throw new Error(_friendlyNetworkError(err));
      }
      throw err;
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
  var STREAM_TIMEOUT_MS = 60000;
  function chatStream(messages, onChunk, onDone, onError) {
    var url = _baseUrl + '/api/v1/chatbot/chat/stream';
    var controller = new AbortController();
    var streamTimer = setTimeout(function () {
      controller.abort();
      if (onError) onError(new Error('Stream timed out after ' + (STREAM_TIMEOUT_MS / 1000) + 's — the AI may be taking too long. Please try again.'));
    }, STREAM_TIMEOUT_MS);
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
            if (result.done) { clearTimeout(streamTimer); if (onDone) onDone(); return; }
            clearTimeout(streamTimer);
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
          }).catch(function (err) {
            clearTimeout(streamTimer);
            if (err.name !== 'AbortError' && onError) onError(err);
          });
        }
        read();
      })
      .catch(function (err) {
        clearTimeout(streamTimer);
        if (err.name === 'AbortError') return;
        if (onError) onError(new Error(_friendlyNetworkError(err)));
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
    console.log('[SynapseAI] Validating connection to:', testUrl);
    return _fetchWithTimeout(testUrl + '/health', {}, 10000).then(function (r) {
      if (!r.ok) throw new Error('Health check returned HTTP ' + r.status);
      return r.json();
    }).then(function (data) {
      console.log('[SynapseAI] Health check response:', data);
      if (data && data.status === 'healthy') return data;
      if (data && typeof data === 'object') return data;
      throw new Error('Unexpected health response');
    }).catch(function (err) {
      console.error('[SynapseAI] Connection validation failed:', err);
      throw new Error(_friendlyNetworkError(err));
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
    friendlyNetworkError: _friendlyNetworkError,
  };
})();
