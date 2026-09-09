"use client";

import { useState, useRef, useEffect } from "react";
import styles from "./AiAgent.module.scss";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface OpportunityLite {
  id: string;
  title: string;
  type: string;
  compensation?: string;
  location?: string;
  isRemote?: boolean;
  skillsRequired?: string[];
}

interface Props {
  opportunities: OpportunityLite[];
}

export default function AiAgent({ opportunities }: Props) {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "Hi! I'm Eqonomy AI. Tell me what skills you have or what kind of work you're looking for, and I'll help you find matching opportunities.",
    },
  ]);
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, open]);

  const send = async () => {
    const text = input.trim();
    if (!text || loading) return;

    const nextMessages: Message[] = [...messages, { role: "user", content: text }];
    setMessages(nextMessages);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/ai-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: nextMessages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
          opportunities,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");

      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.reply },
      ]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Sorry, something went wrong. Please try again in a moment.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating button */}
      <button
        className={styles.fab}
        onClick={() => setOpen((v) => !v)}
        aria-label="Open Eqonomy AI"
      >
        {open ? "✕" : "AI"}
      </button>

      {/* Chat panel */}
      {open && (
        <div className={styles.panel}>
          <div className={styles.header}>
            <div>
              <strong>Eqonomy AI</strong>
              <p>Find opportunities suited to you</p>
            </div>
            <button className={styles.close} onClick={() => setOpen(false)}>
              ✕
            </button>
          </div>

          <div className={styles.messages}>
            {messages.map((m, i) => (
              <div
                key={i}
                className={`${styles.bubble} ${
                  m.role === "user" ? styles.user : styles.assistant
                }`}
              >
                {m.content}
              </div>
            ))}
            {loading && (
              <div className={`${styles.bubble} ${styles.assistant}`}>
                Thinking…
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          <div className={styles.inputRow}>
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && send()}
              placeholder="e.g. I know Python and want paid projects..."
              disabled={loading}
            />
            <button onClick={send} disabled={loading || !input.trim()}>
              Send
            </button>
          </div>
        </div>
      )}
    </>
  );
}