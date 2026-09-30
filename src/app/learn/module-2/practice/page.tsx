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
        <nav className="breadcrumbs" aria-label="Breadcrumb"><Link href="/learn/module-2">Module 2</Link><Icon name="chevron-right" /><span>CRAFT practice lab</span></nav>
        <header className="page-heading craft-page-heading">
          <div><span className="eyebrow">Module 2 · Prompt laboratory</span><h1>CRAFT practice lab</h1><p>State the teaching task, test the prompt and use specific feedback to improve the result.</p></div>
          <span className="preview-badge"><Icon name="sparkles" /> Guided AI feedback</span>
        </header>
        <CraftPractice />
      </AppShell>
    </HydrationGate>
  );
}
