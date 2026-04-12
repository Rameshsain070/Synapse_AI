/**
 * Synapse AI - Chat (Demo Mode)
 * Simulated AI chat with streaming, sessions, and markdown rendering.
 */
(function () {
  'use strict';

  var MESSAGES_KEY = 'synapse-chat-messages';
  var SESSIONS_KEY = 'synapse-chat-sessions';
  var CHAR_DELAY = 30;
  var THINK_DELAY = 500;

  var state = {
    messages: [],
    sessions: [],
    currentSessionId: null,
    isStreaming: false
  };

  // ── Persistence ──────────────────────────────────────────────────

  function loadState() {
    try {
      var msgs = localStorage.getItem(MESSAGES_KEY);
      var sess = localStorage.getItem(SESSIONS_KEY);
      state.messages = msgs ? JSON.parse(msgs) : [];
      state.sessions = sess ? JSON.parse(sess) : [];
    } catch (e) {
      state.messages = [];
      state.sessions = [];
    }
    if (state.sessions.length === 0) {
      createSession('General');
    } else if (!state.currentSessionId) {
      state.currentSessionId = state.sessions[0].id;
    }
  }

  function saveMessages() {
    try { localStorage.setItem(MESSAGES_KEY, JSON.stringify(state.messages)); } catch (e) { /* */ }
  }

  function saveSessions() {
    try { localStorage.setItem(SESSIONS_KEY, JSON.stringify(state.sessions)); } catch (e) { /* */ }
  }

  // ── Session Management ───────────────────────────────────────────

  function createSession(name) {
    var esc = window.SynapseApp ? window.SynapseApp.escapeHtml : identity;
    var id = 'sess_' + Math.random().toString(36).substring(2, 9) + Date.now().toString(36);
    var session = {
      id: id,
      name: esc(name || 'Chat ' + (state.sessions.length + 1)),
      createdAt: new Date().toISOString()
    };
    state.sessions.unshift(session);
    state.currentSessionId = id;
    saveSessions();
    renderSessions();
    renderMessages();
    return session;
  }

  function switchSession(id) {
    var found = state.sessions.find(function (s) { return s.id === id; });
    if (!found) return;
    state.currentSessionId = id;
    renderSessions();
    renderMessages();
  }

  function deleteSession(id) {
    state.sessions = state.sessions.filter(function (s) { return s.id !== id; });
    state.messages = state.messages.filter(function (m) { return m.sessionId !== id; });
    if (state.currentSessionId === id) {
      state.currentSessionId = state.sessions.length ? state.sessions[0].id : null;
    }
    saveSessions();
    saveMessages();
    if (state.sessions.length === 0) {
      createSession('General');
    }
    renderSessions();
    renderMessages();
  }

  function renderSessions() {
    var container = document.getElementById('chat-sessions');
    if (!container) return;
    var esc = window.SynapseApp ? window.SynapseApp.escapeHtml : identity;
    var html = '';
    for (var i = 0; i < state.sessions.length; i++) {
      var s = state.sessions[i];
      var active = s.id === state.currentSessionId ? ' active' : '';
      html +=
        '<div class="chat-session' + active + '" data-session-id="' + esc(s.id) + '">' +
          '<span class="chat-session-name">' + esc(s.name) + '</span>' +
          '<button class="chat-session-delete" data-delete-session="' + esc(s.id) + '" title="Delete session">&times;</button>' +
        '</div>';
    }
    container.innerHTML = html;
  }

  // ── Messages ─────────────────────────────────────────────────────

  function currentMessages() {
    return state.messages.filter(function (m) { return m.sessionId === state.currentSessionId; });
  }

  function renderMessages() {
    var container = document.getElementById('chat-messages');
    if (!container) return;
    var esc = window.SynapseApp ? window.SynapseApp.escapeHtml : identity;
    var msgs = currentMessages();
    if (msgs.length === 0) {
      container.innerHTML =
        '<div class="chat-empty">' +
          '<p>\uD83E\uDDE0 Synapse AI</p>' +
          '<p>Ask me anything! I can help with tasks, code, search, and more.</p>' +
        '</div>';
      return;
    }
    var html = '';
    for (var i = 0; i < msgs.length; i++) {
      var m = msgs[i];
      var avatar = m.role === 'user' ? '\uD83E\uDDD1' : '\uD83E\uDDE0';
      var roleClass = m.role === 'user' ? 'chat-msg--user' : 'chat-msg--ai';
      var content = m.role === 'user' ? esc(m.content) : renderMarkdown(m.content);
      var time = window.SynapseApp ? window.SynapseApp.formatDate(m.timestamp) : m.timestamp;
      html +=
        '<div class="chat-msg ' + roleClass + '">' +
          '<div class="chat-msg-avatar">' + avatar + '</div>' +
          '<div class="chat-msg-body">' +
            '<div class="chat-msg-content">' + content + '</div>' +
            '<div class="chat-msg-time">' + esc(time) + '</div>' +
          '</div>' +
        '</div>';
    }
    container.innerHTML = html;
    scrollToBottom(container);
  }

  function scrollToBottom(container) {
    if (!container) container = document.getElementById('chat-messages');
    if (container) container.scrollTop = container.scrollHeight;
  }

  // ── Markdown-lite Renderer ───────────────────────────────────────

  function renderMarkdown(text) {
    var esc = window.SynapseApp ? window.SynapseApp.escapeHtml : identity;

    // Extract fenced code blocks first to protect them
    var codeBlocks = [];
    text = text.replace(/```(\w*)\n?([\s\S]*?)```/g, function (_, lang, code) {
      var idx = codeBlocks.length;
      codeBlocks.push('<pre class="chat-code-block"><code>' + esc(code.trim()) + '</code></pre>');
      return '\x00CODEBLOCK' + idx + '\x00';
    });

    // Escape the rest
    text = esc(text);

    // Inline code
    text = text.replace(/`([^`]+)`/g, '<code class="chat-inline-code">$1</code>');

    // Bold
    text = text.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');

    // Italic
    text = text.replace(/\*(.+?)\*/g, '<em>$1</em>');

    // List items (lines starting with -)
    text = text.replace(/^- (.+)$/gm, '<li>$1</li>');
    text = text.replace(/(<li>[\s\S]*?<\/li>)/g, '<ul>$1</ul>');
    // Collapse adjacent </ul><ul>
    text = text.replace(/<\/ul>\s*<ul>/g, '');

    // Line breaks
    text = text.replace(/\n/g, '<br>');

    // Restore code blocks
    text = text.replace(/\x00CODEBLOCK(\d+)\x00/g, function (_, idx) {
      return codeBlocks[parseInt(idx, 10)];
    });

    return text;
  }

  // ── Mock AI Responses ────────────────────────────────────────────

  var RESPONSES = [
    { keywords: ['task', 'todo', 'manage'], response: "Synapse AI offers powerful task management! You can create, prioritize, and track tasks with categories like **work**, **personal**, and **learning**. Tasks support status cycling (todo → in-progress → done) and real-time filtering. Try asking me to help organize your workflow!" },
    { keywords: ['search', 'find', 'query', 'look'], response: "Our **RAG-powered search** uses Pinecone vector embeddings to find semantically relevant information — not just keyword matches. Upload documents, and I'll index them for intelligent retrieval. It's like having a research assistant with perfect memory!" },
    { keywords: ['memory', 'remember', 'context'], response: "I use a **long-term memory system** backed by vector storage. This means I can recall context from previous conversations, your preferences, and important facts you've shared. The more we interact, the more personalized my responses become." },
    { keywords: ['code', 'programming', 'function', 'python', 'javascript'], response: "Here's an example of how Synapse AI processes a query:\n\n```python\nasync def process_query(query: str):\n    # Retrieve relevant context via RAG\n    context = await rag_engine.search(query)\n    \n    # Build prompt with context\n    prompt = build_prompt(query, context)\n    \n    # Stream response from LLM\n    async for chunk in llm.stream(prompt):\n        yield chunk\n```\n\nI can help with code review, debugging, and writing code in multiple languages!" },
    { keywords: ['hello', 'hi', 'hey', 'greet'], response: "Hello! \uD83D\uDC4B I'm **Synapse AI**, your intelligent assistant. I can help you with:\n\n- **Task management** — organize your work\n- **Code assistance** — write and review code\n- **RAG search** — find information intelligently\n- **Knowledge retrieval** — leverage long-term memory\n\nWhat would you like to explore?" },
    { keywords: ['help', 'feature', 'what can'], response: "Here's everything I can help with:\n\n- **Chat** — Natural conversation with AI streaming\n- **Task management** — Create, track, and prioritize tasks\n- **RAG search** — Semantic document search\n- **Code assistance** — Write, debug, and review code\n- **Memory** — Long-term context retention\n- **Multi-model support** — Azure OpenAI, GPT-4, and more\n- **LangGraph workflows** — Complex multi-step reasoning\n\nJust ask about any topic!" },
    { keywords: ['langgraph', 'graph', 'workflow', 'agent'], response: "**LangGraph** powers our agentic workflows! It enables:\n\n- **Stateful agents** that maintain context across steps\n- **Branching logic** for complex decision trees\n- **Tool calling** to integrate external APIs\n- **Human-in-the-loop** checkpoints for critical decisions\n\nOur architecture uses a directed graph where each node is a processing step, connected by conditional edges. This allows dynamic routing based on the query type." },
    { keywords: ['pinecone', 'vector', 'embedding', 'index'], response: "**Pinecone vector database** is at the heart of our RAG engine:\n\n- Documents are chunked and embedded using OpenAI embeddings\n- Vectors are stored in Pinecone with metadata (source, timestamp, category)\n- Queries are embedded and matched against stored vectors using cosine similarity\n- Top-K results are retrieved and fed as context to the LLM\n\nThis gives us sub-second semantic search across millions of documents!" },
    { keywords: ['azure', 'openai', 'gpt', 'model', 'llm'], response: "Synapse AI integrates with **Azure OpenAI** for enterprise-grade AI:\n\n- **GPT-4** for complex reasoning and code generation\n- **GPT-3.5 Turbo** for fast, cost-effective responses\n- **Ada embeddings** for vector search\n- Custom fine-tuned models for domain-specific tasks\n\nAll API calls go through Azure's secure endpoints with built-in content filtering and compliance." },
    { keywords: ['api', 'fastapi', 'endpoint', 'rest', 'backend'], response: "Our backend runs on **FastAPI** with these key endpoints:\n\n- `POST /api/chat` — Send messages and stream responses\n- `GET /api/tasks` — Retrieve task list with filters\n- `POST /api/search` — RAG-powered semantic search\n- `GET /api/sessions` — Manage chat sessions\n- `POST /api/memory` — Store and retrieve memories\n\nAll endpoints support authentication via JWT tokens and return JSON responses." },
    { keywords: ['deploy', 'docker', 'production', 'host'], response: "Synapse AI can be deployed with **Docker Compose** in minutes:\n\n- Frontend: Static files served via Nginx\n- Backend: FastAPI on Uvicorn with auto-reload\n- Database: PostgreSQL for structured data\n- Vector DB: Pinecone (cloud) or local FAISS\n- Cache: Redis for session management\n\nCheck the `DEPLOYMENT_GUIDE.md` for step-by-step instructions!" },
    { keywords: ['database', 'postgres', 'sql', 'data'], response: "We use **PostgreSQL** for structured data storage:\n\n- User accounts and authentication\n- Chat sessions and message history\n- Task records with full CRUD\n- Audit logs and analytics\n\nFor vector data, we use Pinecone. This hybrid approach gives us the best of both relational and vector databases." },
    { keywords: ['security', 'auth', 'token', 'jwt'], response: "Security is built into every layer:\n\n- **JWT authentication** for API access\n- **CORS** configuration for frontend origins\n- **Input sanitization** to prevent XSS/injection\n- **Rate limiting** on all endpoints\n- **Azure AD** integration for enterprise SSO\n- Environment variables for secrets (never hardcoded)" },
    { keywords: ['test', 'testing', 'debug'], response: "Our testing strategy covers:\n\n- **Unit tests** — pytest for backend logic\n- **Integration tests** — API endpoint testing with httpx\n- **Frontend tests** — DOM manipulation and event handling\n- **E2E tests** — Full workflow validation\n\nRun `pytest` for backend tests or check `TEST_GUIDE.md` for complete instructions." },
    { keywords: ['thank', 'thanks', 'awesome', 'great', 'cool'], response: "You're welcome! \uD83D\uDE0A I'm here to help anytime. Feel free to ask about any Synapse AI feature, request code examples, or just chat. Let's build something amazing together!" }
  ];

  var DEFAULT_RESPONSE = "That's an interesting question! As an AI assistant powered by **Synapse AI**, I can help with a wide range of topics including task management, code assistance, semantic search, and more. Could you tell me more about what you're looking for? I'll do my best to provide a helpful and detailed response.";

  function getAIResponse(input) {
    var lower = input.toLowerCase();
    for (var i = 0; i < RESPONSES.length; i++) {
      var entry = RESPONSES[i];
      for (var j = 0; j < entry.keywords.length; j++) {
        if (lower.indexOf(entry.keywords[j]) !== -1) {
          return entry.response;
        }
      }
    }
    return DEFAULT_RESPONSE;
  }

  // ── Send Message & Streaming ─────────────────────────────────────

  function sendMessage(text) {
    if (!text || !text.trim() || state.isStreaming) return;
    text = text.trim();

    var userMsg = {
      id: genId(),
      sessionId: state.currentSessionId,
      role: 'user',
      content: text,
      timestamp: new Date().toISOString()
    };
    state.messages.push(userMsg);
    saveMessages();
    renderMessages();

    // Show typing indicator
    state.isStreaming = true;
    showTypingIndicator();

    var aiText = getAIResponse(text);
    setTimeout(function () {
      removeTypingIndicator();
      streamResponse(aiText);
    }, THINK_DELAY);
  }

  function streamResponse(text) {
    var aiMsg = {
      id: genId(),
      sessionId: state.currentSessionId,
      role: 'ai',
      content: '',
      timestamp: new Date().toISOString()
    };
    state.messages.push(aiMsg);

    var container = document.getElementById('chat-messages');
    var charIndex = 0;

    function tick() {
      if (charIndex < text.length) {
        aiMsg.content += text[charIndex];
        charIndex++;
        renderMessages();
        setTimeout(tick, CHAR_DELAY);
      } else {
        state.isStreaming = false;
        saveMessages();
        renderMessages();
      }
    }
    tick();
  }

  function showTypingIndicator() {
    var container = document.getElementById('chat-messages');
    if (!container) return;
    var indicator = document.createElement('div');
    indicator.id = 'chat-typing-indicator';
    indicator.className = 'chat-msg chat-msg--ai';
    indicator.innerHTML =
      '<div class="chat-msg-avatar">\uD83E\uDDE0</div>' +
      '<div class="chat-msg-body"><div class="chat-msg-content chat-typing">' +
        '<span class="dot"></span><span class="dot"></span><span class="dot"></span>' +
      '</div></div>';
    container.appendChild(indicator);
    scrollToBottom(container);
  }

  function removeTypingIndicator() {
    var indicator = document.getElementById('chat-typing-indicator');
    if (indicator && indicator.parentNode) indicator.parentNode.removeChild(indicator);
  }

  // ── Clear Chat ───────────────────────────────────────────────────

  function clearChat() {
    state.messages = state.messages.filter(function (m) {
      return m.sessionId !== state.currentSessionId;
    });
    saveMessages();
    renderMessages();
  }

  // ── Event Listeners ──────────────────────────────────────────────

  function initEventListeners() {
    // Send button
    document.addEventListener('click', function (e) {
      if (e.target.closest('#chat-send-btn')) {
        var input = document.getElementById('chat-input');
        if (input) {
          sendMessage(input.value);
          input.value = '';
        }
      }

      // New session button
      if (e.target.closest('#chat-new-session')) {
        var name = 'Chat ' + (state.sessions.length + 1);
        createSession(name);
      }

      // Session click
      var sessionEl = e.target.closest('.chat-session');
      if (sessionEl && !e.target.closest('.chat-session-delete')) {
        switchSession(sessionEl.dataset.sessionId);
      }

      // Session delete
      if (e.target.closest('.chat-session-delete')) {
        var deleteId = e.target.closest('.chat-session-delete').dataset.deleteSession;
        if (deleteId) deleteSession(deleteId);
      }

      // Clear chat button
      if (e.target.closest('#chat-clear-btn')) {
        clearChat();
      }
    });

    // Chat input keyboard handling
    var input = document.getElementById('chat-input');
    if (input) {
      input.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          sendMessage(input.value);
          input.value = '';
        }
      });
    }
  }

  // ── Helpers ──────────────────────────────────────────────────────

  function genId() {
    return 'msg_' + Math.random().toString(36).substring(2, 9) + Date.now().toString(36);
  }

  function identity(s) { return s; }

  // ── Initialization ───────────────────────────────────────────────

  function init() {
    loadState();
    renderSessions();
    renderMessages();
    initEventListeners();
  }

  document.addEventListener('DOMContentLoaded', init);

  window.SynapseChat = {
    init: init,
    sendMessage: sendMessage,
    createSession: createSession,
    switchSession: switchSession,
    deleteSession: deleteSession,
    clearChat: clearChat
  };
})();
