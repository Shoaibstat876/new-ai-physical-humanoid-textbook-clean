import React, { useEffect, useMemo, useState } from "react";
import { BACKEND_BASE_URL, AUTH_SERVER_URL } from "@site/src/config/runtime";

type Status = "ok" | "down" | "checking" | "na";

type ProbeResult = {
  status: Status;
  checkedAt: number | null;
};

const POLL_MS = 5000;

// Turn this OFF if you want Auth always N/A until auth server is deployed
const AUTH_ENABLED = true;

function Chip({ label, status }: { label: string; status: Status }) {
  const { bg, text } = useMemo(() => {
    switch (status) {
      case "ok":
        return { bg: "#16a34a", text: "OK" };
      case "down":
        return { bg: "#dc2626", text: "OFF" };
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
        display: "inline-block",
        letterSpacing: "0.02em",
      }}
    >
      {label}: {text}
    </span>
  );
}

async function probe(url: string, timeoutMs = 2500): Promise<boolean> {
  const controller = new AbortController();
  const t = globalThis.setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(url, {
      method: "GET",
      cache: "no-store",
      signal: controller.signal,
    });
    return res.ok;
  } catch {
    return false;
  } finally {
    globalThis.clearTimeout(t);
  }
}

export default function StatusBar() {
  const [backend, setBackend] = useState<ProbeResult>({
    status: "checking",
    checkedAt: null,
  });

  const [auth, setAuth] = useState<ProbeResult>({
    status: AUTH_ENABLED ? "checking" : "na",
    checkedAt: null,
  });

  useEffect(() => {
    let cancelled = false;

    const tick = async () => {
      const backendOk = await probe(`${BACKEND_BASE_URL}/health`);

      const authOk = AUTH_ENABLED
        ? await probe(`${AUTH_SERVER_URL}/healthz`)
        : false;

      if (cancelled) return;

      const now = Date.now();

      setBackend({
        status: backendOk ? "ok" : "down",
        checkedAt: now,
      });

      setAuth({
        status: AUTH_ENABLED ? (authOk ? "ok" : "down") : "na",
        checkedAt: now,
      });
    };

    tick();
    const id = globalThis.setInterval(tick, POLL_MS);

    return () => {
      cancelled = true;
      globalThis.clearInterval(id);
    };
  }, []);

  const lastChecked =
    backend.checkedAt || auth.checkedAt
      ? new Date(
          Math.max(backend.checkedAt ?? 0, auth.checkedAt ?? 0),
        ).toLocaleTimeString()
      : null;

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "8px 16px",
        flexWrap: "wrap",
      }}
    >
      <Chip label="Backend" status={backend.status} />
      <Chip label="Auth" status={auth.status} />

      {lastChecked && (
        <span style={{ fontSize: 12, color: "#64748b" }}>
          Last checked: {lastChecked}
        </span>
      )}
    </div>
  );
}
