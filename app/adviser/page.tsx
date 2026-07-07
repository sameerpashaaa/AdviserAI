"use client";

import { useState, useRef, useEffect } from "react";
import AppShell from "@/components/layout/AppShell";
import Header from "@/components/layout/Header";
import { Brain, Send, Sparkles, RefreshCw, Copy } from "lucide-react";
import { AGENTS } from "@/lib/agents/types";
import { formatMarkdown } from "@/lib/formatMarkdown";
import { useRouter } from "next/navigation";
import { STORAGE_KEYS, readStorage, writeStorage } from "@/lib/storage";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  activeAgents?: string[];
}

interface PersistedMessage extends Omit<Message, "timestamp"> {
  timestamp: string;
}

const STARTER_PROMPTS = [
  "Analyze the AI consulting market opportunity for a new entrant",
  "Create a SWOT analysis for a B2B SaaS startup entering healthcare",
  "What are the top 5 risks of launching in a competitive market?",
  "Help me build a go-to-market strategy for my fintech app",
  "Validate my idea: an AI-powered personal finance coach",
  "What market trends should I be tracking in 2026?",
];

const WELCOME_MESSAGE: Message = {
  id: "welcome",
  role: "assistant",
  content:
    "## Welcome to Adviser AI 🎯\n\nI'm your Chief Adviser — backed by 10 specialized AI agents covering research, market intelligence, strategy, finance, risk, and more.\n\n**What can I help you with today?**\n\n- 📊 **Market Analysis** — TAM/SAM/SOM, competitive landscape\n- 🎯 **Strategy** — SWOT, PESTLE, Porter's Five Forces\n- 🚀 **Startup Advice** — idea validation, GTM, fundraising\n- 💰 **Financial Modeling** — projections, unit economics\n- ⚠️ **Risk Assessment** — comprehensive risk registry\n- 📈 **Trend Intelligence** — emerging opportunities\n\nJust ask me anything — I'll route your question to the right expert agents.",
  timestamp: new Date(),
  activeAgents: [],
};

function serializeMessages(messages: Message[]): PersistedMessage[] {
  return messages.map((message) => ({
    ...message,
    timestamp: message.timestamp.toISOString(),
  }));
}

function deserializeMessages(messages: PersistedMessage[] | null): Message[] {
  if (!messages || messages.length === 0) return [WELCOME_MESSAGE];

  return messages.map((message) => ({
    ...message,
    timestamp: new Date(message.timestamp),
  }));
}

