"use client";

import type { Route } from "next";
import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { HydrationGate } from "@/components/ui/hydration-gate";
import { Icon } from "@/components/ui/icon";
import { ProgressRing } from "@/components/ui/progress-ring";
import { useDemo } from "@/features/demo/demo-provider";
import { getBestQuizScore } from "@/features/demo/demo-state";
import { learningModules, moduleOneLessons } from "@/features/learning/catalog";
import { moduleTwoLessons } from "@/features/learning/module-two-content";
import { moduleThreeLessons } from "@/features/learning/module-three-content";
import { getPathwayStatus } from "@/features/learning/pathway";

export default function ProgressPage() {
  const { state, isPresentationDemo } = useDemo();
  const status = getPathwayStatus(state);
  const records = [
    { lessons: moduleOneLessons, completed: status.oneLessons, attempts: state.quizAttempts, passed: status.onePassed, href: "/learn/module-1" },
    { lessons: moduleTwoLessons, completed: status.twoLessons, attempts: state.moduleTwoQuizAttempts, passed: status.twoPassed, href: "/learn/module-2" },
    { lessons: moduleThreeLessons, completed: status.threeLessons, attempts: state.moduleThreeQuizAttempts, passed: status.threePassed, href: "/learn/module-3" },
  ];
  const completedModules = Number(status.onePassed) + Number(status.twoPassed) + Number(status.threePassed);
  const completedLessons = status.oneLessons + status.twoLessons + status.threeLessons;
  return <HydrationGate><AppShell active="progress">
    <header className="page-heading"><div><span className="eyebrow">Evidence of learning</span><h1>My progress</h1><p>See completed lessons, quiz attempts and what remains for the next module.</p></div></header>
    <section className="progress-summary"><div className="progress-summary-main"><ProgressRing value={status.coursePercent} /><div><span className="eyebrow">Whole course</span><h2>{completedModules} of 4 modules complete</h2><p>{completedModules === 3 ? "Modules 1–3 complete. Module 4 is next." : "Keep building your classroom practice evidence."}</p></div></div><div className="stat-strip"><div><strong>{completedLessons}</strong><span>Lessons completed</span></div><div><strong>{state.quizAttempts.length + state.moduleTwoQuizAttempts.length + state.moduleThreeQuizAttempts.length}</strong><span>Quiz attempts</span></div><div><strong>{status.assistantReady ? "Yes" : "No"}</strong><span>Assistant evidence ready</span></div><div><strong>{completedModules}/4</strong><span>Modules passed</span></div></div></section>
    <section className="progress-modules"><div className="section-heading"><div><span className="eyebrow">Module record</span><h2>Learning pathway</h2></div><span className="section-meta">{isPresentationDemo ? "Demo preview access" : "Prerequisites apply"}</span></div>{learningModules.map((module, index) => {
      const record = records[index];
      const available = index === 0 || (index === 1 && (isPresentationDemo || status.onePassed)) || (index === 2 && (isPresentationDemo || status.twoPassed));
      const fraction = record ? (record.completed + Number(record.passed)) / (record.lessons.length + 1) : 0;
      return <article key={module.id}><span className={`progress-module-icon ${available ? "available" : "locked"}`}><Icon name={record?.passed ? "check" : available ? "book" : "lock"} /></span><div className="progress-module-copy"><span>Module {module.position}</span><h3>{module.title}</h3><p>{module.description}</p>{record ? <div className="linear-progress"><span style={{ width: `${Math.round(fraction * 100)}%` }} /></div> : null}</div><div className="progress-module-status"><strong>{record ? `${Math.round(fraction * 100)}%` : "Upcoming"}</strong><span>{record ? `${record.completed}/${record.lessons.length} lessons · ${record.attempts.length} quiz attempts${record.attempts.length ? ` · Best ${getBestQuizScore(record.attempts)}%` : ""}` : "Next module in development"}</span>{available && record ? <Link className="text-link" href={record.href as Route}>Open module <Icon name="arrow-right" /></Link> : null}</div></article>;
    })}</section>
    <section className="lesson-record"><div className="section-heading"><div><span className="eyebrow">Detailed evidence</span><h2>Completed activities</h2></div></div><div className="lesson-record-grid">{records.flatMap((record, moduleIndex) => record.lessons.map((lesson) => {
      const slug = "slug" in lesson ? lesson.slug : lesson.id;
      const completed = moduleIndex === 0 ? state.completedLessonSlugs.includes(slug) : moduleIndex === 1 ? state.moduleTwoCompletedLessonIds.includes(slug) : state.moduleThreeCompletedLessonIds.includes(slug);
      const href = moduleIndex === 0 ? `/learn/module-1/lessons/${slug}` : `/learn/module-${moduleIndex + 1}/lessons/${slug}`;
      return <Link href={href as Route} key={href}><span className={completed ? "complete" : "pending"}><Icon name={completed ? "check" : "clock"} /></span><div><strong>{lesson.title}</strong><small>Module {moduleIndex + 1} · {completed ? "Completed" : "Not completed"}</small></div><Icon name="chevron-right" /></Link>;
    }))}</div></section>
  </AppShell></HydrationGate>;
}
