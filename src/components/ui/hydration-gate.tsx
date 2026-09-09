"use client";

import type { ReactNode } from "react";

import { useDemo } from "@/features/demo/demo-provider";

export function HydrationGate({ children }: { children: ReactNode }) {
  const { hydrated } = useDemo();

  if (!hydrated) {
    return (
      <main className="centered-state" id="main-content" aria-busy="true" aria-live="polite">
        <div className="loading-lockup">
          <span className="brand-mark" aria-hidden="true">
            प
          </span>
          <div>
            <strong>Preparing your learning space</strong>
            <span>Restoring your saved progress…</span>
          </div>
        </div>
      </main>
    );
  }

  return children;
}
