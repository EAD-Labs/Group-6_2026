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
  const { isPresentationDemo, state } = useDemo();
  const unlocked = isPresentationDemo || getPathwayStatus(state).onePassed;
  const moduleTwo = learningModules[1];
  const status = getPathwayStatus(state);
  const allLessons = status.twoLessons === moduleTwoLessons.length;

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

            <section className="activity-section" aria-labelledby="module-two-lessons-title"><div className="section-heading"><div><span className="eyebrow">Research-backed pathway</span><h2 id="module-two-lessons-title">Seven lessons from first draft to reusable library</h2></div><span className="section-meta">{status.twoLessons}/{moduleTwoLessons.length} completed</span></div><ol className="module-two-syllabus">{moduleTwoLessons.map((lesson, index) => { const done = state.moduleTwoCompletedLessonIds.includes(lesson.id); const available = isPresentationDemo || done || index === 0 || state.moduleTwoCompletedLessonIds.includes(moduleTwoLessons[index - 1].id); return <li key={lesson.id}><div className="module-two-lesson-heading"><span>{done ? <Icon name="check" /> : String(index + 1).padStart(2, "0")}</span><div><small>{done ? "Completed" : `${lesson.durationMinutes} minutes`}</small><h3>{lesson.title}</h3></div></div><p>{lesson.summary}</p><p><strong>Practice:</strong> {lesson.practice}</p><p><strong>Evidence:</strong> {lesson.evidence}</p>{available ? <Link className="button button-secondary button-small" href={`/learn/module-2/lessons/${lesson.id}`}>{done ? "Review lesson" : "Start lesson"}<Icon name="arrow-right" /></Link> : <span className="locked-label"><Icon name="lock" />Complete prior lesson</span>}</li>; })}</ol></section>

            <section className="staffroom-callout"><div><span className="eyebrow">Module 2 assessment</span><h2>Knowledge check and next step</h2><p>Complete all seven lessons, save three tested prompt templates and evaluate at least two CRAFT prompt versions. Then answer five applied questions. Four correct answers pass and unlock Module 3. Your CRAFT evaluations: {state.craftPracticeCount}/2.</p></div>{allLessons && state.craftPracticeCount >= 2 ? <Link className="button button-primary" href="/learn/module-2/quiz">{status.twoPassed ? "Review quiz" : "Take quiz"}<Icon name="arrow-right" /></Link> : <span className="locked-label"><Icon name="lock" />Finish lessons and practice</span>}</section>

            <section className="activity-section" aria-labelledby="scenario-preview-title"><div className="section-heading"><div><span className="eyebrow">Optional starting points</span><h2 id="scenario-preview-title">Five classroom task suggestions</h2></div><span className="section-meta">Use these or enter any teaching task</span></div><div className="scenario-preview-grid">{craftScenarios.map((scenario, index) => <article key={scenario.id}><span>{String(index + 1).padStart(2, "0")}</span><h3>{scenario.task}</h3><p>{scenario.summary}</p></article>)}</div></section>

            <section className="privacy-card wide"><Icon name="info" /><div><strong>AI evaluation boundary</strong><p>The evaluator runs on the server and stores no raw prompt text. A deterministic CRAFT check provides feedback if the evaluator is unavailable. Teachers must still verify facts, suitability, privacy and copyright before classroom use.</p></div></section>
          </>
        )}
      </AppShell>
    </HydrationGate>
  );
}
