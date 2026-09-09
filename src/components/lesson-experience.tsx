"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { AppShell } from "@/components/app-shell";
import { HydrationGate } from "@/components/ui/hydration-gate";
import { Icon } from "@/components/ui/icon";
import { useDemo } from "@/features/demo/demo-provider";
import { getNextLesson, moduleOneLessons, type LessonDetail } from "@/features/learning/catalog";

const conceptChecks: Record<string, { answer: string; explanation: string; options: string[]; prompt: string }> = {
  "meet-generative-ai": {
    answer: "Generative AI",
    explanation: "It creates new wording from your instruction. A teacher still checks scientific accuracy and suitability.",
    options: ["Generative AI", "Search", "Rule-based automation"],
    prompt: "A tool writes three different analogies to explain evaporation to Class 5. What is it?",
  },
  "review-before-use": {
    answer: "Use a fictional learner profile without identifying details",
    explanation: "Generalised examples protect privacy while still letting you practise the teaching task.",
    options: ["Include a learner’s name and marks", "Use a fictional learner profile without identifying details", "Upload counselling notes"],
    prompt: "Which request is safest to enter into a public AI tool?",
  },
  "useful-teacher-tasks": {
    answer: "Draft three quiz variations for teacher review",
    explanation: "Drafting a low-risk resource saves time while the teacher retains final review and classroom responsibility.",
    options: ["Make a final disciplinary decision", "Draft three quiz variations for teacher review", "Store confidential learner records"],
    prompt: "Which task is an appropriate first use of AI?",
  },
};

export function LessonExperience({ lesson }: { lesson: LessonDetail }) {
  const router = useRouter();
  const { completeLesson, state } = useDemo();
  const [transcriptOpen, setTranscriptOpen] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState("");
  const conceptCheck = conceptChecks[lesson.slug];
  const nextLesson = getNextLesson(lesson.slug);
  const completed = state.completedLessonSlugs.includes(lesson.slug);
  const selectedIsCorrect = selectedAnswer === conceptCheck.answer;

  function completeAndContinue() {
    completeLesson(lesson.slug);
    router.push(nextLesson ? `/learn/module-1/lessons/${nextLesson.slug}` : "/learn/module-1");
  }

  return (
    <HydrationGate>
      <AppShell active="learn">
        <nav className="breadcrumbs" aria-label="Breadcrumb"><Link href="/learn/module-1">Module 1</Link><Icon name="chevron-right" /><span>{lesson.title}</span></nav>
        <div className="lesson-layout">
          <article className="lesson-main">
            <header className="lesson-heading"><div><span className="eyebrow">{lesson.eyebrow}</span><h1>{lesson.title}</h1><p>{lesson.summary}</p></div><span className="duration-pill"><Icon name="clock" />{lesson.durationMinutes} minutes</span></header>
            <section className="lesson-media" aria-label="Interactive micro-lesson"><div className="lesson-media-top"><span><Icon name="sparkles" />Interactive micro-lesson</span><span>03:20</span></div><div className="lesson-visual"><span className="lesson-orbit orbit-one" /><span className="lesson-orbit orbit-two" /><span className="lesson-core"><Icon name="brain" /></span><div className="lesson-visual-copy"><small>Key idea</small><strong>{lesson.sections[0].highlight ?? lesson.sections[0].heading}</strong></div></div><div className="lesson-controls"><button aria-label="Play lesson" className="round-control" type="button"><Icon name="play" /></button><div className="media-timeline"><span style={{ width: "68%" }} /></div><button aria-pressed={state.captionsEnabled} className="caption-control" type="button">CC</button><button className="text-link" onClick={() => setTranscriptOpen((current) => !current)} type="button">{transcriptOpen ? "Hide" : "View"} transcript</button></div></section>
            {transcriptOpen ? <section className="transcript-panel" aria-live="polite"><div className="section-heading compact"><h2>Lesson transcript</h2><span>Plain-text alternative</span></div>{lesson.transcript.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}</section> : null}
            <section className="lesson-sections" aria-labelledby="key-ideas-title"><span className="eyebrow">Read and reflect</span><h2 id="key-ideas-title">Three ideas to remember</h2>{lesson.sections.map((section, index) => <article key={section.heading}><span>{String(index + 1).padStart(2, "0")}</span><div><h3>{section.heading}</h3><p>{section.body}</p>{section.highlight ? <strong className="lesson-highlight">{section.highlight}</strong> : null}</div></article>)}</section>
            <section className="concept-check" aria-labelledby="concept-check-title"><div className="concept-check-heading"><span className="concept-icon"><Icon name="target" /></span><div><span className="eyebrow">Try it now</span><h2 id="concept-check-title">Quick concept check</h2></div></div><p>{conceptCheck.prompt}</p><div className="answer-list">{conceptCheck.options.map((option) => <button aria-pressed={selectedAnswer === option} className={selectedAnswer === option ? "answer-option selected" : "answer-option"} key={option} onClick={() => setSelectedAnswer(option)} type="button"><span>{selectedAnswer === option ? <Icon name="check" /> : null}</span>{option}</button>)}</div>{selectedAnswer ? <div className={selectedIsCorrect ? "feedback-box correct" : "feedback-box supportive"} aria-live="polite"><Icon name={selectedIsCorrect ? "check" : "info"} /><div><strong>{selectedIsCorrect ? "Exactly right" : "Good attempt—look again"}</strong><p>{selectedIsCorrect ? conceptCheck.explanation : `The stronger choice is “${conceptCheck.answer}”. ${conceptCheck.explanation}`}</p></div></div> : null}</section>
            <div className="lesson-footer-actions"><div className="save-state"><Icon name="cloud" /><span>{completed ? "Lesson completed" : "Progress saves on this device"}</span></div><button className="button button-primary" disabled={!selectedAnswer} onClick={completeAndContinue} type="button">{nextLesson ? "Complete and continue" : "Complete lesson"}<Icon name="arrow-right" /></button></div>
          </article>
          <aside className="lesson-rail" aria-label="Module activities"><div className="section-heading compact"><div><span className="eyebrow">Module 1</span><h2>Your route</h2></div><span>{state.completedLessonSlugs.length}/3</span></div><ol>{moduleOneLessons.map((item) => { const itemComplete = state.completedLessonSlugs.includes(item.slug); const active = item.slug === lesson.slug; return <li className={active ? "active" : itemComplete ? "complete" : ""} key={item.id}><span>{itemComplete ? <Icon name="check" /> : item.position}</span><div><strong>{item.title}</strong><small>{active ? "Current lesson" : itemComplete ? "Completed" : `${item.durationMinutes} min`}</small></div></li>; })}<li className={state.completedLessonSlugs.length === 3 ? "active" : "locked"}><span>{state.completedLessonSlugs.length === 3 ? 4 : <Icon name="lock" />}</span><div><strong>Knowledge check</strong><small>70% to pass</small></div></li></ol><div className="privacy-mini"><Icon name="shield" /><p>Keep student names and records out of every example.</p></div></aside>
        </div>
      </AppShell>
    </HydrationGate>
  );
}
