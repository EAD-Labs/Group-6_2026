"use client";

import Link from "next/link";

import { AppShell } from "@/components/app-shell";
import { HydrationGate } from "@/components/ui/hydration-gate";
import { Icon } from "@/components/ui/icon";
import { ProgressRing } from "@/components/ui/progress-ring";
import { useDemo } from "@/features/demo/demo-provider";
import { getBestQuizScore, hasPassedModuleOne } from "@/features/demo/demo-state";
import { getModuleOneProgress, learningModules, moduleOneLessons } from "@/features/learning/catalog";

export default function ProgressPage() {
  const { state } = useDemo();
  const passed = hasPassedModuleOne(state.quizAttempts);
  const bestScore = getBestQuizScore(state.quizAttempts);
  const progress = getModuleOneProgress(state.completedLessonSlugs.length, passed);

  return (
    <HydrationGate>
      <AppShell active="progress">
        <header className="page-heading"><div><span className="eyebrow">Evidence of learning</span><h1>My progress</h1><p>See what you completed, where you improved and what comes next.</p></div></header>
        <section className="progress-summary"><div className="progress-summary-main"><ProgressRing value={Math.round(progress / 4)} /><div><span className="eyebrow">Whole course</span><h2>{passed ? "One module complete" : "Your first module is underway"}</h2><p>{passed ? "Classroom Prompt Writing is ready for you." : "Complete Module 1 to unlock CRAFT prompt practice."}</p></div></div><div className="stat-strip"><div><strong>{state.completedLessonSlugs.length}</strong><span>Lessons completed</span></div><div><strong>{state.quizAttempts.length}</strong><span>Quiz attempts</span></div><div><strong>{bestScore || "—"}{bestScore ? "%" : ""}</strong><span>Best score</span></div><div><strong>{passed ? "1" : "0"}/4</strong><span>Modules passed</span></div></div></section>
        <section className="progress-modules"><div className="section-heading"><div><span className="eyebrow">Module record</span><h2>Learning pathway</h2></div><span className="section-meta">Scores never decrease</span></div>{learningModules.map((module) => { const isFirst = module.position === 1; const unlocked = isFirst || (module.position === 2 && passed); return <article key={module.id}><span className={`progress-module-icon ${unlocked ? "available" : "locked"}`}>{unlocked ? <Icon name={isFirst && passed ? "check" : "book"} /> : <Icon name="lock" />}</span><div className="progress-module-copy"><span>Module {module.position}</span><h3>{module.title}</h3><p>{module.description}</p>{isFirst ? <div className="linear-progress"><span style={{ width: `${progress}%` }} /></div> : null}</div><div className="progress-module-status"><strong>{isFirst ? `${progress}%` : unlocked ? "Ready" : "Locked"}</strong><span>{isFirst ? passed ? `Passed · ${bestScore}%` : `${state.completedLessonSlugs.length}/3 lessons` : unlocked ? "Newly unlocked" : `Complete Module ${module.position - 1}`}</span>{isFirst ? <Link className="text-link" href="/learn/module-1">Open module <Icon name="arrow-right" /></Link> : null}</div></article>; })}</section>
        <section className="lesson-record"><div className="section-heading"><div><span className="eyebrow">Module 1 detail</span><h2>Completed activities</h2></div></div><div className="lesson-record-grid">{moduleOneLessons.map((lesson) => { const complete = state.completedLessonSlugs.includes(lesson.slug); return <Link href={`/learn/module-1/lessons/${lesson.slug}`} key={lesson.id}><span className={complete ? "complete" : "pending"}><Icon name={complete ? "check" : "clock"} /></span><div><strong>{lesson.title}</strong><small>{complete ? "Completed" : `${lesson.durationMinutes} min · Not started`}</small></div><Icon name="chevron-right" /></Link>; })}</div></section>
      </AppShell>
    </HydrationGate>
  );
}
