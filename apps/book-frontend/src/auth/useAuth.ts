/**
 * Spec-Kit Trace
 * Feature: specs/<###-demo-auth>/
 * Spec: specs/<###-demo-auth>/spec.md
 * Plan: specs/<###-demo-auth>/plan.md
 * Tasks: specs/<###-demo-auth>/tasks.md
 * Story: US1 (Priority P1)
 * Task(s): T013
 * Purpose: Provide a demo-only auth state hook (sign in/out + preferred level) with client-side persistence.
 * Non-Goals: Real authentication, secure session storage, server verification, multi-user support, production persistence guarantees.
 *
 * NOTE: Replace <###-demo-auth>, US1, and T013 with the exact feature IDs.
 */

import { useEffect, useState } from "react";

// Trace: US1 / T013 — Demo auth state contract used by AuthBar and demo flows
type AuthState = {
  isLoggedIn: boolean;
  email: string | null;
  preferredLevel: "beginner" | "intermediate" | "advanced" | null;
};

// Trace: US1 / T013 — LocalStorage key for demo persistence
const STORAGE_KEY = "demo_auth_state_v1";

// Trace: US1 / T013 — Default state (logged out)
const DEFAULT_STATE: AuthState = {
  isLoggedIn: false,
  email: null,
  preferredLevel: null,
};

// Trace: US1 / T013 — Read persisted demo auth state
function readState(): AuthState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_STATE;

    const parsed = JSON.parse(raw) as Partial<AuthState>;

    return {
      isLoggedIn: Boolean(parsed.isLoggedIn),
      email: typeof parsed.email === "string" ? parsed.email : null,
      preferredLevel:
        parsed.preferredLevel === "beginner" ||
        parsed.preferredLevel === "intermediate" ||
        parsed.preferredLevel === "advanced"
          ? parsed.preferredLevel
          : null,
    };
  } catch {
    return DEFAULT_STATE;
  }
}

// Trace: US1 / T013 — Persist demo auth state (best-effort)
function writeState(next: AuthState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // ignore localStorage errors (demo-safe)
  }
}

// Trace: US1 / T013 — Public hook API consumed by UI
export function useAuthDemo() {
  const [state, setState] = useState<AuthState>(DEFAULT_STATE);

  useEffect(() => {
    // load on client only
    setState(readState());
  }, []);

  const signInDemo = (
    email: string,
    preferredLevel: AuthState["preferredLevel"]
  ) => {
    const next: AuthState = { isLoggedIn: true, email, preferredLevel };
    setState(next);
    writeState(next);
  };

  const signOut = () => {
    setState(DEFAULT_STATE);
    writeState(DEFAULT_STATE);
  };

  return { state, signInDemo, signOut };
}
