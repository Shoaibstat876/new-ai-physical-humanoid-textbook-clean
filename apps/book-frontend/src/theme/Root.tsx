/**
 * Spec-Kit Trace
 * Feature: specs/<###-global-ui-shell>/
 * Spec: specs/<###-global-ui-shell>/spec.md
 * Plan: specs/<###-global-ui-shell>/plan.md
 * Tasks: specs/<###-global-ui-shell>/tasks.md
 * Story: US1 (Priority P1)
 * Task(s): T001
 * Purpose: Provide the global application shell that mounts cross-cutting UI:
 *          authentication bar, system status bar, and floating AI chat widget.
 * Non-Goals: Routing logic, page-level layout decisions, feature-specific UI,
 *            or backend integration logic.
 *
 * NOTE: Replace <###-global-ui-shell>, US1, and T001 with exact feature IDs.
 * This file is a ROOT-LEVEL COMPOSITION layer, not a feature implementation.
 */

import React from "react";
import type { ReactNode } from "react";

import StatusBar from "@site/src/components/StatusBar/StatusBar";
import { AIChatWidget } from "../components/AIChatWidget/AIChatWidget";
import { AuthBar } from "../auth/AuthBar";

type RootProps = {
  children: ReactNode;
};

// Trace: US1 / T001 — Global UI composition root
export default function Root({ children }: RootProps) {
  return (
    <>
      {/* Trace: US1 / T001 — Auth UI (Level 4/5 demo scope) */}
      <div style={{ padding: "10px 16px" }}>
        <AuthBar />
      </div>

            {/* Trace: US1 / T001 — Global system health status (dev-only) */}
      {typeof window !== "undefined" &&
        window.location.hostname === "localhost" && <StatusBar />}


      {/* Trace: US1 / T001 — Main page content */}
      {children}

      {/* Trace: US1 / T001 — Floating AI Chat Widget (Level 6) */}
      <AIChatWidget />
    </>
  );
}
