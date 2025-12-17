/**
 * Spec-Kit Trace
 * Feature: specs/<###-feature-name>/
 * Spec: specs/<###-feature-name>/spec.md
 * Plan: specs/<###-feature-name>/plan.md
 * Tasks: specs/<###-feature-name>/tasks.md
 * Story: US<1|2|3> (Priority Px)
 * Task(s): T###, T###
 * Purpose: Minimal demo auth-server: exposes /healthz and a root route for frontend wiring.
 * Non-Goals: Real authentication, sessions/cookies, user persistence, authorization, production security.
 *
 * NOTE: Replace <...> placeholders with your real feature folder + IDs.
 */

// apps/auth-server/server.js
const express = require("express");
const cors = require("cors");

const app = express();
app.use(express.json());

// env
const PORT = process.env.PORT || 3005;
const TRUSTED_ORIGINS = (process.env.TRUSTED_ORIGINS || "http://localhost:3000")
  .split(",")
  .map((s) => s.trim());

// cors
app.use(
  cors({
    origin: TRUSTED_ORIGINS,
    credentials: true,
  })
);

// Trace: US? / T??? — health check for dev wiring
app.get("/healthz", (req, res) => {
  res.json({ status: "ok", service: "auth-server", version: "0.1.0" });
});

// Trace: US? / T??? — placeholder route for simple smoke test
app.get("/", (req, res) => res.send("auth-server running"));

app.listen(PORT, () => {
  console.log(`auth-server listening on http://127.0.0.1:${PORT}`);
  console.log("TRUSTED_ORIGINS:", TRUSTED_ORIGINS);
});
