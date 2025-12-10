import { createAuthClient } from "better-auth/react";

/**
 * Spec-Kit Rule Compliance:
 * - ❌ No hard-coded URLs in source files
 * - ✅ Must use environment variable with safe fallback
 * - Frontend should point to BetterAuth server (local or production)
 */

const AUTH_URL =
  process.env.NEXT_PUBLIC_AUTH_SERVER_URL ?? "http://localhost:3005";

export const authClient = createAuthClient({
  baseURL: AUTH_URL,
});
