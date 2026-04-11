/**
 * Synapse AI – AI Integration Module
 *
 * Provides the AI chat sidebar, task prioritization UI, smart
 * recommendations display, and streaming LLM responses.
 * Depends on SynapseAPI (api-client.js) being loaded first.
 */

/* global SynapseAPI, document, window */

var SynapseAI = (function () {
  'use strict';

  // ---------------------------------------------------------------------------
  // State
  // ---------------------------------------------------------------------------

  var _chatHistory = [];
  var _chatContainer = null;
  var _chatInput = null;
  var _chatSend = null;
  var _sidebar = null;
  var _streamController = null;

  // ---------------------------------------------------------------------------
  // Initialisation
  // ---------------------------------------------------------------------------

  function init(opts) {
    opts = opts || {};
    _sidebar = document.getElementById(opts.sidebarId || 'ai-sidebar');
    _chatContainer = document.getElementById(opts.chatContainerId || 'ai-chat-messages');
    _chatInput = document.getElementById(opts.chatInputId || 'ai-chat-input');
    _chatSend = document.getElementById(opts.chatSendId || 'ai-chat-send');

    if (_chatSend) {
      _chatSend.addEventListener('click', function () { _sendMessage(); });
    }
    if (_chatInput) {
      _chatInput.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); _sendMessage(); }
      });
    }
  }

  // ---------------------------------------------------------------------------
  // Chat
  // ---------------------------------------------------------------------------

  function _appendBubble(role, text) {
    if (!_chatContainer) return;
    var div = document.createElement('div');
    div.className = 'ai-bubble ai-bubble--' + role;
    div.textContent = text;
    _chatContainer.appendChild(div);
    _chatContainer.scrollTop = _chatContainer.scrollHeight;
    return div;
  }

  function _sendMessage() {
    if (!_chatInput) return;
    var text = _chatInput.value.trim();
    if (!text) return;
    _chatInput.value = '';

    _chatHistory.push({ role: 'user', content: text });
    _appendBubble('user', text);

    // If the backend is connected, stream from LLM; otherwise local fallback
    if (SynapseAPI && SynapseAPI.isAuthenticated()) {
      var bubble = _appendBubble('assistant', '');
      var fullText = '';
      _streamController = SynapseAPI.chatStream(
        _chatHistory,
        function onChunk(chunk) {
          fullText += chunk;
          bubble.textContent = fullText;
          _chatContainer.scrollTop = _chatContainer.scrollHeight;
        },
        function onDone() {
          _chatHistory.push({ role: 'assistant', content: fullText || 'No response.' });
          if (!fullText) bubble.textContent = 'No response.';
          _streamController = null;
        }
      );
    } else {
      // Offline / not authenticated – provide a helpful stub
      var reply = _offlineReply(text);
      _chatHistory.push({ role: 'assistant', content: reply });
      _appendBubble('assistant', reply);
    }
  }

  function _offlineReply(text) {
    var lower = text.toLowerCase();
    if (lower.includes('priorit'))
      return 'To get AI priority suggestions, connect to the Synapse AI backend. In the meantime, consider urgency + importance to set High/Medium/Low.';
    if (lower.includes('due') || lower.includes('deadline'))
      return 'Due date prediction requires the AI backend. A good rule of thumb: small tasks → 1-2 days, medium → 1 week, large → 2+ weeks.';
    if (lower.includes('help'))
      return 'I can help with:\n• Task prioritisation\n• Due date suggestions\n• Breaking tasks into steps\n• Smart recommendations\n\nConnect the backend for full AI power!';
    return 'I\'m Synapse AI. Connect the FastAPI backend for full intelligence. Type "help" for tips!';
  }

  // ---------------------------------------------------------------------------
  // Sidebar toggle
  // ---------------------------------------------------------------------------

  function toggleSidebar() {
    if (!_sidebar) return;
    _sidebar.classList.toggle('open');
  }

  function openSidebar() {
    if (_sidebar) _sidebar.classList.add('open');
  }

  function closeSidebar() {
    if (_sidebar) _sidebar.classList.remove('open');
  }

  // ---------------------------------------------------------------------------
  // AI Suggestions UI
  // ---------------------------------------------------------------------------

  function showSuggestions(taskId, container) {
    if (!SynapseAPI || !SynapseAPI.isAuthenticated()) {
      _renderFallbackSuggestions(container);
      return;
    }
    container.innerHTML = '<p class="ai-loading">🤖 Analysing task…</p>';
    SynapseAPI.getAISuggestions(taskId)
      .then(function (data) { _renderSuggestions(data, container); })
      .catch(function () { _renderFallbackSuggestions(container); });
  }

  function _renderSuggestions(data, container) {
    var html = '<div class="ai-suggestions">';
    if (data.priority_suggestion) {
      html += '<p><strong>Priority:</strong> ' + _escapeHtml(data.priority_suggestion);
      if (data.priority_score !== null && data.priority_score !== undefined) {
        html += ' <span class="ai-score">(' + (data.priority_score * 100).toFixed(0) + '%)</span>';
      }
      html += '</p>';
    }
    if (data.suggested_due_date) {
      html += '<p><strong>Suggested due:</strong> ' + _escapeHtml(data.suggested_due_date) + '</p>';
    }
    if (data.breakdown && data.breakdown.length) {
      html += '<p><strong>Steps:</strong></p><ol>';
      data.breakdown.forEach(function (s) { html += '<li>' + _escapeHtml(s) + '</li>'; });
      html += '</ol>';
    }
    if (data.recommendations && data.recommendations.length) {
      html += '<p><strong>Recommendations:</strong></p><ul>';
      data.recommendations.forEach(function (r) { html += '<li>' + _escapeHtml(r) + '</li>'; });
      html += '</ul>';
    }
    html += '</div>';
    container.innerHTML = html;
  }

  function _renderFallbackSuggestions(container) {
    container.innerHTML =
      '<div class="ai-suggestions ai-suggestions--offline">' +
      '<p>🔌 Connect to the Synapse AI backend for AI-powered suggestions.</p>' +
      '<p>Set your API URL in the settings panel to enable:</p>' +
      '<ul><li>Priority scoring</li><li>Due date prediction</li><li>Task breakdown</li><li>Smart recommendations</li></ul>' +
      '</div>';
  }

  // ---------------------------------------------------------------------------
  // Utility
  // ---------------------------------------------------------------------------

  function _escapeHtml(str) {
    var div = document.createElement('div');
    div.appendChild(document.createTextNode(str));
    return div.innerHTML;
  }

  // ---------------------------------------------------------------------------
  // Public API
  // ---------------------------------------------------------------------------

  return {
    init: init,
    toggleSidebar: toggleSidebar,
    openSidebar: openSidebar,
    closeSidebar: closeSidebar,
    showSuggestions: showSuggestions,
  };
})();
