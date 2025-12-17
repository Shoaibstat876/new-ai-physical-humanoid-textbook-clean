/**
 * Spec-Kit Trace
 * Feature: specs/<###-auth-page-betterauth>/
 * Spec: specs/<###-auth-page-betterauth>/spec.md
 * Plan: specs/<###-auth-page-betterauth>/plan.md
 * Tasks: specs/<###-auth-page-betterauth>/tasks.md
 * Story: US1 (Priority P1)
 * Task(s): T040, T041
 * Purpose: Provide Sign Up + Sign In UI that talks to BetterAuth endpoints and captures user profile fields
 *          (software/hardware background + preferredLevel) used for personalization.
 * Non-Goals: Full account management (reset password, email verification), advanced validation UX,
 *            social login, production-ready error taxonomy, or server-side rendering.
 *
 * NOTE: Replace <...> placeholders with your real feature folder + IDs.
 */

import React, { useState, FormEvent } from "react";

type PreferredLevel = "beginner" | "intermediate" | "advanced";
type FormStatus = string | null;

// Prefer env var → fall back to local BetterAuth dev server
const AUTH_SERVER_URL =
  process.env.NEXT_PUBLIC_AUTH_SERVER_URL ?? "http://localhost:3005";

const AUTH_BASE_URL = `${AUTH_SERVER_URL}/api/auth`;

type AuthResponseShape = {
  detail?: string;
  [key: string]: unknown;
};

// Trace: US1 / T041 — Parse JSON best-effort so UI can show friendly messages
function parseJsonSafe(response: Response): Promise<unknown> {
  return response
    .json()
    .then((data) => data as unknown)
    .catch(() => null);
}

// Trace: US1 / T041 — Extract FastAPI-style error detail
function extractDetail(data: unknown): string | undefined {
  if (!data || typeof data !== "object") return undefined;
  const maybe = data as { detail?: unknown };
  return typeof maybe.detail === "string" ? maybe.detail : undefined;
}

// Trace: US1 / T041 — Identify "auth server offline" error shapes for demo
function isAuthServerOffline(message: string | undefined): boolean {
  if (!message) return false;
  const lower = message.toLowerCase();
  return (
    lower.includes("auth server") ||
    lower.includes("betterauth") ||
    lower.includes("connection refused") ||
    lower.includes("all connection attempts failed") ||
    lower.includes("econnrefused")
  );
}

// Trace: US1 / T041 — Consistent offline message
function offlineMessage(): string {
  return (
    "Auth server is offline in this demo. " +
    "You can still browse the textbook; sign-in and profile-based personalization are temporarily disabled."
  );
}

