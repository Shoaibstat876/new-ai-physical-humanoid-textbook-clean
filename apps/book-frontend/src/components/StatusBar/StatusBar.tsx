/**
 * Spec-Kit Trace
 * Feature: specs/<###-system-status-bar>/
 * Spec: specs/<###-system-status-bar>/spec.md
 * Plan: specs/<###-system-status-bar>/plan.md
 * Tasks: specs/<###-system-status-bar>/tasks.md
 * Story: US1 (Priority P1)
 * Task(s): T005
 * Purpose: Display real-time health status of backend and auth-server services
 *          for development and demo verification.
 * Non-Goals: Monitoring alerts, retries/backoff, production observability,
 *            metrics aggregation, or SLA reporting.
 *
 * NOTE: Replace <###-system-status-bar>, US1, and T005 with exact feature IDs.
 */

import React, { useEffect, useState } from "react";

// Trace: US1 / T005 — Health status states
type Status = "ok" | "down" | "checking" | "na";

// Trace: US1 / T005 — Visual status chip (presentational)
function Chip({ label, status }: { label: string; status: Status }) {
  const color =
    status === "ok"
      ? "#16a34a"
      : status === "down"
      ? "#dc2626"
      : status === "na"
      ? "#64748b"
      : "#f59e0b";

  const text =
    status === "ok"
      ? "OK"
      : status === "down"
      ? "DOWN"
      : status === "na"
      ? "N/A"
      : "CHECKING";

  return (
    <span
      style={{
        padding: "4px 10px",
        borderRadius: "999px",
        background: color,
        color: "white",
        fontSize: "12px",
        marginRight: "8px",
        display: "inline-block",
      }}
    >
      {label}: {text}
    </span>
  );
}

// Trace: US1 / T005 — Global system health status bar
export default function StatusBar() {
  const [backend, setBackend] = useState<Status>("checking");
  const [auth, setAuth] = useState<Status>("checking");

  useEffect(() => {
    // Trace: US1 / T005 — Backend health probe
    fetch("http://127.0.0.1:8000/health")
      .then(() => setBackend("ok"))
      .catch(() => setBackend("down"));

    // Trace: US1 / T005 — Auth-server health probe
    fetch("http://127.0.0.1:3005/healthz", {
      credentials: "include",
    })
      .then(() => setAuth("ok"))
      .catch(() => setAuth("down"));
  }, []);

  return (
    <div style={{ margin: "8px 0 12px" }}>
      <Chip label="Backend" status={backend} />
      <Chip label="Auth" status={auth} />
    </div>
  );
}
