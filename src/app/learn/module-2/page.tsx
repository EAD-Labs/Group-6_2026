"use client";

import Link from "next/link";

import { AppShell } from "@/components/app-shell";
import { HydrationGate } from "@/components/ui/hydration-gate";
import { Icon } from "@/components/ui/icon";
import { useDemo } from "@/features/demo/demo-provider";
import { hasPassedModuleOne } from "@/features/demo/demo-state";
import { craftDimensions, craftScenarios } from "@/features/learning/craft";
import { learningModules } from "@/features/learning/catalog";

export default function ModuleTwoPage() {
  const { state } = useDemo();
  const unlocked = hasPassedModuleOne(state.quizAttempts);
  const moduleTwo = learningModules[1];

  return (
    <HydrationGate>
      <AppShell active="learn">
        <nav className="breadcrumbs" aria-label="Breadcrumb"><Link href="/dashboard">Home</Link><Icon name="chevron-right" /><span>Module 2 preview</span></nav>
        {!unlocked ? (
          <section className="empty-state-card locked-module-card">
            <span className="empty-state-icon"><Icon name="lock" /></span>
            <div><span className="overline">Module locked</span><h1>Complete Module 1 first</h1><p>The CRAFT practice lab unlocks after all three foundation lessons and a quiz score of at least 70%.</p></div>
            <Link className="button button-primary" href="/learn/module-1">Return to Module 1 <Icon name="arrow-right" /></Link>
          </section>
        ) : (
          <>
            <header className="module-hero craft-module-hero">
              <div>
                <span className="module-badge">Module 2 · Early preview</span>
                <h1>{moduleTwo.title}</h1>
                <p>{moduleTwo.description} This vertical slice is ready early for client validation.</p>
                <div className="metadata-row"><span><Icon name="target" />CRAFT framework</span><span><Icon name="document" />5 teacher scenarios</span><span><Icon name="shield" />No API key needed</span></div>
                <Link className="button button-primary" href="/learn/module-2/practice">Open the CRAFT lab <Icon name="arrow-right" /></Link>
              </div>
              <div className="craft-letter-stack" aria-label="CRAFT means Context, Role, Action, Format and Target">
                {craftDimensions.map((dimension) => <span key={dimension.id}><strong>{dimension.label.slice(0, 1)}</strong>{dimension.label}</span>)}
              </div>
            </header>

            <section className="learning-outcomes" aria-labelledby="craft-outcomes-title"><div className="outcomes-icon"><Icon name="target" /></div><div><h2 id="craft-outcomes-title">What this preview proves</h2><ul><li><Icon name="check" />A teacher can write a prompt in her own words.</li><li><Icon name="check" />Every CRAFT dimension receives a 0–3 score with actionable feedback.</li><li><Icon name="check" />A stronger prompt can be checked and compared in the same activity.</li></ul></div></section>

            <section className="activity-section" aria-labelledby="scenario-preview-title"><div className="section-heading"><div><span className="eyebrow">Teacher-specific practice</span><h2 id="scenario-preview-title">Five real classroom scenarios</h2></div><span className="section-meta">Selected from the content pack</span></div><div className="scenario-preview-grid">{craftScenarios.map((scenario, index) => <article key={scenario.id}><span>{String(index + 1).padStart(2, "0")}</span><h3>{scenario.title}</h3><p>{scenario.summary}</p></article>)}</div></section>

            <section className="privacy-card wide"><Icon name="info" /><div><strong>AI evaluation boundary</strong><p>The evaluator runs on the server and stores no raw prompt text. A deterministic CRAFT check provides feedback if the evaluator is unavailable. Teachers must still verify facts, suitability, privacy and copyright before classroom use.</p></div></section>
          </>
        )}
      </AppShell>
    </HydrationGate>
  );
}
