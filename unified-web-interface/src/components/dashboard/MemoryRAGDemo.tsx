"use client";

import { useState } from "react";
import { Brain, Search, Database, ArrowRight, Sparkles } from "lucide-react";

const memoryExamples = [
  { user: "I prefer dark mode and Python", stored: "User preferences: dark mode UI, Python language", type: "Preference" },
  { user: "My project uses FastAPI", stored: "Project context: FastAPI backend framework", type: "Context" },
  { user: "Remind me about the deployment", stored: "Deployment task: pending — Railway + Docker", type: "Task" },
];

const ragExamples = [
  { query: "How does LangGraph work?", result: "LangGraph uses StateGraph to define conversational flows with tool calling, checkpointing, and conditional edges.", score: 0.94 },
  { query: "Setup PostgreSQL with pgvector", result: "Install pgvector extension, create embeddings table with vector(1536) column, and use cosine similarity for search.", score: 0.91 },
  { query: "Rate limiting best practices", result: "Use sliding window algorithm with Redis, configure per-endpoint limits, and add burst allowance for authenticated users.", score: 0.87 },
];

export function MemoryRAGDemo() {
  const [activeMemory, setActiveMemory] = useState(0);
  const [ragQuery, setRagQuery] = useState("");
  const [ragResult, setRagResult] = useState<typeof ragExamples[0] | null>(null);
  const [searching, setSearching] = useState(false);

  const handleSearch = () => {
    if (!ragQuery.trim()) return;
    setSearching(true);
    setTimeout(() => {
      const result = ragExamples[Math.floor(Math.random() * ragExamples.length)];
      setRagResult(result);
      setSearching(false);
    }, 800);
  };

  return (
    <>
      {/* Memory Section */}
      <section id="memory" className="max-w-6xl mx-auto px-4 py-16">
        <div className="text-center mb-8">
          <p className="text-xs text-purple-400 uppercase tracking-widest mb-3 font-semibold">Persistent Context</p>
          <h2 className="text-3xl font-bold text-white mb-3">Long-term Memory System</h2>
          <p className="text-gray-400 max-w-xl mx-auto">
            Synapse AI remembers user preferences, project context, and task history across sessions using semantic memory with mem0.
          </p>
        </div>

        <div className="max-w-2xl mx-auto bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden shadow-2xl shadow-black/30">
          <div className="px-4 py-3 border-b border-gray-800 flex items-center gap-2">
            <Brain size={18} className="text-purple-400" />
            <span className="text-sm font-semibold text-white">Memory Visualization</span>
          </div>
          <div className="p-4 space-y-3">
            {memoryExamples.map((ex, i) => (
              <button
                key={i}
                onClick={() => setActiveMemory(i)}
                className={`w-full text-left p-3 rounded-xl border transition-all ${
                  activeMemory === i
                    ? "border-purple-500/40 bg-purple-500/5"
                    : "border-gray-800 hover:border-gray-700"
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-[10px] px-1.5 py-0.5 bg-purple-500/20 text-purple-400 rounded font-medium">{ex.type}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <div className="flex-1">
                    <p className="text-gray-400 text-xs mb-1">User said:</p>
                    <p className="text-gray-200">&ldquo;{ex.user}&rdquo;</p>
                  </div>
                  <ArrowRight size={16} className="text-purple-400 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-gray-400 text-xs mb-1">Stored as:</p>
                    <p className="text-purple-300 text-xs">{ex.stored}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* RAG Section */}
      <section id="rag" className="max-w-6xl mx-auto px-4 py-16">
        <div className="text-center mb-8">
          <p className="text-xs text-cyan-400 uppercase tracking-widest mb-3 font-semibold">Knowledge Retrieval</p>
          <h2 className="text-3xl font-bold text-white mb-3">RAG Search Demo</h2>
          <p className="text-gray-400 max-w-xl mx-auto">
            Retrieval-Augmented Generation uses Pinecone vector search to find relevant knowledge before generating responses.
          </p>
        </div>

        <div className="max-w-2xl mx-auto bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden shadow-2xl shadow-black/30">
          <div className="px-4 py-3 border-b border-gray-800 flex items-center gap-2">
            <Search size={18} className="text-cyan-400" />
            <span className="text-sm font-semibold text-white">Semantic Search</span>
            <span className="text-[11px] text-gray-500 ml-auto">Pinecone + pgvector</span>
          </div>
          <div className="p-4">
            <div className="flex items-center gap-2 mb-4">
              <input
                type="text"
                value={ragQuery}
                onChange={(e) => setRagQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                placeholder="Search knowledge base..."
                className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
              />
              <button
                onClick={handleSearch}
                disabled={!ragQuery.trim() || searching}
                className="p-2 bg-cyan-600 hover:bg-cyan-700 disabled:bg-gray-700 text-white rounded-lg transition-colors"
              >
                {searching ? <Sparkles size={18} className="animate-spin" /> : <Search size={18} />}
              </button>
            </div>

            {ragResult && (
              <div className="border border-cyan-500/20 bg-cyan-500/5 rounded-xl p-4 animate-fade-in">
                <div className="flex items-center gap-2 mb-2">
                  <Database size={14} className="text-cyan-400" />
                  <span className="text-xs text-cyan-400 font-medium">Top Result</span>
                  <span className="text-[10px] text-gray-500 ml-auto">Score: {ragResult.score.toFixed(2)}</span>
                </div>
                <p className="text-sm text-gray-200 leading-relaxed">{ragResult.result}</p>
              </div>
            )}

            {!ragResult && (
              <div className="text-center py-6">
                <Database size={32} className="text-gray-700 mx-auto mb-2" />
                <p className="text-xs text-gray-500">Try searching: &ldquo;LangGraph&rdquo;, &ldquo;PostgreSQL&rdquo;, or &ldquo;rate limiting&rdquo;</p>
              </div>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
