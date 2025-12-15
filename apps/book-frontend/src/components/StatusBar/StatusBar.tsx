import React, { useEffect, useState } from "react";

type Status = "ok" | "down" | "checking" | "na";

function Chip({ label, status }: { label: string; status: Status }) {
  const color =
    status === "ok" ? "#16a34a" :
    status === "down" ? "#dc2626" :
    status === "na" ? "#64748b" :
    "#f59e0b";

  const text =
    status === "ok" ? "OK" :
    status === "down" ? "DOWN" :
    status === "na" ? "N/A" :
    "CHECKING";

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

export default function StatusBar() {
  const [backend, setBackend] = useState<Status>("checking");
  const [auth, setAuth] = useState<Status>("na"); // ✅ no auth-server in this repo yet

  useEffect(() => {
    fetch("http://localhost:8000/health")
      .then(() => setBackend("ok"))
      .catch(() => setBackend("down"));
  }, []);

  return (
    <div style={{ margin: "8px 0 12px" }}>
      <Chip label="Backend" status={backend} />
      <Chip label="Auth" status={auth} />
    </div>
  );
}
