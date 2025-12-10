import React, { useState } from "react";

type Level = "beginner" | "intermediate" | "advanced";

type PersonalizeChapterButtonProps = {
  // e.g. "foundations/why-physical-ai-matters"
  docId: string;
};

// Prefer env var, fall back to localhost for local dev
const API_BASE_URL =
  process.env.NEXT_PUBLIC_RAG_API_URL ?? "http://localhost:8000";

type AutoPersonalizeResponse = {
  preferred_level?: Level | string;
  user_email?: string | null;
  personalized_markdown?: string;
  message?: string;
  markdown?: string;
  detail?: string;
};

type ErrorShape = {
  detail?: string;
};

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

function extractMarkdown(data: AutoPersonalizeResponse | null): string | null {
  if (!data || typeof data !== "object") return null;

  if (typeof data.personalized_markdown === "string") {
    return data.personalized_markdown;
  }
  if (typeof data.message === "string") {
    return data.message;
  }
  if (typeof data.markdown === "string") {
    return data.markdown;
  }
  return null;
}

const PersonalizeChapterButton: React.FC<PersonalizeChapterButtonProps> = ({
  docId,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preferredLevel, setPreferredLevel] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [personalizedMarkdown, setPersonalizedMarkdown] = useState<
    string | null
  >(null);

  const handlePersonalizeAuto = async () => {
    if (!docId) {
      setError("No chapter ID found for this page.");
      return;
    }
    if (isLoading) return;

    setIsLoading(true);
    setError(null);
    setPreferredLevel(null);
    setUserEmail(null);
    setPersonalizedMarkdown(null);

    try {
      const res = await fetch(`${API_BASE_URL}/chat/personalize/auto`, {
        method: "POST",
        credentials: "include", // send BetterAuth cookies
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          // IMPORTANT: snake_case to match FastAPI schema
          doc_id: docId,
        }),
      });

      let data: AutoPersonalizeResponse | ErrorShape | null = null;

      try {
        data = (await res.json()) as AutoPersonalizeResponse | ErrorShape;
      } catch {
        data = null;
      }

      // Explicit 401 → not signed in
      if (res.status === 401) {
        setError(
          "Please sign in to your learning account to use Auto Personalize.",
        );
        return;
      }

      const detail =
        data && "detail" in data && typeof data.detail === "string"
          ? data.detail
          : undefined;

      // Non-OK + auth server offline → friendly Beta message
      if (!res.ok) {
        if (isAuthServerOfflineDetail(detail)) {
          setError(getAutoPersonalizeOfflineMessage());
          return;
        }

        const message =
          detail || `Personalization failed (HTTP ${res.status}).`;
        setError(message);
        return;
      }

      // OK but backend still tells us auth server is offline
      if (isAuthServerOfflineDetail(detail)) {
        setError(getAutoPersonalizeOfflineMessage());
        return;
      }

      const typedData = data as AutoPersonalizeResponse | null;

      if (typedData) {
        if (
          typeof typedData.preferred_level === "string" &&
          typedData.preferred_level.length > 0
        ) {
          setPreferredLevel(typedData.preferred_level);
        }

        if (
          typeof typedData.user_email === "string" &&
          typedData.user_email.length > 0
        ) {
          setUserEmail(typedData.user_email);
        }

        const markdown = extractMarkdown(typedData);
        if (markdown) {
          setPersonalizedMarkdown(markdown);
          return;
        }
      }

      // If nothing matched, show generic success
      setPersonalizedMarkdown(
        "Personalization completed, but no markdown was returned.",
      );
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Unexpected error occurred.";

      if (isAuthServerOfflineDetail(message)) {
        setError(getAutoPersonalizeOfflineMessage());
      } else {
        setError(message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      style={{
        border: "1px solid #e5e7eb",
        borderRadius: "0.75rem",
        padding: "0.75rem 0.9rem",
        margin: "1rem 0",
        background: "#f9fafb",
      }}
    >
      <div
        style={{
          fontSize: "0.85rem",
          fontWeight: 600,
          color: "#4b5563",
          marginBottom: "0.5rem",
        }}
      >
        AI Personalization (Auto, Beta)
      </div>

      <button
        type="button"
        onClick={handlePersonalizeAuto}
        disabled={isLoading}
        style={{
          borderRadius: "999px",
          border: "none",
          padding: "0.35rem 0.9rem",
          fontSize: "0.8rem",
          cursor: isLoading ? "not-allowed" : "pointer",
          opacity: isLoading ? 0.7 : 1,
          background: "#111827",
          color: "#f9fafb",
        }}
      >
        {isLoading
          ? "Personalizing using your profile..."
          : "Personalize using my profile"}
      </button>

      {error && (
        <div
          style={{
            marginTop: "0.5rem",
            fontSize: "0.75rem",
            color: "#b91c1c",
          }}
        >
          {error}
        </div>
      )}

      {(preferredLevel || userEmail) && (
        <div
          style={{
            marginTop: "0.5rem",
            fontSize: "0.75rem",
            color: "#6b7280",
          }}
        >
          {preferredLevel && (
            <>
              Detected level from your profile:{" "}
              <strong>{preferredLevel}</strong>
            </>
          )}
          {userEmail && (
            <>
              {" "}
              – <span>{userEmail}</span>
            </>
          )}
        </div>
      )}

      {personalizedMarkdown && (
        <div
          style={{
            marginTop: "0.75rem",
            fontSize: "0.8rem",
            color: "#111827",
            borderTop: "1px solid #e5e7eb",
            paddingTop: "0.75rem",
            whiteSpace: "pre-wrap",
          }}
        >
          <div
            style={{
              fontSize: "0.8rem",
              fontWeight: 600,
              marginBottom: "0.25rem",
              color: "#4b5563",
            }}
          >
            Personalized Version (Markdown):
          </div>

          {personalizedMarkdown}
        </div>
      )}
    </div>
  );
};

export default PersonalizeChapterButton;
