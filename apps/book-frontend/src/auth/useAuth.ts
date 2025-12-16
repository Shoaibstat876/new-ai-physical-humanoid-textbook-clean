import { useEffect, useState } from "react";

type AuthState = {
  isLoggedIn: boolean;
  email: string | null;
  preferredLevel: "beginner" | "intermediate" | "advanced" | null;
};

const STORAGE_KEY = "demo_auth_state_v1";

const DEFAULT_STATE: AuthState = {
  isLoggedIn: false,
  email: null,
  preferredLevel: null,
};

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

function writeState(next: AuthState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // ignore localStorage errors (demo-safe)
  }
}

export function useAuthDemo() {
  const [state, setState] = useState<AuthState>(DEFAULT_STATE);

  useEffect(() => {
    // load on client only
    setState(readState());
  }, []);

  const signInDemo = (email: string, preferredLevel: AuthState["preferredLevel"]) => {
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
