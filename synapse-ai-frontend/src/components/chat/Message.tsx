import { useState } from "react";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark, oneLight } from "react-syntax-highlighter/dist/esm/styles/prism";
import { Copy, Check } from "lucide-react";
import type { Message as MessageType } from "../../types/chat.ts";
import { useTheme } from "../../hooks/useTheme.ts";

interface MessageProps {
  message: MessageType;
}

export function Message({ message }: MessageProps) {
  const { theme } = useTheme();
  const [copied, setCopied] = useState(false);
  const isUser = message.role === "user";

  const handleCopy = async () => {
    await navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className={`flex animate-fade-in ${isUser ? "justify-end" : "justify-start"}`}
    >
      <div
        className={`group relative max-w-[80%] rounded-2xl px-4 py-3 ${
          isUser
            ? "bg-indigo-600 text-white"
            : "bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-gray-100"
        }`}
      >
        {isUser ? (
          <p className="whitespace-pre-wrap text-sm leading-relaxed">
            {message.content}
          </p>
        ) : (
          <div className="prose prose-sm dark:prose-invert max-w-none text-sm leading-relaxed">
            <Markdown
              remarkPlugins={[remarkGfm]}
              components={{
                pre({ children }) {
                  return <>{children}</>;
                },
                code(props) {
                  const match = /language-(\w+)/.exec(
                    props.className || "",
                  );
                  if (match) {
                    return (
                      <div className="not-prose relative my-2 overflow-hidden rounded-lg">
                        <div className="flex items-center justify-between bg-gray-200 px-4 py-1.5 text-xs text-gray-600 dark:bg-gray-700 dark:text-gray-300">
                          <span>{match[1]}</span>
                        </div>
                        <SyntaxHighlighter
                          style={theme === "dark" ? oneDark : oneLight}
                          language={match[1]}
                          PreTag="div"
                          customStyle={{ margin: 0, borderRadius: 0 }}
                        >
                          {String(props.children).replace(/\n$/, "")}
                        </SyntaxHighlighter>
                      </div>
                    );
                  }
                  return (
                    <code className="rounded bg-gray-200 px-1.5 py-0.5 text-sm dark:bg-gray-700">
                      {props.children}
                    </code>
                  );
                },
              }}
            >
              {message.content}
            </Markdown>
          </div>
        )}

        <button
          onClick={handleCopy}
          className={`absolute -bottom-8 right-0 flex items-center gap-1 rounded-md px-2 py-1 text-xs opacity-0 transition-opacity duration-200 group-hover:opacity-100 ${
            isUser
              ? "text-indigo-300 hover:text-indigo-200"
              : "text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
          }`}
          aria-label="Copy message"
        >
          {copied ? (
            <Check className="h-3 w-3" />
          ) : (
            <Copy className="h-3 w-3" />
          )}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
    </div>
  );
}
