import React from "react";
import type { ReactNode } from "react";

import StatusBar from "@site/src/components/StatusBar/StatusBar";
import { AuthBar } from "../auth/AuthBar";
import { AIChatWidget } from "../components/AIChatWidget/AIChatWidget";

type RootProps = {
  children: ReactNode;
};

export default function Root({ children }: RootProps) {
  return (
    <>
      {/* Global system status (Level 1) */}
      <StatusBar />

      {/* Auth server status (Level 3 – demo only) */}
      <div style={{ padding: "10px 16px" }}>
        <AuthBar />
      </div>

      {/* Main page content */}
      {children}

      {/* Floating AI Chat Widget */}
      <AIChatWidget />
    </>
  );
}
