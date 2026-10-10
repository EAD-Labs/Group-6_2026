"use client";

import Link from "next/link";

import { AppShell } from "@/components/app-shell";
import { CraftPractice } from "@/components/craft-practice";
import { HydrationGate } from "@/components/ui/hydration-gate";
import { Icon } from "@/components/ui/icon";

export default function CraftPracticePage() {
  return (
    <HydrationGate>
      <AppShell active="learn" contentClassName="learning-reading-scale">
        <nav className="breadcrumbs" aria-label="Breadcrumb"><Link href="/learn/module-2">Module 2</Link><Icon name="chevron-right" /><span>Prompt practice</span></nav>
        <header className="page-heading craft-page-heading">
          <div><span className="eyebrow">Module 2 · Try it yourself</span><h1>Ask AI more clearly</h1><p>Choose a classroom task, write your instructions and get simple suggestions to improve them.</p></div>
          <span className="preview-badge"><Icon name="sparkles" /> Five simple checks</span>
        </header>
        <CraftPractice />
      </AppShell>
    </HydrationGate>
  );
}
