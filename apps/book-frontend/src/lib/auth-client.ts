import { createAuthClient } from "better-auth/react";
import { AUTH_SERVER_URL } from "../config/runtime";

/**
 * Browser-safe auth client (Docusaurus-safe)
 * - No process.env in frontend code
 * - Uses centralized runtime config
 */

function normalizeBaseUrl(url: string): string {
  // avoid trailing slash issues: "http://x/" + "/healthz" => double slashes
  return url.replace(/\/+$/, "");
}

export const AUTH_BASE_URL = normalizeBaseUrl(AUTH_SERVER_URL);

export const authClient = createAuthClient({
  baseURL: AUTH_BASE_URL,
});
