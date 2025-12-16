// apps/book-frontend/src/config/runtime.ts
// Docusaurus-safe runtime config (no process.env in browser code)

function pickEnv(name: string): string | undefined {
  // supports multiple bundlers safely
  const g: any = globalThis as any;

  return (
    g?.process?.env?.[name] ||          // webpack/node-like
    g?.import?.meta?.env?.[name] ||     // vite-like
    undefined
  );
}

export const BACKEND_BASE_URL =
  pickEnv("NEXT_PUBLIC_RAG_API_URL") ||
  pickEnv("REACT_APP_BACKEND_BASE_URL") ||
  "http://localhost:8000";

export const AUTH_SERVER_URL =
  pickEnv("NEXT_PUBLIC_AUTH_BASE_URL") ||
  pickEnv("REACT_APP_AUTH_SERVER_URL") ||
  "http://localhost:3005";
