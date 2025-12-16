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

// ------------------------------
// cookie helper (Level-5)
// ------------------------------
function parseCookies(cookieHeader = "") {
  const out = {};
  cookieHeader.split(";").forEach((part) => {
    const [k, ...v] = part.trim().split("=");
    if (!k) return;
    out[k] = decodeURIComponent(v.join("=") || "");
  });
  return out;
}

// health
app.get("/healthz", (req, res) => {
  res.json({ status: "ok", service: "auth-server", version: "0.1.0" });
});

// ------------------------------
// Level-5: demo /me endpoint
// ------------------------------
app.get("/me", (req, res) => {
  const cookies = parseCookies(req.headers.cookie || "");

  // demo session cookie (set by frontend)
  if (cookies.demo_session !== "1") {
    return res.status(401).json({ error: "not_authenticated" });
  }

  const preferredLevel = cookies.preferred_level || "beginner";

  return res.json({
    email: "demo@user.com",
    preferredLevel,
  });
});

// placeholder routes (so frontend won’t panic later)
app.get("/", (req, res) => res.send("auth-server running"));

app.listen(PORT, () => {
  console.log(`auth-server listening on http://127.0.0.1:${PORT}`);
  console.log("TRUSTED_ORIGINS:", TRUSTED_ORIGINS);
});
