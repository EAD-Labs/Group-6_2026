"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { AppShell } from "@/components/app-shell";
import { LearningResources } from "@/components/learning-resources";
import { HydrationGate } from "@/components/ui/hydration-gate";
import { Icon } from "@/components/ui/icon";
import { PublishedContent } from "./published-content";
import { SyncStatus } from "./sync-status";
import { LessonKnowledgeChecks } from "./lesson-knowledge-checks";
import { useDemo } from "@/features/demo/demo-provider";
import { getNextLesson, moduleOneLessons, moduleOneQuizQuestions, type LessonDetail } from "@/features/learning/catalog";

export function LessonExperience({ lesson }: { lesson: LessonDetail }) {
  const router = useRouter();
  const { completeLesson, state, storageScope } = useDemo();
  const [selectedIsCorrect, setChecksReady] = useState(false);
  const nextLesson = getNextLesson(lesson.slug);
  const completed = state.completedLessonSlugs.includes(lesson.slug);

  function completeAndContinue() {
    completeLesson(lesson.slug);
    router.push(nextLesson ? `/learn/module-1/lessons/${nextLesson.slug}` : "/learn/module-1");
  }

  return (
    <HydrationGate>
      <AppShell active="learn" contentClassName="learning-reading-scale">
        <nav className="breadcrumbs" aria-label="Breadcrumb"><Link href="/learn/module-1">Module 1</Link><Icon name="chevron-right" /><span>{lesson.title}</span></nav>
        <div className="lesson-layout">
          <article className="lesson-main">
            <header className="lesson-heading"><div><span className="eyebrow">{lesson.eyebrow}</span><h1>{lesson.title}</h1><p>{lesson.summary}</p></div><span className="duration-pill"><Icon name="clock" />{lesson.durationMinutes} minutes</span></header>
            <nav className="lesson-section-jump" aria-label="This lesson"><a href="#lesson-reading">Read the idea</a><a href="#lesson-key-ideas">Work through the example</a><a href="#lesson-resources">Watch and read</a><a href="#lesson-check">Check your understanding</a></nav>
            <section id="lesson-reading" className="text-lesson" aria-labelledby="text-lesson-title"><div className="section-heading compact"><div><span className="eyebrow">Text lesson</span><h2 id="text-lesson-title">Learn the idea</h2></div><span>{lesson.durationMinutes} min read + practice</span></div><div className="text-lesson-body">{lesson.transcript.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}</div></section>
            <section id="lesson-key-ideas" className="lesson-sections" aria-labelledby="key-ideas-title"><span className="eyebrow">Pause and reflect</span><h2 id="key-ideas-title">Key ideas to carry forward</h2>{lesson.sections.map((section, index) => <article key={section.heading}><span>{String(index + 1).padStart(2, "0")}</span><div><h3>{section.heading}</h3><p>{section.body}</p>{section.highlight ? <strong className="lesson-highlight">{section.highlight}</strong> : null}</div></article>)}</section>
            <section id="lesson-resources" className="lesson-resources" aria-labelledby="lesson-resources-title"><div className="section-heading compact"><div><span className="eyebrow">Watch and read</span><h2 id="lesson-resources-title">Curated resources</h2></div><span>{lesson.resources.length} selected</span></div><LearningResources resources={lesson.resources} /></section>
            <LessonKnowledgeChecks key={`${storageScope}:${lesson.slug}`} module={1} questions={moduleOneQuizQuestions.filter(q => q.lessonSlug === lesson.slug)} onReady={setChecksReady} />
            <PublishedContent module={1} lessonSlug={lesson.slug} />
            <p className="lesson-completion-note" id="lesson-completion-help">{completed ? "This lesson is recorded as complete. Revisit the explanation or continue when you are ready." : selectedIsCorrect ? "Your understanding check is complete. Continue when you are ready." : "Complete every understanding check above before recording this lesson. The explanation will help you review."}</p>
            <div className="lesson-footer-actions"><SyncStatus /><button className="button button-primary" aria-describedby="lesson-completion-help" disabled={!completed && !selectedIsCorrect} onClick={completeAndContinue} type="button">{completed ? "Continue learning" : nextLesson ? "Complete and continue" : "Complete lesson"}<Icon name="arrow-right" /></button></div>
            <nav className="lesson-bottom-nav" aria-label="Adjacent lessons"><Link className="text-link" href="/learn/module-1"><Icon name="arrow-left" />Module overview</Link><Link className="text-link" href="/learn/module-1/quiz">Open knowledge check<Icon name="arrow-right" /></Link></nav>
          </article>
          <aside className="lesson-rail" aria-label="Module activities"><div className="section-heading compact"><div><span className="eyebrow">Module 1</span><h2>Your route</h2></div><span>{state.completedLessonSlugs.length}/{moduleOneLessons.length}</span></div><ol>{moduleOneLessons.map((item) => { const itemComplete = state.completedLessonSlugs.includes(item.slug); const active = item.slug === lesson.slug; return <li className={active ? "active" : itemComplete ? "complete" : ""} key={item.id}><span>{itemComplete ? <Icon name="check" /> : item.position}</span><div><strong>{item.title}</strong><small>{active ? "Current lesson" : itemComplete ? "Completed" : `${item.durationMinutes} min`}</small></div></li>; })}<li className=""><span>{moduleOneLessons.length + 1}</span><div><strong>Knowledge check</strong><small>70% to pass</small></div></li></ol><div className="privacy-mini"><Icon name="shield" /><p>Keep student names and records out of every example.</p></div></aside>
        </div>
      </AppShell>
    </HydrationGate>
  );
}
