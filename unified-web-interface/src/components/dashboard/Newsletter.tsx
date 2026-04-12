"use client";

import { useState } from "react";
import { Mail, CheckCircle } from "lucide-react";

export function Newsletter() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email.trim()) {
      setError("Please enter an email address.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    // Demo: just show success
    setSubmitted(true);
    setEmail("");
  };

  if (submitted) {
    return (
      <section className="max-w-6xl mx-auto px-4 py-16">
        <div className="max-w-xl mx-auto text-center bg-gray-900 border border-emerald-500/20 rounded-2xl p-8">
          <CheckCircle size={40} className="text-emerald-400 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">You&apos;re subscribed!</h3>
          <p className="text-sm text-gray-400">
            Thank you for signing up. You&apos;ll receive updates about Synapse AI features and releases.
          </p>
          <button
            onClick={() => setSubmitted(false)}
            className="mt-4 text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
          >
            Subscribe another email
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="max-w-6xl mx-auto px-4 py-16">
      <div className="max-w-xl mx-auto text-center bg-gray-900 border border-gray-800 rounded-2xl p-8">
        <Mail size={32} className="text-indigo-400 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-white mb-2">Stay Updated</h3>
        <p className="text-sm text-gray-400 mb-6">
          Get notified about new Synapse AI features, model updates, and platform improvements.
        </p>
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row items-center gap-3">
          <input
            type="email"
            value={email}
            onChange={(e) => { setEmail(e.target.value); setError(""); }}
            placeholder="you@example.com"
            className="flex-1 w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
          />
          <button
            type="submit"
            className="w-full sm:w-auto px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl transition-colors"
          >
            Subscribe
          </button>
        </form>
        {error && <p className="text-xs text-red-400 mt-2">{error}</p>}
      </div>
    </section>
  );
}
