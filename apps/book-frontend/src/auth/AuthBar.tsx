import React, { useState } from "react";
import { useAuthDemo } from "./useAuth";

export const AuthBar: React.FC = () => {
  const { state, signInDemo, signOut } = useAuthDemo();
  const [email, setEmail] = useState("demo@user.com");
  const [level, setLevel] = useState<"beginner" | "intermediate" | "advanced">(
    "beginner"
  );

  // --- Level-5 cookie helpers ---
  function setDemoCookies(preferredLevel: string) {
    document.cookie = "demo_session=1; Path=/; SameSite=Lax";
    document.cookie = `preferred_level=${encodeURIComponent(
      preferredLevel
    )}; Path=/; SameSite=Lax`;
  }

  function clearDemoCookies() {
    document.cookie = "demo_session=; Path=/; Max-Age=0; SameSite=Lax";
    document.cookie = "preferred_level=; Path=/; Max-Age=0; SameSite=Lax";
  }

  if (state.isLoggedIn) {
    return (
      <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
        <span>
          Logged in as: <strong>{state.email}</strong>
        </span>
        {state.preferredLevel && (
          <span>
            Preferred level: <strong>{state.preferredLevel}</strong>
          </span>
        )}
        <button
          onClick={() => {
            clearDemoCookies();
            signOut();
          }}
          style={{
            padding: "6px 10px",
            borderRadius: 8,
            border: "1px solid rgba(255,255,255,0.2)",
            background: "rgba(255,255,255,0.06)",
            cursor: "pointer",
          }}
        >
          Sign out
        </button>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
      <input
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
        style={{
          padding: "6px 10px",
          borderRadius: 8,
          border: "1px solid rgba(255,255,255,0.2)",
          background: "rgba(0,0,0,0.2)",
        }}
      />
      <select
        value={level}
        onChange={(e) => setLevel(e.target.value as any)}
        style={{
          padding: "6px 10px",
          borderRadius: 8,
          border: "1px solid rgba(255,255,255,0.2)",
          background: "rgba(0,0,0,0.2)",
        }}
      >
        <option value="beginner">beginner</option>
        <option value="intermediate">intermediate</option>
        <option value="advanced">advanced</option>
      </select>

      <button
        onClick={() => {
          setDemoCookies(level);
          signInDemo(email, level);
        }}
        style={{
          padding: "6px 10px",
          borderRadius: 8,
          border: "1px solid rgba(255,255,255,0.2)",
          background: "rgba(255,255,255,0.06)",
          cursor: "pointer",
        }}
      >
        Sign in (demo)
      </button>
    </div>
  );
};
