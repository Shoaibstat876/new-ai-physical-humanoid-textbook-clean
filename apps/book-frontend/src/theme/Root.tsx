import React from "react";
import type { ReactNode } from "react";

import StatusBar from "@site/src/components/StatusBar/StatusBar";
import { AIChatWidget } from "../components/AIChatWidget/AIChatWidget";

type RootProps = {
  children: ReactNode;
};

export default function Root({ children }: RootProps) {
  return (
    <>
      {/* Global system status (Level 1) */}
      <StatusBar />

      {/* Main page content */}
      {children}

      {/* Floating AI Chat Widget */}
      <AIChatWidget />
    </>
  );
}
