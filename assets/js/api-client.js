/**
 * Synapse AI – API Client
 *
 * Connects the frontend to-do application to the FastAPI backend.
 * Handles JWT authentication, task CRUD, AI suggestions, and
 * semantic search with automatic retry logic.
 */

/* global localStorage, fetch, AbortController */

var SynapseAPI = (function () {
  'use strict';

  // ---------------------------------------------------------------------------
  // Configuration
  // ---------------------------------------------------------------------------

  var _baseUrl = '';   // Set via configure()
  var _token   = '';   // JWT bearer token
  var TOKEN_KEY = 'synapse_user_token';
  var MAX_RETRIES = 2;

  // ---------------------------------------------------------------------------
  // Public: configure
  // ---------------------------------------------------------------------------

  function configure(opts) {
    if (opts.baseUrl) _baseUrl = opts.baseUrl.replace(/\/+$/, '');
    if (opts.token) {
      _token = opts.token;
      localStorage.setItem(TOKEN_KEY, _token);
    }
  }

  function getToken() {
    if (!_token) _token = localStorage.getItem(TOKEN_KEY) || '';
    return _token;
  }

  function clearToken() {
    _token = '';
    localStorage.removeItem(TOKEN_KEY);
  }

  function isAuthenticated() {
    return !!getToken();
  }

  // ---------------------------------------------------------------------------
  // Internal: HTTP helpers
  // ---------------------------------------------------------------------------

  function _headers() {
    var h = { 'Content-Type': 'application/json' };
    var t = getToken();
    if (t) h['Authorization'] = 'Bearer ' + t;
    return h;
  }

  function _request(method, path, body, attempt) {
    attempt = attempt || 0;
    var url = _baseUrl + path;

    var opts = {
      method: method,
      headers: _headers(),
    };
    if (body !== undefined && body !== null) {
      opts.body = JSON.stringify(body);
    }

    return fetch(url, opts)
      .then(function (res) {
        if (res.status === 204) return null;
        if (res.ok) return res.json();
        // Retry on 5xx
        if (res.status >= 500 && attempt < MAX_RETRIES) {
          return new Promise(function (resolve) {
            setTimeout(function () {
              resolve(_request(method, path, body, attempt + 1));
            }, 1000 * (attempt + 1));
          });
        }
        return res.json().then(function (err) {
          var msg = (err && err.detail) || res.statusText;
          throw new Error(msg);
        });
      });
  }

  // ---------------------------------------------------------------------------
  // Auth
  // ---------------------------------------------------------------------------

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
    // The backend expects form data for login
    var url = _baseUrl + '/api/v1/auth/login';
    var formBody = 'username=' + encodeURIComponent(email) +
                   '&password=' + encodeURIComponent(password) +
                   '&grant_type=password';
    return fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: formBody,
    })
      .then(function (res) {
        if (!res.ok) return res.json().then(function (e) { throw new Error(e.detail || res.statusText); });
        return res.json();
      })
      .then(function (data) {
        if (data && data.access_token) {
          configure({ token: data.access_token });
        }
        return data;
      });
  }

  function logout() {
    clearToken();
  }

  // ---------------------------------------------------------------------------
  // Tasks CRUD
  // ---------------------------------------------------------------------------

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

  // ---------------------------------------------------------------------------
  // AI
  // ---------------------------------------------------------------------------

  function getAISuggestions(taskId) {
    return _request('GET', '/api/v1/tasks/' + taskId + '/ai-suggestions');
  }

  function searchTasks(query) {
    return _request('POST', '/api/v1/tasks/search', { query: query });
  }

  // ---------------------------------------------------------------------------
  // Chatbot (passthrough to existing chatbot API)
  // ---------------------------------------------------------------------------

  function chatStream(messages, onChunk, onDone) {
    var url = _baseUrl + '/api/v1/chatbot/chat/stream';
    var controller = new AbortController();

    fetch(url, {
      method: 'POST',
      headers: _headers(),
      body: JSON.stringify({ messages: messages }),
      signal: controller.signal,
    })
      .then(function (res) {
        if (!res.ok) throw new Error('Stream request failed');
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
              if (line.startsWith('data: ')) {
                try {
                  var parsed = JSON.parse(line.slice(6));
                  if (parsed.done) { if (onDone) onDone(); return; }
                  if (parsed.content && onChunk) onChunk(parsed.content);
                } catch (_) { /* ignore parse errors */ }
              }
            });
            read();
          });
        }
        read();
      })
      .catch(function (err) {
        if (err.name !== 'AbortError') console.error('Stream error:', err);
      });

    return controller; // caller can call controller.abort()
  }

  // ---------------------------------------------------------------------------
  // Public API
  // ---------------------------------------------------------------------------

  return {
    configure: configure,
    getToken: getToken,
    clearToken: clearToken,
    isAuthenticated: isAuthenticated,
    register: register,
    login: login,
    logout: logout,
    createTask: createTask,
    listTasks: listTasks,
    getTask: getTask,
    updateTask: updateTask,
    deleteTask: deleteTask,
    getAISuggestions: getAISuggestions,
    searchTasks: searchTasks,
    chatStream: chatStream,
  };
})();
