import React, { useState, FormEvent } from "react";
import { AUTH_SERVER_URL } from "../config/runtime";

type PreferredLevel = "beginner" | "intermediate" | "advanced";
type FormStatus = string | null;

function normalizeBaseUrl(url: string): string {
  return url.replace(/\/+$/, "");
}

// ✅ Runtime config only (no process.env)
const AUTH_SERVER = normalizeBaseUrl(AUTH_SERVER_URL);
const AUTH_BASE_URL = `${AUTH_SERVER}/api/auth`;

type AuthResponseShape = {
  detail?: string;
  [key: string]: unknown;
};

function parseJsonSafe(response: Response): Promise<unknown> {
  return response
    .json()
    .then((data) => data as unknown)
    .catch(() => null);
}

function extractDetail(data: unknown): string | undefined {
  if (!data || typeof data !== "object") return undefined;
  const maybe = data as { detail?: unknown };
  return typeof maybe.detail === "string" ? maybe.detail : undefined;
}

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

function offlineMessage(): string {
  return (
    "Auth server is offline in this demo. " +
    "You can still browse the textbook; sign-in and profile-based personalization are temporarily disabled."
  );
}

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
              onChange={(e) => setSoftwareBackground(e.target.value as PreferredLevel)}
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
          <h2 style={{ fontSize: "1.25rem", marginBottom: "1rem" }}>Sign in</h2>

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
                color: signInStatus.startsWith("Signed in") ? "#065f46" : "#b91c1c",
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
