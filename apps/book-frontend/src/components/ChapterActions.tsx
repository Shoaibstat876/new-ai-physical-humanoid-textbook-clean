import React, { useEffect, useRef, useState } from "react";
import styles from "./ChapterActions.module.css";

/**
 * ✅ PICK ONE (keep only one) depending on where this file lives:
 *
 * If file is: apps/book-frontend/src/components/ChapterActions.tsx
 *   ✅ use:
 *     import { BACKEND_BASE_URL } from "../config/runtime";
 
 */

// ---- PICK ONE ----
import { BACKEND_BASE_URL } from "../config/runtime";
// import { BACKEND_BASE_URL } from "../../config/runtime";
// ------------------

/**
 * ChapterActions
 *
 * Level 7–10 AI tools for a single textbook chapter:
 *
 * Endpoints (frontend → backend contracts):
 *
 * 1) Ask This Section (Level 7)
 *    POST /chat/ask-section
 *    Body:
 *      {
 *        "doc_id": string;      // e.g. "foundations/how-to-use-this-book"
 *        "selection": string;   // user-selected or pasted text
 *        "level": "beginner" | "intermediate" | "advanced"
 *      }
 *    Response (success):
 *      {
 *        "status"?: "ok" | "error";
 *        "message"?: string;
 *        "answer"?: string;
 *      }
 *
 * 2) Translate to Urdu (Level 7)
 *    POST /chat/translate/urdu
 *    Body:
 *      { "doc_id": string }
 *    Response:
 *      { "message"?: string; "answer"?: string }
 *
 * 3) Manual Personalize (Level 8)
 *    POST /chat/personalize
 *    Body:
 *      {
 *        "doc_id": string;
 *        "level": "beginner" | "intermediate" | "advanced";
 *      }
 *    Response:
 *      { "message"?: string; "answer"?: string }
 *
 * 4) Auto Personalize (Level 10 - Beta)
 *    POST /chat/personalize/auto
 *    Body:
 *      { "doc_id": string; }
 *    Response (success):
 *      {
 *        "preferred_level"?: "beginner" | "intermediate" | "advanced";
 *        "user_email"?: string | null;
 *        "personalized_markdown"?: string;
 *      }
 *    Response (error, BetterAuth offline):
 *      {
 *        "detail": "Failed to reach auth server: All connection attempts failed"
 *      }
 *
 *    UI REQUIREMENT:
 *      When BetterAuth/auth server is unreachable, show:
 *        "Auto Personalize (Beta) is disabled in this demo. Please use Manual Personalize instead."
 */

// ✅ Single source of truth (runtime config)
function normalizeBaseUrl(url: string): string {
  return url.replace(/\/+$/, "");
}
const API_BASE_URL = normalizeBaseUrl(BACKEND_BASE_URL);

type Level = "beginner" | "intermediate" | "advanced";

type ChapterActionsProps = {
  // e.g. "foundations/how-to-use-this-book"
  docId: string;
};

type TabKey = "ask" | "urdu" | "manual" | "auto";

type AskSectionResponse = {
  status?: "ok" | "error";
  message?: string;
  answer?: string;
  detail?: string;
};

type GenericMessageResponse = {
  message?: string;
  answer?: string;
  detail?: string;
};

type AutoPersonalizeResponse = {
  preferred_level?: Level;
  user_email?: string | null;
  personalized_markdown?: string;
  detail?: string;
};

// Helper to safely extract a message/answer string
function extractMessage(
  data: GenericMessageResponse | AskSectionResponse | null,
): string | null {
  if (!data || typeof data !== "object") return null;

  if (typeof data.message === "string" && data.message.trim().length > 0) {
    return data.message;
  }
  if (typeof data.answer === "string" && data.answer.trim().length > 0) {
    return data.answer;
  }
  return null;
}

// BetterAuth / auth-server offline detection helpers
function isAuthServerOfflineDetail(detail: string | undefined): boolean {
  if (!detail) return false;
  const lowered = detail.toLowerCase();
  return (
    lowered.includes("auth server") ||
    lowered.includes("betterauth") ||
    lowered.includes("all connection attempts failed") ||
    lowered.includes("connection error")
  );
}

function getAutoPersonalizeOfflineMessage(): string {
  return (
    "Auto Personalize (Beta) is disabled in this demo. " +
    "Please use Manual Personalize instead."
  );
}

