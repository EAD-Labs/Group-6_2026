"use client";

import Link from "next/link";

import { AppShell } from "@/components/app-shell";
import { CraftPractice } from "@/components/craft-practice";
import { HydrationGate } from "@/components/ui/hydration-gate";
import { Icon } from "@/components/ui/icon";
import { useDemo } from "@/features/demo/demo-provider";
import { hasPassedModuleOne } from "@/features/demo/demo-state";

export default function CraftPracticePage() {
  const { isPresentationDemo, state } = useDemo();
  const unlocked = isPresentationDemo || hasPassedModuleOne(state.quizAttempts);

  return (
    <HydrationGate>
      <AppShell active="learn">
        <nav className="breadcrumbs" aria-label="Breadcrumb"><Link href="/learn/module-2">Module 2</Link><Icon name="chevron-right" /><span>CRAFT practice lab</span></nav>
        {!unlocked ? (
          <section className="empty-state-card locked-module-card">
            <span className="empty-state-icon"><Icon name="lock" /></span>
            <div><span className="overline">Practice locked</span><h1>Complete Module 1 first</h1><p>Finish the foundation pathway and pass its knowledge check to open CRAFT practice.</p></div>
            <Link className="button button-primary" href="/learn/module-1">Return to Module 1 <Icon name="arrow-right" /></Link>
          </section>
        ) : (
          <>
            <header className="page-heading craft-page-heading">
              <div><span className="eyebrow">Module 2 · Prompt laboratory</span><h1>CRAFT practice lab</h1><p>State the teaching task, test the prompt and use specific feedback to improve the result.</p></div>
              <span className="preview-badge"><Icon name="sparkles" /> Guided AI feedback</span>
            </header>
            <CraftPractice />
          </>
        )}
      </AppShell>
    </HydrationGate>
  );
}
