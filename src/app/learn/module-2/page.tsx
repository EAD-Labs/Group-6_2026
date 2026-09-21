"use client";

import Link from "next/link";

import { AppShell } from "@/components/app-shell";
import { HydrationGate } from "@/components/ui/hydration-gate";
import { Icon } from "@/components/ui/icon";
import { useDemo } from "@/features/demo/demo-provider";
import { hasPassedModuleOne } from "@/features/demo/demo-state";
import { craftDimensions, craftScenarios } from "@/features/learning/craft";
import { learningModules } from "@/features/learning/catalog";
import { moduleTwoLessons, moduleTwoMinutes } from "@/features/learning/module-two-content";

export default function ModuleTwoPage() {
  const { isPresentationDemo, state } = useDemo();
  const unlocked = isPresentationDemo || hasPassedModuleOne(state.quizAttempts);
  const moduleTwo = learningModules[1];

  return (
    <HydrationGate>
      <AppShell active="learn">
        <nav className="breadcrumbs" aria-label="Breadcrumb"><Link href="/dashboard">Home</Link><Icon name="chevron-right" /><span>Module 2</span></nav>
        {!unlocked ? (
          <section className="empty-state-card locked-module-card">
            <span className="empty-state-icon"><Icon name="lock" /></span>
            <div><span className="overline">Module locked</span><h1>Complete Module 1 first</h1><p>The prompt-engineering pathway unlocks after all six foundation lessons and a quiz score of at least 70%.</p></div>
            <Link className="button button-primary" href="/learn/module-1">Return to Module 1 <Icon name="arrow-right" /></Link>
          </section>
        ) : (
          <>
            <header className="module-hero craft-module-hero">
              <div>
                <span className="module-badge">Module 2 · Complete syllabus</span>
                <h1>{moduleTwo.title}</h1>
                <p>{moduleTwo.description} Test, compare and save prompts whose classroom value can be checked.</p>
                <div className="metadata-row"><span><Icon name="clock" />{moduleTwoMinutes} minutes</span><span><Icon name="document" />{moduleTwoLessons.length} lessons + prompt library</span><span><Icon name="target" />CRAFT practice lab</span></div>
                <Link className="button button-primary" href="/learn/module-2/practice">Open the CRAFT lab <Icon name="arrow-right" /></Link>
              </div>
              <div className="craft-letter-stack" aria-label="CRAFT means Context, Role, Action, Format and Target">
                {craftDimensions.map((dimension) => <span key={dimension.id}><strong>{dimension.label.slice(0, 1)}</strong>{dimension.label}</span>)}
              </div>
            </header>

            <section className="learning-outcomes" aria-labelledby="craft-outcomes-title"><div className="outcomes-icon"><Icon name="target" /></div><div><h2 id="craft-outcomes-title">By the end of this module, you can</h2><ul><li><Icon name="check" />Specify role, learners, task, context or source, output format and checks.</li><li><Icon name="check" />Align lesson plans, questions and feedback with a learning objective.</li><li><Icon name="check" />Test prompt versions against accuracy, alignment, practicality and clarity.</li><li><Icon name="check" />Build three reusable prompt templates with known limits and verification steps.</li></ul></div></section>

            <section className="activity-section" aria-labelledby="module-two-lessons-title"><div className="section-heading"><div><span className="eyebrow">Research-backed pathway</span><h2 id="module-two-lessons-title">Seven lessons from first draft to reusable library</h2></div><span className="section-meta">Practice and evidence in every lesson</span></div><ol className="module-two-syllabus">{moduleTwoLessons.map((lesson, index) => <li key={lesson.id}><div className="module-two-lesson-heading"><span>{String(index + 1).padStart(2, "0")}</span><div><small>{lesson.durationMinutes} minutes</small><h3>{lesson.title}</h3></div></div><p>{lesson.summary}</p><dl><div><dt>Practice</dt><dd>{lesson.practice}</dd></div><div><dt>Evidence</dt><dd>{lesson.evidence}</dd></div></dl><div className="module-two-resources">{lesson.resources.map((resource) => <a href={resource.url} key={resource.url} rel={resource.url.startsWith("http") ? "noreferrer" : undefined} target={resource.url.startsWith("http") ? "_blank" : undefined}><Icon name={resource.url.includes("youtube") ? "play" : "document"} />{resource.label}</a>)}</div></li>)}</ol></section>

            <section className="activity-section" aria-labelledby="scenario-preview-title"><div className="section-heading"><div><span className="eyebrow">Optional starting points</span><h2 id="scenario-preview-title">Five classroom task suggestions</h2></div><span className="section-meta">Use these or enter any teaching task</span></div><div className="scenario-preview-grid">{craftScenarios.map((scenario, index) => <article key={scenario.id}><span>{String(index + 1).padStart(2, "0")}</span><h3>{scenario.task}</h3><p>{scenario.summary}</p></article>)}</div></section>

            <section className="privacy-card wide"><Icon name="info" /><div><strong>AI evaluation boundary</strong><p>The evaluator runs on the server and stores no raw prompt text. A deterministic CRAFT check provides feedback if the evaluator is unavailable. Teachers must still verify facts, suitability, privacy and copyright before classroom use.</p></div></section>
          </>
        )}
      </AppShell>
    </HydrationGate>
  );
}
