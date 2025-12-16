import React, { useEffect, useMemo, useState } from "react";

type Status = "ok" | "down" | "checking" | "na";

type ProbeResult = {
  status: Status;
  checkedAt: number | null;
};

const DEFAULT_BACKEND_BASE_URL = "http://127.0.0.1:8000";
const DEFAULT_AUTH_BASE_URL = "http://127.0.0.1:3005";

const POLL_MS = 4000;

function Chip({ label, status }: { label: string; status: Status }) {
  const { bg, text } = useMemo(() => {
    switch (status) {
      case "ok":
        return { bg: "#16a34a", text: "OK" };
      case "down":
        return { bg: "#dc2626", text: "DOWN" };
      case "na":
        return { bg: "#64748b", text: "N/A" };
      default:
        return { bg: "#f59e0b", text: "CHECKING" };
    }
  }, [status]);

  return (
    <span
      style={{
        padding: "4px 10px",
        borderRadius: 999,
        background: bg,
        color: "white",
        fontSize: 12,
        fontWeight: 700,
        marginRight: 8,
        display: "inline-block",
        letterSpacing: "0.02em",
      }}
    >
      {label}: {text}
    </span>
  );
}

async function probe(url: string): Promise<boolean> {
  try {
    // GET is fine for health endpoints; `cache: "no-store"` avoids stale responses in some setups
    const res = await fetch(url, { method: "GET", cache: "no-store" });
    return res.ok;
  } catch {
    return false;
  }
}

export default function StatusBar() {
  // Docusaurus exposes env vars as process.env in build time; keep fallbacks safe.
  const BACKEND_BASE_URL =
    (process.env.RAG_API_URL as string | undefined) ?? DEFAULT_BACKEND_BASE_URL;

  const AUTH_BASE_URL =
    (process.env.AUTH_API_URL as string | undefined) ?? DEFAULT_AUTH_BASE_URL;

  const [backend, setBackend] = useState<ProbeResult>({
    status: "checking",
    checkedAt: null,
  });

  const [auth, setAuth] = useState<ProbeResult>({
    status: "checking",
    checkedAt: null,
  });

  useEffect(() => {
    let cancelled = false;

    const tick = async () => {
      // If in some branches you truly don't have auth-server, you can flip this to "na"
      const [backendOk, authOk] = await Promise.all([
        probe(`${BACKEND_BASE_URL}/health`),
        probe(`${AUTH_BASE_URL}/healthz`),
      ]);

      if (cancelled) return;

      const now = Date.now();
      setBackend({ status: backendOk ? "ok" : "down", checkedAt: now });
      setAuth({ status: authOk ? "ok" : "down", checkedAt: now });
    };

    tick();
    const id = window.setInterval(tick, POLL_MS);

    return () => {
      cancelled = true;
      window.clearInterval(id);
    };
  }, [BACKEND_BASE_URL, AUTH_BASE_URL]);

  const lastChecked =
    backend.checkedAt || auth.checkedAt
      ? new Date(Math.max(backend.checkedAt ?? 0, auth.checkedAt ?? 0)).toLocaleTimeString()
      : null;

  return (
    <div style={{ margin: "8px 0 12px", display: "flex", alignItems: "center", gap: 10 }}>
      <div>
        <Chip label="Backend" status={backend.status} />
        <Chip label="Auth" status={auth.status} />
      </div>

      {lastChecked && (
        <span style={{ fontSize: 12, color: "#64748b" }}>
          Last checked: {lastChecked}
        </span>
      )}
    </div>
  );
}
