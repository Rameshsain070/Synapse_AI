/**
 * Synapse AI – Chat Module
 *
 * AI chat functionality including sending messages, streaming SSE
 * responses, message history, session management, and rendering.
 *
 * Depends on: SynapseUI (ui.js), SynapseAuth (auth.js)
 *
 * Uses the shared global state at window.SA.
 */

/* global window, document, fetch, SynapseUI, SynapseAuth */

var SynapseChat = (function () {
  'use strict';

  function S() { return window.SA; }
  function base() { return S().apiUrl.replace(/\/+$/, ''); }

  /* ── API calls ── */
  function apiGetMessages() {
    return fetch(base() + '/api/v1/chatbot/messages', {
      headers: { 'Authorization': 'Bearer ' + S().sessionToken }
    }).then(function (r) {
      if (!r.ok) throw new Error('Failed to load messages');
      return r.json();
    });
  }

  function apiClearMessages() {
    return fetch(base() + '/api/v1/chatbot/messages', {
      method: 'DELETE',
      headers: { 'Authorization': 'Bearer ' + S().sessionToken }
    }).then(function (r) {
      if (!r.ok) throw new Error('Failed to clear messages');
    });
  }

  /* ── Streaming chat via SSE ── */
  var STREAM_TIMEOUT_MS = 60000;
  async function* streamChat(messages) {
    var controller = new AbortController();
    var timedOut = false;
    var streamTimer = setTimeout(function () {
      timedOut = true;
      controller.abort();
    }, STREAM_TIMEOUT_MS);
    var r;
    try {
      r = await fetch(base() + '/api/v1/chatbot/chat/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + S().sessionToken },
        body: JSON.stringify({ messages: messages }),
        signal: controller.signal
      });
    } catch (err) {
      clearTimeout(streamTimer);
      if (timedOut) throw new Error('Stream timed out — the AI may be taking too long. Please try again.');
      if (err.name === 'AbortError') throw new Error('Stream was cancelled.');
      var msg = err.message || '';
      if (msg.indexOf('Failed to fetch') !== -1 || msg.indexOf('NetworkError') !== -1) {
        throw new Error('Cannot reach the backend. Check your connection and ensure the backend URL is correct with CORS configured.');
      }
      throw err;
    }
    if (!r.ok) {
      clearTimeout(streamTimer);
      throw new Error('Stream failed (' + r.status + ')');
    }
    var reader = r.body.getReader();
    var dec = new TextDecoder();
    var buf = '';
    try {
      while (true) {
        var read = await reader.read();
        if (read.done) break;
        clearTimeout(streamTimer);
        buf += dec.decode(read.value, { stream: true });
        var lines = buf.split('\n');
        buf = lines.pop() || '';
        for (var i = 0; i < lines.length; i++) {
          var line = lines[i].trim();
          if (!line.startsWith('data:')) continue;
          var json = line.slice(5).trim();
          if (json === '[DONE]') return;
          try {
            var d = JSON.parse(json);
            if (d.done) return;
            if (d.content) yield d.content;
          } catch (ex) { /* skip */ }
        }
      }
    } finally {
      clearTimeout(streamTimer);
    }
  }

  /* ── Render messages ── */
  function renderMessages() {
    var area = document.getElementById('messages-area');
    if (!area) return;
    area.innerHTML = '';
    if (!S().messages.length) {
      area.innerHTML = '<div class="msg assistant"><div class="msg-av">\uD83E\uDDE0</div><div class="msg-body">Hi! I\'m Synapse AI. How can I help you today? \uD83D\uDE80</div></div>';
      return;
    }
    S().messages.forEach(function (m) {
      if (m.role === 'user' || m.role === 'assistant') appendMsg(m.role, m.content);
    });
  }

  function appendMsg(role, content) {
    var area = document.getElementById('messages-area');
    if (!area) return null;
    var msg = document.createElement('div');
    msg.className = 'msg ' + role;
    var av = document.createElement('div');
    av.className = 'msg-av';
    av.textContent = role === 'assistant' ? '\uD83E\uDDE0' : ((S().userEmail[0] || 'U').toUpperCase());
    var body = document.createElement('div');
    body.className = 'msg-body';
    body.textContent = content;
    msg.appendChild(av);
    msg.appendChild(body);
    area.appendChild(msg);
    area.scrollTop = area.scrollHeight;
    return body;
  }

  /* ── Send message with streaming ── */
  async function sendChat() {
    var ta = document.getElementById('chat-ta');
    var text = ta ? ta.value.trim() : '';
    if (!text || S().streaming) return;
    ta.value = '';
    ta.style.height = 'auto';
    if (!S().sessionToken) {
      try { await SynapseAuth.createSession('Chat'); } catch (e) {
        SynapseUI.toast('Session error: ' + e.message, 'error');
        return;
      }
      S().sessions.unshift({ session_id: S().currentSessionId, name: 'Chat' });
    }
    S().messages.push({ role: 'user', content: text });
    appendMsg('user', text);
    S().streaming = true;
    var btn = document.getElementById('send-btn');
    if (btn) btn.disabled = true;
    var area = document.getElementById('messages-area');
    var typing = document.createElement('div');
    typing.className = 'msg assistant msg-typing';
    typing.innerHTML = '<div class="msg-av">\uD83E\uDDE0</div><div class="msg-body"><span class="chat-hint">Thinking\u2026</span></div>';
    area.appendChild(typing);
    area.scrollTop = area.scrollHeight;
    var bodyEl = typing.querySelector('.msg-body');
    var full = '';
    try {
      for await (var chunk of streamChat(S().messages)) {
        if (full === '') bodyEl.textContent = '';
        full += chunk;
        bodyEl.textContent = full;
        area.scrollTop = area.scrollHeight;
      }
      typing.classList.remove('msg-typing');
      if (!full) { bodyEl.textContent = 'No response received.'; full = 'No response received.'; }
      S().messages.push({ role: 'assistant', content: full });
      SynapseUI.setStatus(true);
    } catch (e) {
      typing.classList.remove('msg-typing');
      var errMsg = e.message || 'Unknown error';
      if (errMsg.indexOf('Cannot reach') !== -1 || errMsg.indexOf('timed out') !== -1) {
        SynapseUI.setStatus(false);
      }
      bodyEl.textContent = '\u26A0 ' + errMsg;
      SynapseUI.toast('Chat error: ' + errMsg, 'error');
    } finally {
      S().streaming = false;
      if (btn) btn.disabled = false;
    }
  }

  /* ── Clear chat ── */
  async function clearChat() {
    if (!confirm('Clear chat history?')) return;
    try {
      if (S().sessionToken) await apiClearMessages();
      S().messages = [];
      renderMessages();
      SynapseUI.toast('Chat cleared', 'info');
    } catch (e) {
      SynapseUI.toast('Clear failed: ' + e.message, 'error');
    }
  }

  /* ── Load messages for current session ── */
  async function loadMessages() {
    try {
      var data = await apiGetMessages();
      S().messages = (data && data.messages) ? data.messages : [];
    } catch (e) {
      S().messages = [];
    }
    renderMessages();
  }

  /* ── Public API ── */
  return {
    renderMessages: renderMessages,
    appendMsg: appendMsg,
    sendChat: sendChat,
    clearChat: clearChat,
    loadMessages: loadMessages,
    streamChat: streamChat
  };
})();
