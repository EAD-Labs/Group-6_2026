"use client";

import Link from "next/link";

import { AppShell } from "@/components/app-shell";
import { HydrationGate } from "@/components/ui/hydration-gate";
import { Icon } from "@/components/ui/icon";
import { ProgressRing } from "@/components/ui/progress-ring";
import { useDemo } from "@/features/demo/demo-provider";
import { hasPassedModuleOne } from "@/features/demo/demo-state";
import { getModuleOneProgress, moduleOne, moduleOneLessons } from "@/features/learning/catalog";

export default function ModuleOnePage() {
  const { state } = useDemo();
  const passed = hasPassedModuleOne(state.quizAttempts);
  const completedCount = state.completedLessonSlugs.length;
  const progress = getModuleOneProgress(completedCount, passed);
  const nextLesson = moduleOneLessons.find((lesson) => !state.completedLessonSlugs.includes(lesson.slug));

  return (
    <HydrationGate>
      <AppShell active="learn">
        <nav className="breadcrumbs" aria-label="Breadcrumb"><Link href="/dashboard">Home</Link><Icon name="chevron-right" /><span>Module 1</span></nav>
        <header className="module-hero">
          <div><span className="module-badge">Module 1</span><h1>{moduleOne.title}</h1><p>{moduleOne.description}</p><div className="metadata-row"><span><Icon name="clock" />25 minutes</span><span><Icon name="document" />3 lessons + quiz</span><span><Icon name="target" />70% to pass</span></div>{passed ? <Link className="button button-primary" href="/learn/module-2">Continue to Module 2 <Icon name="arrow-right" /></Link> : nextLesson ? <Link className="button button-primary" href={`/learn/module-1/lessons/${nextLesson.slug}`}>Continue current lesson <Icon name="arrow-right" /></Link> : <Link className="button button-primary" href="/learn/module-1/quiz">Start knowledge check <Icon name="arrow-right" /></Link>}</div>
          <div className="module-progress-card"><ProgressRing value={progress} /><strong>{passed ? "Module passed" : `${completedCount} of 3 lessons`}</strong><span>{passed ? "Module 2 unlocked" : "Your progress saves automatically"}</span></div>
        </header>

        <section className="learning-outcomes" aria-labelledby="outcomes-title"><div className="outcomes-icon"><Icon name="target" /></div><div><h2 id="outcomes-title">By the end of this module, you can</h2><ul><li><Icon name="check" />Distinguish generative AI from search and fixed automation.</li><li><Icon name="check" />Choose appropriate low-risk classroom uses.</li><li><Icon name="check" />Apply privacy, accuracy and suitability checks before use.</li></ul></div></section>

        <section className="activity-section" aria-labelledby="activity-title"><div className="section-heading"><div><span className="eyebrow">Your route</span><h2 id="activity-title">Module activities</h2></div><span className="section-meta">Complete in order</span></div><ol className="activity-list">{moduleOneLessons.map((lesson) => { const completed = state.completedLessonSlugs.includes(lesson.slug); const isCurrent = nextLesson?.slug === lesson.slug; const available = completed || isCurrent || !nextLesson; return <li className={isCurrent ? "current" : completed ? "completed" : ""} key={lesson.id}><span className="activity-order">{completed ? <Icon name="check" /> : lesson.position}</span><div className="activity-copy"><span>{completed ? "Completed" : isCurrent ? "Up next" : "Lesson"} · {lesson.durationMinutes} min</span><h3>{lesson.title}</h3><p>{lesson.summary}</p></div>{available ? <Link className={isCurrent ? "button button-primary button-small" : "button button-secondary button-small"} href={`/learn/module-1/lessons/${lesson.slug}`}>{completed ? "Review" : "Start"}<Icon name="arrow-right" /></Link> : <span className="locked-label"><Icon name="lock" />Locked</span>}</li>; })}<li className={passed ? "completed" : completedCount === 3 ? "current" : ""}><span className="activity-order">{passed ? <Icon name="check" /> : 4}</span><div className="activity-copy"><span>{passed ? "Passed" : completedCount === 3 ? "Ready" : "Unlocks after lessons"} · 5 min</span><h3>Module knowledge check</h3><p>Five questions, answer explanations and unlimited guided retries.</p></div>{completedCount === 3 ? <Link className="button button-primary button-small" href="/learn/module-1/quiz">{passed ? "Review result" : "Start quiz"}<Icon name="arrow-right" /></Link> : <span className="locked-label"><Icon name="lock" />Locked</span>}</li></ol></section>
        <section className="privacy-card wide"><Icon name="shield" /><div><strong>Safe-use reminder</strong><p>Use only fictional or general classroom examples. Never enter identifiable student information.</p></div></section>
      </AppShell>
    </HydrationGate>
  );
}
