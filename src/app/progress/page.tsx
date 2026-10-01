"use client";

import type { Route } from "next";
import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { getLearningPlan } from "@/components/learning-plan";
import { RequirementList } from "@/components/requirement-list";
import { HydrationGate } from "@/components/ui/hydration-gate";
import { Icon } from "@/components/ui/icon";
import { ProgressRing } from "@/components/ui/progress-ring";
import { useDemo } from "@/features/demo/demo-provider";
import { getPathwayStatus } from "@/features/learning/pathway";

export default function ProgressPage() {
  const { state } = useDemo();
  const status = getPathwayStatus(state);
  const modules = getLearningPlan(state);
  const completedLessons = modules.reduce((total, module) => total + module.completed, 0);
  function exportRecord() {
    const record = [`# PromptShala learning record`, `Participant: ${state.displayName}`, `Exported: ${new Date().toISOString()}`, `Course completion: ${status.coursePercent}%`, "", ...modules.flatMap((module) => [`## Module ${module.position}: ${module.title}`, ...module.requirements.map((item) => `- [${item.complete ? "x" : " "}] ${item.label}`), "", ...module.attempts.map((attempt, index) => `Quiz attempt ${index + 1}: ${attempt.scorePercent}% · ${attempt.attemptedAt}`), ""]), "This is a participant learning record. Certificates have a separate eligibility and verification process."].join("\n");
    const url = URL.createObjectURL(new Blob([record], { type: "text/markdown;charset=utf-8" }));
    const link = document.createElement("a"); link.href = url; link.download = "promptshala-learning-record.md"; link.click(); window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  return <HydrationGate><AppShell active="progress">
    <header className="page-heading"><div><span className="eyebrow">Your learning record</span><h1>See how far you have come.</h1><p>Every lesson, knowledge check and practice requirement in one place.</p></div><button className="button button-secondary" type="button" onClick={exportRecord}><Icon name="document" />Export my record</button></header>
    <section className="progress-summary"><div className="progress-summary-main"><ProgressRing value={status.coursePercent} /><div><span className="eyebrow">Whole course</span><h2>{status.completedModules} of 4 modules complete</h2><p>{status.courseComplete ? "All lessons, assessments and required practice evidence are recorded." : "Open a requirement below to continue exactly where you need to."}</p></div></div><div className="stat-strip"><div><strong>{completedLessons}/29</strong><span>Lessons completed</span></div><div><strong>{modules.reduce((total, module) => total + module.attempts.length, 0)}</strong><span>Knowledge check attempts</span></div><div><strong>{status.assistantReady ? "Ready" : "In progress"}</strong><span>Assistant evidence</span></div><div><strong>{status.sourceReady ? "Ready" : "In progress"}</strong><span>Source portfolio</span></div></div></section>
    <p className="draft-note">Progress counts 29 lessons and four completed module records. A module record requires its knowledge check and all of its practical evidence.</p>
    <section className="staffroom-callout"><div><span className="eyebrow">Completion certificate</span><h2>{status.courseComplete ? "Review your certificate eligibility." : "Your certificate starts with the work."}</h2><p>Certificate eligibility is checked against your saved course record. You can review the requirements at any time.</p></div><Link className="button button-primary" href="/certificate">{status.courseComplete ? "Open my certificate" : "View certificate requirements"}<Icon name="arrow-right" /></Link></section>
    <section className="module-records" aria-labelledby="module-record-title"><div className="section-heading"><div><span className="eyebrow">What is recorded, what remains</span><h2 id="module-record-title">Module requirements</h2></div><span className="section-meta">Explore in any order</span></div>{modules.map((module) => <article className="module-record" key={module.id}><div className="module-record-heading"><span className="route-number">{module.passed ? <Icon name="check" /> : module.position}</span><div><span className="eyebrow">{module.passed ? "Complete" : "In progress"}</span><h3>{module.title}</h3><p>{module.completed}/{module.lessons.length} lessons · {module.attempts.length} knowledge check attempt{module.attempts.length === 1 ? "" : "s"}</p></div><strong>{module.percent}%</strong></div><div className="linear-progress" role="progressbar" aria-label={`Module ${module.position} completion`} aria-valuemin={0} aria-valuemax={100} aria-valuenow={module.percent}><span style={{ width: `${module.percent}%` }} /></div><RequirementList requirements={module.requirements} /><div className="module-record-actions"><Link className="text-link" href={(module.passed ? `/learn/${module.slug}` : module.next.href) as Route}>{module.passed ? "Review module" : "Continue this module"}<Icon name="arrow-right" /></Link>{module.attempts.length ? <details className="attempt-history"><summary>View quiz history</summary><ol>{module.attempts.map((attempt, index) => <li key={`${attempt.attemptedAt}-${index}`}><span>Attempt {index + 1}</span><strong>{attempt.scorePercent}% · {attempt.passed ? "Passed" : "Retry available"}</strong><time dateTime={attempt.attemptedAt}>{new Date(attempt.attemptedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</time></li>)}</ol></details> : null}</div></article>)}</section>
  </AppShell></HydrationGate>;
}
