"use client";

import { useState } from "react";
import { Bot, User, Copy, Check } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import type { Message as MessageType } from "@/lib/types";
import type { Components } from "react-markdown";

interface MessageProps {
  message: MessageType;
}

function CodeBlock({ language, value }: { language: string; value: string }) {
  const [copied, setCopied] = useState(false);

  const copy = () => {
    navigator.clipboard.writeText(value).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="relative group my-3 rounded-xl overflow-hidden border border-gray-700">
      <div className="flex items-center justify-between px-4 py-2 bg-gray-800/80 border-b border-gray-700">
        <span className="text-xs font-mono text-gray-400">{language || "code"}</span>
        <button
          onClick={copy}
          className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-white transition-colors"
          aria-label="Copy code"
        >
          {copied ? (
            <>
              <Check size={12} className="text-emerald-400" />
              <span className="text-emerald-400">Copied!</span>
            </>
          ) : (
            <>
              <Copy size={12} />
              Copy
            </>
          )}
        </button>
      </div>
      <SyntaxHighlighter
        language={language}
        style={oneDark}
        customStyle={{
          margin: 0,
          padding: "1rem",
          background: "#1a1f2e",
          fontSize: "0.8rem",
          lineHeight: "1.6",
        }}
        showLineNumbers={value.split("\n").length > 5}
      >
        {value}
      </SyntaxHighlighter>
    </div>
  );
}

const markdownComponents: Components = {
  code({ className, children }) {
    const match = /language-(\w+)/.exec(className || "");
    const value = String(children).replace(/\n$/, "");
    // Multi-line code block
    if (match || value.includes("\n")) {
      return <CodeBlock language={match ? match[1] : ""} value={value} />;
    }
    // Inline code
    return (
      <code className="bg-gray-800 text-indigo-300 rounded px-1.5 py-0.5 text-[0.8em] font-mono border border-gray-700">
        {children}
      </code>
    );
  },
  // Headings
  h1: ({ children }) => <h1 className="text-xl font-bold text-white mt-4 mb-2">{children}</h1>,
  h2: ({ children }) => <h2 className="text-lg font-semibold text-white mt-4 mb-2">{children}</h2>,
  h3: ({ children }) => <h3 className="text-base font-semibold text-gray-100 mt-3 mb-1.5">{children}</h3>,
  // Paragraphs
  p: ({ children }) => <p className="text-sm leading-relaxed text-gray-100 mb-2 last:mb-0">{children}</p>,
  // Lists
  ul: ({ children }) => <ul className="list-disc list-inside space-y-1 mb-2 text-sm text-gray-100">{children}</ul>,
  ol: ({ children }) => <ol className="list-decimal list-inside space-y-1 mb-2 text-sm text-gray-100">{children}</ol>,
  li: ({ children }) => <li className="leading-relaxed">{children}</li>,
  // Block quote
  blockquote: ({ children }) => (
    <blockquote className="border-l-2 border-indigo-500 pl-3 my-2 text-gray-400 italic text-sm">
      {children}
    </blockquote>
  ),
  // Links
  a: ({ href, children }) => (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="text-indigo-400 hover:text-indigo-300 underline underline-offset-2"
    >
      {children}
    </a>
  ),
  // Horizontal rule
  hr: () => <hr className="border-gray-700 my-3" />,
  // Strong / em
  strong: ({ children }) => <strong className="font-semibold text-white">{children}</strong>,
  em: ({ children }) => <em className="italic text-gray-200">{children}</em>,
  // Table
  table: ({ children }) => (
    <div className="overflow-x-auto my-3">
      <table className="min-w-full text-sm border-collapse">{children}</table>
    </div>
  ),
  thead: ({ children }) => <thead className="bg-gray-800">{children}</thead>,
  tbody: ({ children }) => <tbody>{children}</tbody>,
  tr: ({ children }) => <tr className="border-b border-gray-700">{children}</tr>,
  th: ({ children }) => <th className="px-3 py-2 text-left font-medium text-gray-300">{children}</th>,
  td: ({ children }) => <td className="px-3 py-2 text-gray-300">{children}</td>,
};

export function Message({ message }: MessageProps) {
  const isUser = message.role === "user";

  return (
    <div className={`flex gap-3 ${isUser ? "flex-row-reverse" : "flex-row"}`}>
      <div
        className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
          isUser ? "bg-indigo-600" : "bg-gray-700 ring-1 ring-indigo-500/30"
        }`}
      >
        {isUser ? <User size={16} className="text-white" /> : <Bot size={16} className="text-indigo-300" />}
      </div>
      <div
        className={`max-w-[80%] rounded-2xl px-4 py-3 ${
          isUser
            ? "bg-indigo-600 text-white rounded-br-md"
            : "bg-gray-800/90 text-gray-100 rounded-bl-md border border-gray-700/80"
        }`}
      >
        {isUser ? (
          <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
        ) : (
          <div className="prose-sm max-w-none">
            <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
              {message.content}
            </ReactMarkdown>
          </div>
        )}
      </div>
    </div>
  );
}