// Trace: US1 / T040,T041 — BetterAuth Sign Up + Sign In UI
const AuthPage: React.FC = () => {
  // ------- Sign up state -------
  const [signUpEmail, setSignUpEmail] = useState("");
  const [signUpPassword, setSignUpPassword] = useState("");
  const [softwareBackground, setSoftwareBackground] =
    useState<PreferredLevel>("beginner");
  const [hardwareBackground, setHardwareBackground] = useState("none");
  const [preferredLevel, setPreferredLevel] =
    useState<PreferredLevel>("beginner");
  const [signUpStatus, setSignUpStatus] = useState<FormStatus>(null);

  // ------- Sign in state -------
  const [signInEmail, setSignInEmail] = useState("");
  const [signInPassword, setSignInPassword] = useState("");
  const [signInStatus, setSignInStatus] = useState<FormStatus>(null);

  // ------- Sign up handler -------
  async function handleSignUp(e: FormEvent) {
    e.preventDefault();
    setSignUpStatus("Creating account…");

    try {
      const res = await fetch(`${AUTH_BASE_URL}/sign-up/email`, {
        method: "POST",
        credentials: "include", // important for cookies
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: signUpEmail,
          password: signUpPassword,
          // custom profile fields saved with the user
          profile: {
            softwareBackground,
            hardwareBackground,
            // this is what we read on the backend:
            // user.preferredLevel OR user.profile.preferredLevel
            preferredLevel,
          },
        }),
      });

      const rawData = await parseJsonSafe(res);
      const detail = extractDetail(rawData);

      if (!res.ok) {
        if (isAuthServerOffline(detail)) {
          setSignUpStatus(offlineMessage());
          return;
        }

        const message = detail ?? `Sign up failed (HTTP ${res.status}).`;
        setSignUpStatus(message);
        return;
      }

      if (isAuthServerOffline(detail)) {
        setSignUpStatus(offlineMessage());
        return;
      }

      setSignUpStatus("Account created successfully! You can now sign in.");
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Unexpected error during sign up.";
      if (isAuthServerOffline(msg)) {
        setSignUpStatus(offlineMessage());
      } else {
        setSignUpStatus(msg);
      }
    }
  }

  // ------- Sign in handler -------
  async function handleSignIn(e: FormEvent) {
    e.preventDefault();
    setSignInStatus("Signing in…");

    try {
      const res = await fetch(`${AUTH_BASE_URL}/sign-in/email`, {
        method: "POST",
        credentials: "include", // important for cookies
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: signInEmail,
          password: signInPassword,
        }),
      });

      const rawData = await parseJsonSafe(res);
      const detail = extractDetail(rawData);

      if (!res.ok) {
        if (isAuthServerOffline(detail)) {
          setSignInStatus(offlineMessage());
          return;
        }

        const message = detail ?? `Sign in failed (HTTP ${res.status}).`;
        setSignInStatus(message);
        return;
      }

      if (isAuthServerOffline(detail)) {
        setSignInStatus(offlineMessage());
        return;
      }

      setSignInStatus("Signed in successfully!");
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Unexpected error during sign in.";
      if (isAuthServerOffline(msg)) {
        setSignInStatus(offlineMessage());
      } else {
        setSignInStatus(msg);
      }
    }
  }

  return (
    <div
      style={{
        maxWidth: "900px",
        margin: "2rem auto",
        padding: "1rem",
        fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
      }}
    >
      <h1 style={{ fontSize: "2rem", marginBottom: "1rem" }}>
        Sign up for Physical AI &amp; Humanoid Robotics
      </h1>
      <p style={{ marginBottom: "2rem", color: "#4b5563" }}>
        Please share your background so we can personalize the textbook for you.
      </p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "2rem",
          alignItems: "flex-start",
        }}
      >
        {/* ---------- SIGN UP ---------- */}
        <form onSubmit={handleSignUp}>
          <h2 style={{ fontSize: "1.25rem", marginBottom: "1rem" }}>Sign up</h2>

          <label style={{ display: "block", marginBottom: "0.5rem" }}>
            Email
            <input
              type="email"
              required
              value={signUpEmail}
              onChange={(e) => setSignUpEmail(e.target.value)}
              style={{
                width: "100%",
                padding: "0.4rem",
                marginTop: "0.25rem",
                marginBottom: "0.75rem",
              }}
            />
          </label>

          <label style={{ display: "block", marginBottom: "0.5rem" }}>
            Password
            <input
              type="password"
              required
              value={signUpPassword}
              onChange={(e) => setSignUpPassword(e.target.value)}
              style={{
                width: "100%",
                padding: "0.4rem",
                marginTop: "0.25rem",
                marginBottom: "0.75rem",
              }}
            />
          </label>

          <label style={{ display: "block", marginBottom: "0.5rem" }}>
            Software Background
            <select
              value={softwareBackground}
              onChange={(e) =>
                setSoftwareBackground(e.target.value as PreferredLevel)
              }
              style={{
                width: "100%",
                padding: "0.4rem",
                marginTop: "0.25rem",
                marginBottom: "0.75rem",
              }}
            >
              <option value="beginner">Beginner — new to programming</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced developer</option>
            </select>
          </label>

          <label style={{ display: "block", marginBottom: "0.5rem" }}>
            Hardware Background
            <select
              value={hardwareBackground}
              onChange={(e) => setHardwareBackground(e.target.value)}
              style={{
                width: "100%",
                padding: "0.4rem",
                marginTop: "0.25rem",
                marginBottom: "0.75rem",
              }}
            >
              <option value="none">No hardware yet (laptop only)</option>
              <option value="basic">Basic Arduino / sensors</option>
              <option value="robotics">Robotics club / lab access</option>
            </select>
          </label>

          <fieldset
            style={{
              border: "1px solid #e5e7eb",
              padding: "0.75rem",
              marginBottom: "0.75rem",
            }}
          >
            <legend>Preferred Level for Textbook</legend>
            <label style={{ display: "block", marginBottom: "0.25rem" }}>
              <input
                type="radio"
                name="preferredLevel"
                value="beginner"
                checked={preferredLevel === "beginner"}
                onChange={() => setPreferredLevel("beginner")}
              />{" "}
              Beginner
            </label>
            <label style={{ display: "block", marginBottom: "0.25rem" }}>
              <input
                type="radio"
                name="preferredLevel"
                value="intermediate"
                checked={preferredLevel === "intermediate"}
                onChange={() => setPreferredLevel("intermediate")}
              />{" "}
              Intermediate
            </label>
            <label style={{ display: "block" }}>
              <input
                type="radio"
                name="preferredLevel"
                value="advanced"
                checked={preferredLevel === "advanced"}
                onChange={() => setPreferredLevel("advanced")}
              />{" "}
              Advanced
            </label>
          </fieldset>

          <button
            type="submit"
            style={{
              marginTop: "0.5rem",
              padding: "0.4rem 0.9rem",
              borderRadius: "999px",
              border: "none",
              background: "#111827",
              color: "#f9fafb",
              fontSize: "0.9rem",
              cursor: "pointer",
            }}
          >
            Create account
          </button>

          {signUpStatus && (
            <p
              style={{
                marginTop: "0.5rem",
                fontSize: "0.8rem",
                color: signUpStatus.startsWith("Account") ? "#065f46" : "#b91c1c",
              }}
            >
              {signUpStatus}
            </p>
          )}
        </form>

        {/* ---------- SIGN IN ---------- */}
        <form onSubmit={handleSignIn}>
          <h2 style={{ fontSize: "1.25rem", marginBottom: "1rem" }}>
            Sign in
          </h2>

          <label style={{ display: "block", marginBottom: "0.5rem" }}>
            Email
            <input
              type="email"
              required
              value={signInEmail}
              onChange={(e) => setSignInEmail(e.target.value)}
              style={{
                width: "100%",
                padding: "0.4rem",
                marginTop: "0.25rem",
                marginBottom: "0.75rem",
              }}
            />
          </label>

          <label style={{ display: "block", marginBottom: "0.5rem" }}>
            Password
            <input
              type="password"
              required
              value={signInPassword}
              onChange={(e) => setSignInPassword(e.target.value)}
              style={{
                width: "100%",
                padding: "0.4rem",
                marginTop: "0.25rem",
                marginBottom: "0.75rem",
              }}
            />
          </label>

          <button
            type="submit"
            style={{
              marginTop: "0.5rem",
              padding: "0.4rem 0.9rem",
              borderRadius: "999px",
              border: "none",
              background: "#111827",
              color: "#f9fafb",
              fontSize: "0.9rem",
              cursor: "pointer",
            }}
          >
            Sign in
          </button>

          {signInStatus && (
            <p
              style={{
                marginTop: "0.5rem",
                fontSize: "0.8rem",
                color: signInStatus.startsWith("Signed in")
                  ? "#065f46"
                  : "#b91c1c",
              }}
            >
              {signInStatus}
            </p>
          )}
        </form>
      </div>
    </div>
  );
};

export default AuthPage;
