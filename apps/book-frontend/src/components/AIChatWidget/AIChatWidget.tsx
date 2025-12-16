import React, { useEffect, useRef, useState } from "react";
import styles from "./AIChatWidget.module.css";
import { BACKEND_BASE_URL } from "@site/src/config/runtime";

/**
 * Level 6: RAG Chat Widget
 *
 * Contract:
 *   POST /chat
 *   { "question": string }
 *   -> { "answer"?: string, "error"?: string }
 */

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

// Normalize base URL (prevents //chat bugs)
function normalizeBaseUrl(url: string): string {
  return (url || "").trim().replace(/\/+$/, "");
}

// Build endpoint safely
function buildChatUrl(baseUrl: string): string {
  const base = normalizeBaseUrl(baseUrl);
  return `${base}/chat`;
}

// Small helper to timeout fetch (prevents “stuck”)
async function fetchWithTimeout(input: RequestInfo, init: RequestInit, ms = 15000) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), ms);

  try {
    const res = await fetch(input, { ...init, signal: controller.signal });
    return res;
  } finally {
    clearTimeout(id);
  }
}

const API_BASE_URL = normalizeBaseUrl(BACKEND_BASE_URL);
const CHAT_URL = buildChatUrl(API_BASE_URL);

export const AIChatWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const toggleOpen = () => setIsOpen((prev) => !prev);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isLoading]);

  const appendMessage = (message: Message) => {
    setMessages((prev) => [...prev, message]);
  };

  const handleSend = async () => {
    const trimmed = input.trim();
    if (!trimmed || isLoading) return;

    appendMessage({ sender: "user", text: trimmed });
    setInput("");
    setIsLoading(true);

    try {
      const payload: ChatRequestPayload = { question: trimmed };

      // 🔎 Quick debug line (optional): check in browser console
      console.log("[AIChatWidget] POST", CHAT_URL, { API_BASE_URL });

      const response = await fetchWithTimeout(
        CHAT_URL,
        {
          method: "POST",
          mode: "cors",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
        15000,
      );

      // If not OK, show real backend text too
      if (!response.ok) {
        let bodyText = "";
        try {
          bodyText = await response.text();
        } catch {
          bodyText = "";
        }

        appendMessage({
          sender: "ai",
          text:
            `Backend error (HTTP ${response.status}).\n` +
            (bodyText ? `Details: ${bodyText}` : "No details returned."),
        });
        return;
      }

      // Parse JSON safely
      let data: ChatResponsePayload | null = null;
      try {
        data = (await response.json()) as ChatResponsePayload;
      } catch {
        data = null;
      }

      const answerText =
        data?.answer ??
        data?.error ??
        "Backend responded but no `answer` field was returned.";

      appendMessage({ sender: "ai", text: answerText });
    } catch (error: any) {
      const msg =
        error?.name === "AbortError"
          ? "Request timed out (15s). Is backend running?"
          : error instanceof Error
            ? error.message
            : "Unknown error occurred while talking to backend.";

      console.error("[AIChatWidget] /chat request failed:", error);

      appendMessage({
        sender: "ai",
        text:
          "Sorry, I couldn’t reach the AI backend.\n" +
          `Details: ${msg}\n` +
          `Using: ${CHAT_URL}`,
      });
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
                className={msg.sender === "user" ? styles.messageUser : styles.messageAI}
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

          <div className={styles.inputArea}>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask a question about this textbook..."
              rows={2}
            />
            <button type="button" onClick={handleSend} disabled={isLoading || !input.trim()}>
              {isLoading ? "Sending…" : "Send"}
            </button>
          </div>
        </div>
      )}

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
