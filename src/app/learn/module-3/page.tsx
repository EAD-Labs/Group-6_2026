"use client";

import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { HydrationGate } from "@/components/ui/hydration-gate";
import { Icon } from "@/components/ui/icon";
import { useDemo } from "@/features/demo/demo-provider";
import { getPathwayStatus } from "@/features/learning/pathway";
import { moduleThreeLessons } from "@/features/learning/module-three-content";

export default function ModuleThreePage() {
  const { state, isPresentationDemo } = useDemo();
  const status = getPathwayStatus(state);
  const unlocked = isPresentationDemo || status.twoPassed;
  const next = moduleThreeLessons.find((lesson) => !state.moduleThreeCompletedLessonIds.includes(lesson.id));
  const allLessons = status.threeLessons === moduleThreeLessons.length;
  return <HydrationGate><AppShell active="learn">
    <nav className="breadcrumbs" aria-label="Breadcrumb"><Link href="/dashboard">Home</Link><Icon name="chevron-right" /><span>Module 3</span></nav>
    {!unlocked ? <section className="empty-state-card locked-module-card"><span className="empty-state-icon"><Icon name="lock" /></span><div><h1>Complete Module 2 first</h1><p>Finish the prompt-writing lessons and pass the knowledge check to enter the AI Staffroom.</p></div><Link className="button button-primary" href="/learn/module-2">Return to Module 2 <Icon name="arrow-right" /></Link></section> : <>
      <header className="module-hero craft-module-hero"><div><span className="module-badge">Module 3 · Reusable Teacher Assistants</span><h1>Build an assistant you can trust and improve.</h1><p>Turn a strong teaching prompt into a reusable Agent Passport. Challenge it with missing context, source gaps and new classroom needs, then repair and share it safely.</p><div className="metadata-row"><span><Icon name="clock" />360 minutes</span><span><Icon name="book" />8 lessons</span><span><Icon name="target" />Repair Clinic + 10-question quiz</span></div><Link className="button button-primary" href={next ? `/learn/module-3/lessons/${next.id}` : "/learn/module-3/staffroom"}>{next ? "Continue lessons" : "Open AI Staffroom"}<Icon name="arrow-right" /></Link></div><div className="craft-letter-stack" aria-label="Module 3 workflow"><span><strong>1</strong>Adopt</span><span><strong>2</strong>Build</span><span><strong>3</strong>Test</span><span><strong>4</strong>Repair</span><span><strong>5</strong>Remix</span></div></header>
      <section className="activity-section"><div className="section-heading"><div><span className="eyebrow">Learning pathway</span><h2>Eight lessons, one finished assistant</h2></div><span className="section-meta">{status.threeLessons}/{moduleThreeLessons.length} lessons complete</span></div><ol className="activity-list">{moduleThreeLessons.map((lesson, index) => { const done = state.moduleThreeCompletedLessonIds.includes(lesson.id); const available = isPresentationDemo || done || index === 0 || state.moduleThreeCompletedLessonIds.includes(moduleThreeLessons[index - 1].id); return <li className={done ? "completed" : available ? "current" : ""} key={lesson.id}><span className="activity-order">{done ? <Icon name="check" /> : index + 1}</span><div className="activity-copy"><span>{done ? "Completed" : available ? "Ready" : "Locked"} · {lesson.durationMinutes} min</span><h3>{lesson.title}</h3><p>{lesson.summary}</p></div>{available ? <Link className="button button-secondary button-small" href={`/learn/module-3/lessons/${lesson.id}`}>{done ? "Review" : "Start"}<Icon name="arrow-right" /></Link> : <span className="locked-label"><Icon name="lock" />Locked</span>}</li>; })}</ol></section>
      <section className="staffroom-callout"><div><span className="eyebrow">AI Staffroom</span><h2>Your reusable teaching assistant</h2><p>Adopt or create a Passport, run the six-case challenge deck, repair a weakness, rehearse a synthetic dialogue, record a teacher-led handoff and transfer to a new context.</p><p><strong>Evidence:</strong> {status.assistantReady ? "A complete assistant is saved." : "Your assistant evidence is still in progress."}</p></div><Link className="button button-primary" href="/learn/module-3/staffroom">Open AI Staffroom <Icon name="arrow-right" /></Link></section>
      <section className="staffroom-callout"><div><span className="eyebrow">Knowledge check</span><h2>Confirm your decisions</h2><p>Ten applied questions with explanations and unlimited retries. Seven correct answers pass. The quiz opens after all lessons and Staffroom evidence are complete.</p></div>{allLessons && status.assistantReady ? <Link className="button button-primary" href="/learn/module-3/quiz">Take quiz <Icon name="arrow-right" /></Link> : <span className="locked-label"><Icon name="lock" />Finish the pathway</span>}</section>
      {status.threePassed ? <div className="privacy-card wide"><Icon name="check" /><div><strong>Module 3 complete.</strong><p>Your reusable assistant and assessment evidence are saved. Module 4 is next on the course roadmap.</p></div></div> : null}
    </>}
  </AppShell></HydrationGate>;
}
