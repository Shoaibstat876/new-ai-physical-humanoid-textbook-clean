import React, { useEffect, useRef, useState } from "react";
import styles from "./AIChatWidget.module.css";

/**
 * Level 6: RAG Chat Widget
 *
 * Spec-Kit Contract (frontend → backend):
 *   POST /chat
 *   Body (JSON):
 *   {
 *     "question": string
 *   }
 *
 * Spec-Kit Contract (backend → frontend):
 *   200 OK
 *   {
 *     "answer"?: string;
 *     "error"?: string;
 *   }
 *
 * Notes:
 * - This widget is global (no props) and only sends a simple textbook question.
 * - It does NOT depend on docId / level (those appear in later levels).
 * - API base URL:
 *     - Prefer NEXT_PUBLIC_RAG_API_URL when available (build-time / env),
 *     - Otherwise fall back to http://localhost:8000 for local dev.
 */

// -----------------------------
// Types matching the /chat spec
// -----------------------------

type MessageSender = "user" | "ai";

type Message = {
  sender: MessageSender;
  text: string;
};

type ChatRequestPayload = {
  question: string;
};

type ChatResponsePayload = {
  answer?: string;
  error?: string;
};

// -----------------------------
// Config: API base URL (Docusaurus-safe)
// -----------------------------
//
// Use globalThis so we don't directly reference `process` in the browser.
// In Node it will still work because globalThis.process exists.
// In the browser, globalThis.process is usually undefined, which is safe
// thanks to optional chaining.

const API_BASE_URL: string =
  ((globalThis as any).process?.env?.NEXT_PUBLIC_RAG_API_URL as
    | string
    | undefined) ?? "http://localhost:8000";

// -----------------------------
// Component
// -----------------------------

export const AIChatWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Keep a ref so we can scroll new messages into view
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const toggleOpen = () => setIsOpen((prev) => !prev);

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const appendMessage = (message: Message) => {
    setMessages((prev) => [...prev, message]);
  };

  const handleSend = async () => {
    const trimmed = input.trim();
    if (!trimmed || isLoading) return;

    // 1) Update local chat history immediately (optimistic UI)
    const userMessage: Message = { sender: "user", text: trimmed };
    appendMessage(userMessage);
    setInput("");
    setIsLoading(true);

    try {
      // 2) Build request exactly as Spec-Kit says
      const payload: ChatRequestPayload = { question: trimmed };

      const response = await fetch(`${API_BASE_URL}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      // 3) If HTTP status is not OK, still satisfy the contract with a friendly error
      if (!response.ok) {
        const aiMessage: Message = {
          sender: "ai",
          text: `Sorry, the AI backend returned an error (${response.status}). Please try again.`,
        };
        appendMessage(aiMessage);
        return;
      }

      // 4) Parse JSON in the shape of ChatResponsePayload
      const data = (await response.json()) as ChatResponsePayload;

      const answerText =
        data.answer ??
        data.error ??
        "Backend responded, but there was no clear `answer` field. Please check the /chat contract.";

      const aiMessage: Message = {
        sender: "ai",
        text: answerText,
      };

      appendMessage(aiMessage);
    } catch (error) {
      console.error("[AIChatWidget] /chat request failed:", error);
      const aiMessage: Message = {
        sender: "ai",
        text:
          "Sorry, something went wrong while talking to the AI backend. Please try again later.",
      };
      appendMessage(aiMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void handleSend();
    }
  };

  return (
    <div className={styles.container}>
      {isOpen && (
        <div className={styles.panel} aria-label="Physical AI chat panel">
          {/* Header */}
          <div className={styles.header}>
            <div className={styles.headerLeft}>
              <span className={styles.title}>Physical AI Assistant</span>
              <span className={styles.badge}>Textbook Q&amp;A</span>
            </div>
            <button
              type="button"
              className={styles.closeButton}
              onClick={toggleOpen}
              aria-label="Close AI assistant"
            >
              ✕
            </button>
          </div>

          {/* Messages */}
          <div className={styles.messages}>
            {messages.length === 0 && !isLoading && (
              <div className={styles.emptyState}>
                Ask anything about the{" "}
                <strong>Physical AI &amp; Humanoid Robotics</strong> textbook.
                Try:
                <ul>
                  <li>“Explain robot sensors in beginner level.”</li>
                  <li>“Summarize humanoid kinematics in 3 points.”</li>
                </ul>
              </div>
            )}

            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={
                  msg.sender === "user"
                    ? styles.messageUser
                    : styles.messageAI
                }
              >
                {msg.text}
              </div>
            ))}

            {isLoading && (
              <div className={styles.loading}>
                <span className={styles.dotPulse} />
                Thinking…
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className={styles.inputArea}>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask a question about this textbook..."
              rows={2}
            />
            <button
              type="button"
              onClick={handleSend}
              disabled={isLoading || !input.trim()}
            >
              {isLoading ? "Sending…" : "Send"}
            </button>
          </div>
        </div>
      )}

      {/* Floating Action Button */}
      <button
        type="button"
        className={styles.fab}
        onClick={toggleOpen}
        aria-label={isOpen ? "Hide AI assistant" : "Open AI assistant"}
      >
        {isOpen ? "−" : "AI"}
      </button>
    </div>
  );
};

export default AIChatWidget;