export default function AdviserPage() {
  const router = useRouter();
  const conversationIdRef = useRef<string | null>(null);
  const [messages, setMessages] = useState<Message[]>(() =>
    deserializeMessages(readStorage<PersistedMessage[] | null>(STORAGE_KEYS.chatMessages, null))
  );
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [activeAgents, setActiveAgents] = useState<string[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    const loadConversation = async () => {
      const response = await fetch("/api/adviser");
      if (!response.ok) return;

      const data = await response.json();
      if (data.conversation?.id) {
        conversationIdRef.current = data.conversation.id;
      }

      if (Array.isArray(data.messages) && data.messages.length > 0) {
        const hydrated = data.messages.map((message: any) => ({
          id: message.id,
          role: message.role,
          content: message.content,
          timestamp: new Date(message.createdAt),
          activeAgents: message.activeAgents ?? [],
        }));
        setMessages([WELCOME_MESSAGE, ...hydrated.filter((message: Message) => message.id !== WELCOME_MESSAGE.id)]);
      }
    };

    void loadConversation();
  }, []);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);
    setActiveAgents(["chief", "research"]);

    if (textareaRef.current) {
      textareaRef.current.style.height = "24px";
    }

    try {
      const history = messages.slice(-6).map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const res = await fetch("/api/adviser", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMsg.content,
          history,
          conversationId: conversationIdRef.current ?? undefined,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || "Request failed");
      }

      const contentType = res.headers.get("content-type") || "";
      if (contentType.includes("text/event-stream")) {
        const reader = res.body?.getReader();
        const decoder = new TextDecoder();
        if (!reader) throw new Error("Response body is not readable");

        const aiMsgId = (Date.now() + 1).toString();
        // Insert empty assistant message that will be populated
        setMessages((prev) => [
          ...prev,
          {
            id: aiMsgId,
            role: "assistant",
            content: "",
            timestamp: new Date(),
            activeAgents: [],
          },
        ]);

        let accumulated = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split("\n");

          for (const line of lines) {
            const trimmed = line.trim();
            if (trimmed.startsWith("data: ")) {
              try {
                const data = JSON.parse(trimmed.slice(6));

                if (data.error) {
                  throw new Error(data.error);
                }

                if (data.agents) {
                  setActiveAgents(data.agents);
                  setMessages((prev) =>
                    prev.map((m) => (m.id === aiMsgId ? { ...m, activeAgents: data.agents } : m))
                  );
                }

                if (data.token) {
                  accumulated += data.token;
                  setMessages((prev) =>
                    prev.map((m) => (m.id === aiMsgId ? { ...m, content: accumulated } : m))
                  );
                }

                if (data.conversationId) {
                  conversationIdRef.current = data.conversationId;
                }

                if (data.done) {
                  // Final chunk
                }
              } catch {
                // Ignore partial JSON parsing errors
              }
            }
          }
        }
      } else {
        const data = await res.json();
        setActiveAgents(data.agents || []);
        const aiMsg: Message = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: data.response,
          timestamp: new Date(),
          activeAgents: data.agents,
        };
        setMessages((prev) => [...prev, aiMsg]);
        if (data.conversationId) {
          conversationIdRef.current = data.conversationId;
        }
      }

      router.refresh();
    } catch {
      const errMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content:
          "I encountered an error processing your request. Please check your API key in Settings and try again.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errMsg]);
    } finally {
      setIsLoading(false);
      setActiveAgents([]);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    const el = e.target;
    el.style.height = "24px";
    el.style.height = Math.min(el.scrollHeight, 200) + "px";
  };

  const copyMessage = (content: string) => {
    navigator.clipboard.writeText(content);
  };



  const allAgentNames: Record<string, string> = {
    chief: "Chief Adviser",
    research: "Research",
    market: "Market Intel",
    trend: "Trends",
    finance: "Finance",
    startup: "Startup",
    tech: "Tech Arch",
    risk: "Risk",
    report: "Reports",
    verify: "Verifier",
  };

  return (
    <AppShell>
      <div style={{ display: "flex", flexDirection: "column", height: "100vh" }}>
        <Header
          title="Chief Adviser"
          subtitle="Multi-agent strategic intelligence"
          actions={
            <button
              className="btn btn-ghost btn-sm"
              onClick={() => {
                conversationIdRef.current = null;
                setMessages([
                  {
                    id: "welcome-new",
                    role: "assistant",
                    content: "New session started. How can I help you?",
                    timestamp: new Date(),
                  },
                ]);
                router.refresh();
              }}
            >
              <RefreshCw size={14} /> New Session
            </button>
          }
        />

        {/* Agent Activity Bar */}
        <div className="agent-activity-bar">
          {Object.entries(allAgentNames).map(([id, name]) => (
            <div
              key={id}
              className={`agent-chip ${
                isLoading && activeAgents.includes(id)
                  ? "active"
                  : messages.some((m) => m.activeAgents?.includes(id))
                  ? "done"
                  : ""
              }`}
            >
              <span
                className={`status-dot ${
                  isLoading && activeAgents.includes(id)
                    ? "thinking"
                    : messages.some((m) => m.activeAgents?.includes(id))
                    ? "active"
                    : "idle"
                }`}
              />
              {AGENTS.find((a) => a.id === id)?.icon} {name}
            </div>
          ))}
        </div>

        {/* Messages */}
        <div className="chat-messages" style={{ flex: 1, overflowY: "auto", padding: "24px" }}>
          {messages.map((msg) => (
            <div
              key={msg.id}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: msg.role === "user" ? "flex-end" : "flex-start",
                gap: 8,
              }}
            >
              {msg.role === "assistant" && (
                <div style={{ display: "flex", alignItems: "center", gap: 8, paddingLeft: 4 }}>
                  <div
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: "50%",
                      background: "var(--gradient-brand)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Brain size={13} color="white" />
                  </div>
                  <span style={{ fontSize: "0.8125rem", fontWeight: 600, color: "var(--text-accent)" }}>
                    Chief Adviser
                  </span>
                  <span style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>
                    {msg.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
              )}

              <div
                className={msg.role === "user" ? "message-user" : "message-ai"}
                style={{ maxWidth: msg.role === "assistant" ? "90%" : "75%" }}
              >
                {msg.role === "assistant" ? (
                  <div className="ai-output">
                    {formatMarkdown(msg.content, {
                      h3Style: { marginBottom: 8 },
                      h4Style: { marginBottom: 6, marginTop: 12 },
                    })}
                  </div>
                ) : (
                  msg.content
                )}
              </div>

              {msg.role === "assistant" && msg.id !== "welcome" && (
                <div
                  style={{
                    fontSize: "0.72rem",
                    color: "var(--text-muted)",
                    padding: "4px 8px",
                    borderLeft: "2px solid var(--border-subtle)",
                    marginTop: 2,
                    marginBottom: 6,
                    maxWidth: "90%",
                    display: "flex",
                    alignItems: "center",
                    gap: 4,
                  }}
                >
                  <Sparkles size={11} style={{ color: "var(--text-accent)" }} />
                  <span>Adviser AI can make mistakes. Verify strategic plans before implementation.</span>
                </div>
              )}

              {msg.role === "assistant" && msg.id !== "welcome" && (
                <button
                  onClick={() => copyMessage(msg.content)}
                  className="btn btn-ghost btn-sm"
                  style={{ alignSelf: "flex-start", padding: "4px 10px" }}
                >
                  <Copy size={12} /> Copy
                </button>
              )}
            </div>
          ))}

          {isLoading && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "16px 20px",
                background: "var(--bg-card)",
                border: "1px solid var(--border-subtle)",
                borderRadius: "var(--radius-lg)",
                alignSelf: "flex-start",
                maxWidth: 300,
              }}
            >
              <div
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: "50%",
                  background: "var(--gradient-brand)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <Brain size={13} color="white" />
              </div>
              <div>
                <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginBottom: 4 }}>
                  Agents working...
                </div>
                <div className="typing-indicator">
                  <div className="typing-dot" />
                  <div className="typing-dot" />
                  <div className="typing-dot" />
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Starter Prompts */}
        {messages.length <= 1 && (
          <div
            style={{
              padding: "0 24px 16px",
              display: "flex",
              gap: 8,
              flexWrap: "wrap",
            }}
          >
            {STARTER_PROMPTS.map((p) => (
              <button
                key={p}
                onClick={() => setInput(p)}
                className="btn btn-ghost btn-sm"
                style={{ fontSize: "0.75rem", textAlign: "left", whiteSpace: "normal", height: "auto", padding: "6px 12px" }}
              >
                <Sparkles size={11} color="var(--text-accent)" />
                {p}
              </button>
            ))}
          </div>
        )}

        {/* Input Area */}
        <div className="chat-input-area">
          <div className="chat-input-wrapper">
            <textarea
              ref={textareaRef}
              className="chat-textarea"
              placeholder="Ask anything — strategy, research, market analysis, startup advice..."
              value={input}
              onChange={handleTextareaChange}
              onKeyDown={handleKeyDown}
              rows={1}
              style={{ height: 24 }}
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              className="btn btn-primary btn-sm"
              style={{ flexShrink: 0, padding: "8px 14px" }}
            >
              {isLoading ? (
                <RefreshCw size={15} className="animate-spin" />
              ) : (
                <Send size={15} />
              )}
            </button>
          </div>
          <div
            style={{
              textAlign: "center",
              fontSize: "0.7rem",
              color: "var(--text-muted)",
              marginTop: 8,
            }}
          >
            Press Enter to send · Shift+Enter for new line · 10 AI agents active
          </div>
        </div>
      </div>
    </AppShell>
  );
}
