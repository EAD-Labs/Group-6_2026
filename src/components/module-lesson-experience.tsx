"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { useDemo } from "@/features/demo/demo-provider";
import { assistantHasPassport, assistantHasRepairEvidence, getPathwayStatus } from "@/features/learning/pathway";
import { moduleTwoLessons } from "@/features/learning/module-two-content";
import { moduleTwoTeaching } from "@/features/learning/module-two-teaching";
import { moduleThreeLessons } from "@/features/learning/module-three-content";
import { promptLibraryReady } from "@/features/learning/prompt-library";
import { AppShell } from "./app-shell";
import { LearningResources } from "./learning-resources";
import { PromptLibraryEditor } from "./prompt-library-editor";
import { HydrationGate } from "./ui/hydration-gate";
import { Icon } from "./ui/icon";

export function ModuleLessonExperience({ module, slug }: { module: 2 | 3; slug: string }) {
  const router = useRouter();
  const { state, isPresentationDemo, updateState, completeModuleLesson } = useDemo();
  const lessons = module === 2 ? moduleTwoLessons : moduleThreeLessons;
  const index = lessons.findIndex((lesson) => lesson.id === slug);
  const lesson = lessons[index];
  const completed = module === 2 ? state.moduleTwoCompletedLessonIds : state.moduleThreeCompletedLessonIds;
  const status = getPathwayStatus(state);
  const unlocked = isPresentationDemo || (module === 2 ? status.onePassed : status.twoPassed);
  const previousComplete = index === 0 || completed.includes(lessons[index - 1]?.id);
  const [evidence, setEvidence] = useState(state.lessonEvidence[slug] ?? "");
  const [selected, setSelected] = useState("");
  if (!lesson) return null;
  const three = module === 3 ? moduleThreeLessons[index] : null;
  const two = module === 2 ? moduleTwoLessons[index] : null;
  const sections = three?.sections.map((section) => ({ heading: section.heading, body: section.body, example: section.example }))
    ?? (moduleTwoTeaching[slug] ?? []).map((section) => ({ ...section, example: "" }));
  const check = three?.check;
  const activityReady = module === 2 ? slug !== "teaching-prompt-library" || promptLibraryReady(state.promptLibrary) : slug === "prompt-versus-assistant" || state.assistants.some((assistant) => {
    if (assistant.deletedAt) return false;
    if (slug === "assistant-passport") return assistantHasPassport(assistant);
    if (slug === "build-assistant") return assistant.tests.length >= 1;
    if (slug === "source-pack-gaps") return Boolean(assistant.sourcePack?.trim() && assistant.classContextCard?.trim()) && ["T1", "T3", "T4"].every((caseId) => assistant.tests.some((test) => test.caseId === caseId && test.verdict));
    if (slug === "classroom-rehearsal") return Boolean(assistant.rehearsalTranscript?.trim() && assistant.revisedQuestion?.trim());
    if (slug === "test-two-contexts") return assistantHasRepairEvidence(assistant);
    if (slug === "workflow-handoffs") return Boolean(assistant.handoffNotes?.trim());
    if (slug === "repair-and-remix") return Boolean(assistant.reuseDiary?.trim());
    return true;
  });
  const canComplete = evidence.trim().length >= 30 && (!check || selected === check.answer) && activityReady;

  function saveEvidence() {
    updateState((current) => ({ ...current, lessonEvidence: { ...current.lessonEvidence, [slug]: evidence.trim() } }));
  }

  function finish() {
    saveEvidence();
    completeModuleLesson(module, slug);
    router.push(index < lessons.length - 1 ? `/learn/module-${module}/lessons/${lessons[index + 1].id}` : `/learn/module-${module}`);
  }

  return <HydrationGate><AppShell active="learn">
    <nav className="breadcrumbs" aria-label="Breadcrumb"><Link href={`/learn/module-${module}`}>Module {module}</Link><Icon name="chevron-right" /><span>{lesson.title}</span></nav>
    {!unlocked || (!previousComplete && !isPresentationDemo) ? <section className="empty-state-card locked-module-card"><span className="empty-state-icon"><Icon name="lock" /></span><div><h1>Lesson locked</h1><p>Complete the preceding module and lessons to continue.</p></div><Link className="button button-primary" href={`/learn/module-${module}`}>View module <Icon name="arrow-right" /></Link></section> : <div className="course-lesson-layout">
      <article className="course-lesson-main">
        <header className="page-heading"><div><span className="eyebrow">Module {module} · Lesson {index + 1} of {lessons.length}</span><h1>{lesson.title}</h1><p>{lesson.summary}</p></div><span className="duration-pill"><Icon name="clock" />{lesson.durationMinutes} min</span></header>
        <div className="lesson-sections course-sections">{sections.map((section, sectionIndex) => <section key={section.heading}><span className="eyebrow">Idea {sectionIndex + 1}</span><h2>{section.heading}</h2><p>{section.body}</p>{section.example ? <div className="course-example"><strong>Classroom example</strong><p>{section.example}</p></div> : null}</section>)}</div>
        {two ? <section className="course-activity"><span className="eyebrow">Try it</span><h2>Classroom practice</h2><p>{two.practice}</p><p><strong>Evidence to record:</strong> {two.evidence}</p><LearningResources resources={two.resources} />{slug === "teaching-prompt-library" ? <PromptLibraryEditor /> : null}</section> : <section className="course-activity"><span className="eyebrow">Try it</span><h2>Staffroom activity</h2><p>{three?.activity}</p>{index >= 1 ? <Link className="button button-secondary button-small" href="/learn/module-3/staffroom">Open AI Staffroom <Icon name="arrow-right" /></Link> : null}</section>}
        {check ? <section className="course-activity"><span className="eyebrow">Check the idea</span><h2>{check.prompt}</h2><div className="quiz-options">{check.options.map((option, choiceIndex) => <button aria-pressed={selected === option} className={selected === option ? "quiz-option selected" : "quiz-option"} key={option} onClick={() => setSelected(option)} type="button"><span className="option-key">{String.fromCharCode(65 + choiceIndex)}</span>{option}</button>)}</div>{selected ? <div className={selected === check.answer ? "feedback-box correct" : "feedback-box supportive"}><Icon name={selected === check.answer ? "check" : "info"} /><p>{check.explanation}</p></div> : null}</section> : null}
        <section className="course-activity"><label htmlFor="lesson-evidence"><span className="eyebrow">Your evidence</span><h2>Record what you tried and learned</h2></label><p>Use fictional or general classroom examples. Do not enter student names or records.</p><textarea id="lesson-evidence" maxLength={1200} onBlur={saveEvidence} onChange={(event) => setEvidence(event.target.value)} placeholder="Describe your classroom task, what changed and what you would verify before use…" rows={6} value={evidence} /><small>{evidence.trim().length}/30 minimum characters</small></section>
        <div className="lesson-footer-actions"><span className="save-state"><Icon name="cloud" />{completed.includes(slug) ? "Lesson completed" : activityReady ? "Evidence saves when you leave the field" : module === 2 ? "Complete three prompt templates first" : "Complete the linked Staffroom activity first"}</span><button className="button button-primary" disabled={!canComplete} onClick={finish} type="button">Complete lesson <Icon name="arrow-right" /></button></div>
      </article>
      <aside className="course-lesson-rail"><span className="eyebrow">Your route</span><h2>Module {module}</h2><ol>{lessons.map((item, itemIndex) => <li key={item.id} className={itemIndex === index ? "active" : completed.includes(item.id) ? "complete" : ""}><span>{completed.includes(item.id) ? <Icon name="check" /> : itemIndex + 1}</span><Link href={`/learn/module-${module}/lessons/${item.id}`}>{item.title}</Link></li>)}</ol><Link className="text-link" href={`/learn/module-${module}`}>View module overview <Icon name="arrow-right" /></Link></aside>
    </div>}
  </AppShell></HydrationGate>;
}
