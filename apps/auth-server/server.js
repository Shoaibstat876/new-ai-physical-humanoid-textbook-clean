//apps/auth-server/server.js
const express = require("express");
const cors = require("cors");

const app = express();
app.use(express.json());

// env
const PORT = process.env.PORT || 3005;
const TRUSTED_ORIGINS = (process.env.TRUSTED_ORIGINS || "http://localhost:3000")
  .split(",")
  .map(s => s.trim());

// cors
app.use(
  cors({
    origin: TRUSTED_ORIGINS,
    credentials: true,
  })
);

// health
app.get("/healthz", (req, res) => {
  res.json({ status: "ok", service: "auth-server", version: "0.1.0" });
});

// placeholder routes (so frontend won’t panic later)
app.get("/", (req, res) => res.send("auth-server running"));

app.listen(PORT, () => {
  console.log(`auth-server listening on http://127.0.0.1:${PORT}`);
  console.log("TRUSTED_ORIGINS:", TRUSTED_ORIGINS);
});