// ✅ safer response parsing (won't crash if backend returns non-JSON)
async function safeReadJson<T>(res: Response): Promise<T | null> {
  try {
    const text = await res.text();
    if (!text) return null;
    return JSON.parse(text) as T;
  } catch {
    return null;
  }
}

export const ChapterActions: React.FC<ChapterActionsProps> = ({ docId }) => {
  const [activeTab, setActiveTab] = useState<TabKey>("ask");

  // Abort in-flight requests on unmount
  const abortRef = useRef<AbortController | null>(null);
  useEffect(() => {
    return () => {
      abortRef.current?.abort();
    };
  }, []);

  // ---------------------------
  // Ask This Section (Level 7)
  // ---------------------------
  const [askInput, setAskInput] = useState("");
  const [askAnswer, setAskAnswer] = useState<string | null>(null);
  const [askLoading, setAskLoading] = useState(false);
  const [askError, setAskError] = useState<string | null>(null);

  const handleAskSection = async () => {
    const selection = askInput.trim();
    if (!selection || askLoading) return;

    if (!docId) {
      setAskError("No chapter ID configured for this page.");
      return;
    }

    abortRef.current?.abort();
    abortRef.current = new AbortController();

    setAskLoading(true);
    setAskAnswer(null);
    setAskError(null);

    try {
      const res = await fetch(`${API_BASE_URL}/chat/ask-section`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: abortRef.current.signal,
        body: JSON.stringify({
          doc_id: docId,
          selection,
          level: "beginner" as Level, // safe default
        }),
      });

      const data = await safeReadJson<AskSectionResponse>(res);
      // eslint-disable-next-line no-console
      console.log("[ChapterActions] Ask This Section response:", data);

      if (!res.ok) {
        const detail = data?.detail;
        throw new Error(detail || `HTTP error: ${res.status}`);
      }

      const answerText =
        extractMessage(data) ??
        "No answer returned. Please try again with a different selection.";

      setAskAnswer(answerText);
    } catch (error: unknown) {
      if (error instanceof DOMException && error.name === "AbortError") return;
      // eslint-disable-next-line no-console
      console.error("[ChapterActions] Ask This Section failed:", error);
      const message =
        error instanceof Error
          ? error.message
          : "Something went wrong while using Ask This Section.";
      setAskError(message);
    } finally {
      setAskLoading(false);
    }
  };

  // ---------------------------
  // Translate to Urdu (Level 7)
  // ---------------------------
  const [urduResult, setUrduResult] = useState<string | null>(null);
  const [urduLoading, setUrduLoading] = useState(false);
  const [urduError, setUrduError] = useState<string | null>(null);

  const handleTranslateUrdu = async () => {
    if (urduLoading) return;

    if (!docId) {
      setUrduError("No chapter ID configured for this page.");
      return;
    }

    abortRef.current?.abort();
    abortRef.current = new AbortController();

    setUrduLoading(true);
    setUrduResult(null);
    setUrduError(null);

    try {
      const res = await fetch(`${API_BASE_URL}/chat/translate/urdu`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: abortRef.current.signal,
        body: JSON.stringify({ doc_id: docId }),
      });

      const data = await safeReadJson<GenericMessageResponse>(res);
      // eslint-disable-next-line no-console
      console.log("[ChapterActions] Translate to Urdu response:", data);

      if (!res.ok) {
        const detail = data?.detail;
        throw new Error(detail || `HTTP error: ${res.status}`);
      }

      const message = extractMessage(data) ?? "No Urdu translation was returned.";
      setUrduResult(message);
    } catch (error: unknown) {
      if (error instanceof DOMException && error.name === "AbortError") return;
      // eslint-disable-next-line no-console
      console.error("[ChapterActions] Translate to Urdu failed:", error);
      const message =
        error instanceof Error
          ? error.message
          : "Something went wrong while translating to Urdu.";
      setUrduError(message);
    } finally {
      setUrduLoading(false);
    }
  };

  // ---------------------------
  // Manual Personalize (Level 8)
  // ---------------------------
  const [manualLevel, setManualLevel] = useState<Level>("beginner");
  const [manualResult, setManualResult] = useState<string | null>(null);
  const [manualLoading, setManualLoading] = useState(false);
  const [manualError, setManualError] = useState<string | null>(null);

  const handleManualPersonalize = async () => {
    if (manualLoading) return;

    if (!docId) {
      setManualError("No chapter ID configured for this page.");
      return;
    }

    abortRef.current?.abort();
    abortRef.current = new AbortController();

    setManualLoading(true);
    setManualResult(null);
    setManualError(null);

    try {
      const res = await fetch(`${API_BASE_URL}/chat/personalize`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: abortRef.current.signal,
        body: JSON.stringify({
          doc_id: docId,
          level: manualLevel,
        }),
      });

      const data = await safeReadJson<GenericMessageResponse>(res);
      // eslint-disable-next-line no-console
      console.log("[ChapterActions] Manual Personalize response:", data);

      if (!res.ok) {
        const detail = data?.detail;
        throw new Error(detail || `HTTP error: ${res.status}`);
      }

      const message =
        extractMessage(data) ??
        "No personalized version of this chapter was returned.";
      setManualResult(message);
    } catch (error: unknown) {
      if (error instanceof DOMException && error.name === "AbortError") return;
      // eslint-disable-next-line no-console
      console.error("[ChapterActions] Manual Personalize failed:", error);
      const message =
        error instanceof Error
          ? error.message
          : "Something went wrong while personalizing the chapter.";
      setManualError(message);
    } finally {
      setManualLoading(false);
    }
  };

  // ---------------------------
  // Auto Personalize (Level 10 - Beta)
  // ---------------------------
  const [autoResult, setAutoResult] = useState<string | null>(null);
  const [autoPreferredLevel, setAutoPreferredLevel] = useState<Level | null>(null);
  const [autoUserEmail, setAutoUserEmail] = useState<string | null>(null);
  const [autoLoading, setAutoLoading] = useState(false);
  const [autoError, setAutoError] = useState<string | null>(null);

  const handleAutoPersonalize = async () => {
    if (autoLoading) return;

    if (!docId) {
      setAutoError("No chapter ID configured for this page.");
      return;
    }

    abortRef.current?.abort();
    abortRef.current = new AbortController();

    setAutoLoading(true);
    setAutoError(null);
    setAutoResult(null);
    setAutoPreferredLevel(null);
    setAutoUserEmail(null);

    try {
      const res = await fetch(`${API_BASE_URL}/chat/personalize/auto`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include", // send BetterAuth cookies
        signal: abortRef.current.signal,
        body: JSON.stringify({ doc_id: docId }),
      });

      // Explicit 401 → not signed in
      if (res.status === 401) {
        setAutoError("Please sign in to your learning account to use Auto Personalize.");
        return;
      }

      const data = await safeReadJson<AutoPersonalizeResponse>(res);
      // eslint-disable-next-line no-console
      console.log("[ChapterActions] Auto Personalize response:", data);

      if (!res.ok) {
        const detail = data?.detail;
        if (isAuthServerOfflineDetail(detail)) {
          setAutoError(getAutoPersonalizeOfflineMessage());
          return;
        }
        throw new Error(detail || `HTTP error: ${res.status}`);
      }

      if (isAuthServerOfflineDetail(data?.detail)) {
        setAutoError(getAutoPersonalizeOfflineMessage());
        return;
      }

      if (data?.preferred_level) setAutoPreferredLevel(data.preferred_level);
      if (typeof data?.user_email === "string" && data.user_email.length > 0) {
        setAutoUserEmail(data.user_email);
      }

      setAutoResult(
        data?.personalized_markdown ??
          "No personalized chapter was returned from the server.",
      );
    } catch (error: unknown) {
      if (error instanceof DOMException && error.name === "AbortError") return;
      // eslint-disable-next-line no-console
      console.error("[ChapterActions] Auto Personalize failed:", error);

      const message = error instanceof Error ? error.message : undefined;

      if (isAuthServerOfflineDetail(message)) {
        setAutoError(getAutoPersonalizeOfflineMessage());
      } else {
        setAutoError(
          message ?? "Something went wrong while auto-personalizing this chapter.",
        );
      }
    } finally {
      setAutoLoading(false);
    }
  };

  // Shared busy flag so only one action runs at a time
  const isBusy = askLoading || urduLoading || manualLoading || autoLoading;

  // ---------------------------
  // Render
  // ---------------------------
  return (
    <div className={styles.container}>
      <div className={styles.headerRow}>
        <h3 className={styles.title}>AI Tools for This Chapter</h3>
        <div className={styles.badge}>Level 7–10</div>
      </div>

      <div className={styles.tabs}>
        <button
          type="button"
          className={activeTab === "ask" ? styles.tabActive : styles.tab}
          onClick={() => setActiveTab("ask")}
        >
          Ask This Section
        </button>
        <button
          type="button"
          className={activeTab === "urdu" ? styles.tabActive : styles.tab}
          onClick={() => setActiveTab("urdu")}
        >
          Translate to Urdu
        </button>
        <button
          type="button"
          className={activeTab === "manual" ? styles.tabActive : styles.tab}
          onClick={() => setActiveTab("manual")}
        >
          Personalize (Manual)
        </button>
        <button
          type="button"
          className={activeTab === "auto" ? styles.tabActive : styles.tab}
          onClick={() => setActiveTab("auto")}
        >
          Auto Personalize (Beta)
        </button>
      </div>

      {/* Ask This Section */}
      {activeTab === "ask" && (
        <div className={styles.panel}>
          <p className={styles.helperText}>
            Type or paste a paragraph from this chapter and ask for clarification.
          </p>
          <textarea
            className={styles.textarea}
            rows={3}
            value={askInput}
            onChange={(e) => setAskInput(e.target.value)}
            placeholder="Paste a section or question here..."
          />
          <button
            type="button"
            className={styles.primaryButton}
            onClick={handleAskSection}
            disabled={isBusy || !askInput.trim()}
          >
            {askLoading ? "Asking…" : "Ask This Section"}
          </button>

          {askError && <div className={styles.errorBox}>{askError}</div>}

          {askAnswer && (
            <div className={styles.resultBox}>
              <strong>Answer:</strong>
              <p>{askAnswer}</p>
            </div>
          )}
        </div>
      )}

      {/* Translate to Urdu */}
      {activeTab === "urdu" && (
        <div className={styles.panel}>
          <p className={styles.helperText}>
            Translate the entire chapter into Urdu, keeping Markdown structure.
          </p>
          <button
            type="button"
            className={styles.primaryButton}
            onClick={handleTranslateUrdu}
            disabled={isBusy}
          >
            {urduLoading ? "Translating…" : "Translate Full Chapter to Urdu"}
          </button>

          {urduError && <div className={styles.errorBox}>{urduError}</div>}

          {urduResult && (
            <div className={styles.resultBox}>
              <strong>Urdu Translation (Markdown):</strong>
              <pre className={styles.pre}>{urduResult}</pre>
            </div>
          )}
        </div>
      )}

      {/* Manual Personalize */}
      {activeTab === "manual" && (
        <div className={styles.panel}>
          <p className={styles.helperText}>
            Choose a level and generate a version of this chapter for that learner.
          </p>

          <div className={styles.row}>
            <label htmlFor="manual-level">Learner level:</label>
            <select
              id="manual-level"
              value={manualLevel}
              onChange={(e) => setManualLevel(e.target.value as Level)}
              disabled={isBusy}
            >
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          </div>

          <button
            type="button"
            className={styles.primaryButton}
            onClick={handleManualPersonalize}
            disabled={isBusy}
          >
            {manualLoading ? "Personalizing…" : "Generate Personalized Chapter"}
          </button>

          {manualError && <div className={styles.errorBox}>{manualError}</div>}

          {manualResult && (
            <div className={styles.resultBox}>
              <strong>Personalized Chapter (Markdown):</strong>
              <pre className={styles.pre}>{manualResult}</pre>
            </div>
          )}
        </div>
      )}

      {/* Auto Personalize */}
      {activeTab === "auto" && (
        <div className={styles.panel}>
          <p className={styles.helperText}>
            Auto-personalize this chapter based on your BetterAuth profile
            (preferred learning level).
          </p>

          <button
            type="button"
            className={styles.primaryButton}
            onClick={handleAutoPersonalize}
            disabled={isBusy}
          >
            {autoLoading ? "Personalizing…" : "Auto Personalize for Me"}
          </button>

          {autoError && <div className={styles.errorBox}>{autoError}</div>}

          {(autoPreferredLevel || autoUserEmail) && (
            <div className={styles.metaBox}>
              {autoUserEmail && (
                <div>
                  <strong>User:</strong> {autoUserEmail}
                </div>
              )}
              {autoPreferredLevel && (
                <div>
                  <strong>Preferred Level:</strong> {autoPreferredLevel}
                </div>
              )}
            </div>
          )}

          {autoResult && (
            <div className={styles.resultBox}>
              <h4>Auto-Personalized Chapter (Markdown)</h4>
              <p className={styles.helperText}>
                This preview shows how the AI would rewrite this chapter for your
                level. In this demo build it&apos;s just an example; in the live
                system it will be generated automatically from your learning profile.
              </p>
              <pre className={styles.pre}>{autoResult}</pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ChapterActions;
