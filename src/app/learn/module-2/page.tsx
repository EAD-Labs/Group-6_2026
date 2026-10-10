"use client";

import Link from "next/link";

import { AppShell } from "@/components/app-shell";
import { HydrationGate } from "@/components/ui/hydration-gate";
import { Icon } from "@/components/ui/icon";
import { useDemo } from "@/features/demo/demo-provider";
import { craftDimensions, craftScenarios } from "@/features/learning/craft";
import { learningModules } from "@/features/learning/catalog";
import { moduleTwoLessons, moduleTwoMinutes } from "@/features/learning/module-two-content";
import { getPathwayStatus } from "@/features/learning/pathway";

export default function ModuleTwoPage() {
  const { state } = useDemo();
  const moduleTwo = learningModules[1];
  const status = getPathwayStatus(state);

  return (
    <HydrationGate>
      <AppShell active="learn" contentClassName="learning-reading-scale">
        <nav className="breadcrumbs" aria-label="Breadcrumb"><Link href="/dashboard">My learning</Link><Icon name="chevron-right" /><span>Module 2</span></nav>
          <>
            <header className="module-hero craft-module-hero">
              <div>
                <span className="module-badge">Module 2 · Clear instructions</span>
                <h1>{moduleTwo.title}</h1>
                <p>{moduleTwo.description} A prompt is simply the request you give AI.</p>
                <div className="metadata-row"><span><Icon name="clock" />{moduleTwoMinutes} minutes</span><span><Icon name="document" />{moduleTwoLessons.length} lessons + prompt library</span><span><Icon name="target" />Request practice</span></div>
                <Link className="button button-primary" href="/learn/module-2/practice">Try writing a request <Icon name="arrow-right" /></Link>
              </div>
              <div className="craft-letter-stack" aria-label="CRAFT means Context, Role, Action, Format and Target">
                {craftDimensions.map((dimension) => <span key={dimension.id}><strong>{dimension.label.slice(0, 1)}</strong>{dimension.label}</span>)}
              </div>
            </header>

            <section className="learning-outcomes" aria-labelledby="craft-outcomes-title"><div className="outcomes-icon"><Icon name="target" /></div><div><h2 id="craft-outcomes-title">By the end of this module, you can</h2><ul><li><Icon name="check" />Tell AI who it is helping, what to do, and how to present the answer.</li><li><Icon name="check" />Keep lessons, questions, and feedback focused on what students need to learn.</li><li><Icon name="check" />Try different requests and compare how useful the answers are.</li><li><Icon name="check" />Save three requests you can use again, with notes on what to check.</li></ul></div></section>

            <section className="activity-section" aria-labelledby="module-two-lessons-title"><div className="section-heading"><div><span className="eyebrow">One lesson at a time</span><h2 id="module-two-lessons-title">Seven lessons to ask AI more clearly</h2></div><span className="section-meta">{status.twoLessons}/{moduleTwoLessons.length} completed</span></div><ol className="module-two-syllabus">{moduleTwoLessons.map((lesson, index) => { const done = state.moduleTwoCompletedLessonIds.includes(lesson.id); return <li key={lesson.id}><div className="module-two-lesson-heading"><span>{done ? <Icon name="check" /> : String(index + 1).padStart(2, "0")}</span><div><small>{done ? "Completed" : `${lesson.durationMinutes} minutes`}</small><h3>{lesson.title}</h3></div></div><p>{lesson.summary}</p><details className="lesson-practice-preview"><summary>What you’ll practise</summary><p>{lesson.practice}</p><p><strong>What to save:</strong> {lesson.evidence}</p></details><Link className="button button-secondary button-small" href={`/learn/module-2/lessons/${lesson.id}`}>{done ? "Review lesson" : "Start lesson"}<Icon name="arrow-right" /></Link></li>; })}</ol></section>

            <section className="staffroom-callout"><div><span className="eyebrow">Module 2 assessment</span><h2>Knowledge check and next step</h2><p>Complete all seven lessons, save three prompt templates with an observed or guided review and evaluate at least two CRAFT prompt versions. The knowledge check has five applied questions; four correct answers pass. Explore Module 3 whenever you are ready. Your CRAFT evaluations: {state.craftPracticeCount}/2.</p></div><Link className="button button-primary" href="/learn/module-2/quiz">{status.twoPassed ? "Review quiz" : "Take quiz"}<Icon name="arrow-right" /></Link></section>

            <section className="activity-section" aria-labelledby="scenario-preview-title"><div className="section-heading"><div><span className="eyebrow">Optional starting points</span><h2 id="scenario-preview-title">Five classroom task suggestions</h2></div><span className="section-meta">Use these or enter any teaching task</span></div><div className="scenario-preview-grid">{craftScenarios.map((scenario, index) => <article key={scenario.id}><span>{String(index + 1).padStart(2, "0")}</span><h3>{scenario.task}</h3><p>{scenario.summary}</p></article>)}</div></section>

            <section className="privacy-card wide"><Icon name="info" /><div><strong>Your requests stay with your account</strong><p>Your checked task, prompt and feedback are saved privately to your account. You can view and reuse them in prompt practice. Unsubmitted drafts and recent comparisons also stay on this device; clear those in My account. If AI is unavailable, the course checklist still gives feedback. Teachers must still verify facts, suitability, privacy and copyright before classroom use.</p></div></section>
          </>
      </AppShell>
    </HydrationGate>
  );
}
