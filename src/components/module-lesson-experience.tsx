"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { useDemo } from "@/features/demo/demo-provider";
import { assistantHasPassport, assistantHasRepairEvidence } from "@/features/learning/pathway";
import { moduleTwoLessons } from "@/features/learning/module-two-content";
import { moduleTwoTeaching } from "@/features/learning/module-two-teaching";
import { moduleFourLessons } from "@/features/learning/module-four-content";
import { sourceAuditCount, sourcePortfolioReady, sourceReviewChecks } from "@/features/learning/source-studio";
import { moduleThreeLessons } from "@/features/learning/module-three-content";
import { promptLibraryReady } from "@/features/learning/prompt-library";
import { AppShell } from "./app-shell";
import { LearningResources } from "./learning-resources";
import { PromptLibraryEditor } from "./prompt-library-editor";
import { HydrationGate } from "./ui/hydration-gate";
import { Icon } from "./ui/icon";
import { PublishedContent } from "./published-content";
import { SyncStatus } from "./sync-status";

export function ModuleLessonExperience(props: { module: 2 | 3 | 4; slug: string }) {
  const { storageScope } = useDemo();
  return <ModuleLessonWorkspace key={`${storageScope}:${props.module}:${props.slug}`} {...props} />;
}
function ModuleLessonWorkspace({ module, slug }: { module: 2 | 3 | 4; slug: string }) {
  const router = useRouter();
  const { state, updateState, completeModuleLesson } = useDemo();
  const lessons = module === 2 ? moduleTwoLessons : module === 3 ? moduleThreeLessons : moduleFourLessons;
  const index = lessons.findIndex((lesson) => lesson.id === slug);
  const lesson = lessons[index];
  const completed = module === 2 ? state.moduleTwoCompletedLessonIds : module === 3 ? state.moduleThreeCompletedLessonIds : state.moduleFourCompletedLessonIds;
  const [evidence, setEvidence] = useState(state.lessonEvidence[slug] ?? "");
  const [selected, setSelected] = useState("");
  if (!lesson) return null;
  const four = module === 4 ? moduleFourLessons[index] : null;
  const three = module === 3 ? moduleThreeLessons[index] : null;
  const two = module === 2 ? moduleTwoLessons[index] : null;
  const sections = (four ?? three)?.sections.map((section) => ({ heading: section.heading, body: section.body, example: section.example }))
    ?? (moduleTwoTeaching[slug] ?? []).map((section) => ({ ...section, example: section.example ?? "" }));
  const check = (four ?? three)?.check ?? two?.check;
  const portfolio = state.sourcePortfolio;
  const briefReady = portfolio.objective.trim().length >= 20 && portfolio.audience.trim().length >= 3 && portfolio.sourceLabel.trim().length >= 3 && Boolean(portfolio.sourcePermission) && portfolio.sourceSafe;
  const fourReady = !four?.studioTask ? true : four.studioTask === "brief" ? briefReady : four.studioTask === "audit" ? sourceAuditCount(portfolio) === 3 : four.studioTask === "portfolio" ? sourcePortfolioReady(portfolio) : portfolio.draft.trim().length >= 100 && portfolio.revisionNote.trim().length >= 40 && (slug !== "review-share-responsibly" || sourceReviewChecks.every((item) => portfolio.reviewChecks.includes(item.id)));
  const activityReady = module === 4 ? fourReady : module === 2 ? slug !== "teaching-prompt-library" || promptLibraryReady(state.promptLibrary) : slug === "prompt-versus-assistant" || state.assistants.some((assistant) => {
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
    <div className="course-lesson-layout">
      <article className="course-lesson-main">
        <header className="page-heading"><div><span className="eyebrow">Module {module} · Lesson {index + 1} of {lessons.length}</span><h1>{lesson.title}</h1><p>{lesson.summary}</p></div><span className="duration-pill"><Icon name="clock" />{lesson.durationMinutes} min</span></header>
        <nav className="lesson-section-jump" aria-label="This lesson"><a href="#lesson-ideas">Read the idea</a><a href="#lesson-practice">Try the task</a><a href="#lesson-check">Check your understanding</a><a href="#lesson-reflection">Save your reflection</a></nav>
        <div id="lesson-ideas" className="lesson-sections course-sections">{sections.map((section, sectionIndex) => <section key={section.heading}><span className="eyebrow">Idea {sectionIndex + 1}</span><h2>{section.heading}</h2><p>{section.body}</p>{section.example ? <div className="course-example"><strong>Classroom example</strong><p>{section.example}</p></div> : null}</section>)}</div>
        {two ? <section id="lesson-practice" className="course-activity"><span className="eyebrow">Try it</span><h2>Classroom practice</h2><p>{two.practice}</p><p><strong>Evidence to record:</strong> {two.evidence}</p><LearningResources resources={two.resources} />{slug === "teaching-prompt-library" ? <PromptLibraryEditor /> : null}</section> : <section id="lesson-practice" className="course-activity"><span className="eyebrow">Try it</span><h2>{four ? "Source-to-classroom practice" : "Staffroom activity"}</h2><p>{(four ?? three)?.activity}</p>{four ? <><p><strong>Evidence to record:</strong> {four.evidenceHint}</p><LearningResources resources={four.resources} /><Link className="button button-secondary button-small" href="/learn/module-4/studio">Open Source Studio <Icon name="arrow-right" /></Link></> : <>{three?.resources ? <LearningResources resources={three.resources} /> : null}{index >= 1 ? <Link className="button button-secondary button-small" href="/learn/module-3/staffroom">Open AI Staffroom <Icon name="arrow-right" /></Link> : null}</>}</section>}
        {check ? <section id="lesson-check" className="course-activity"><span className="eyebrow">Check the idea</span><h2>{check.prompt}</h2><fieldset className="quiz-options concept-radio-group"><legend className="visually-hidden">{check.prompt}</legend>{check.options.map((option) => <label className={selected === option ? "quiz-option selected" : "quiz-option"} key={option}><input type="radio" name={`concept-${slug}`} checked={selected === option} onChange={() => setSelected(option)} value={option} /><span>{option}</span></label>)}</fieldset>{selected ? <div role="status" className={selected === check.answer ? "feedback-box correct" : "feedback-box supportive"}><Icon name={selected === check.answer ? "check" : "info"} /><p>{check.explanation}</p></div> : null}</section> : null}
        <section id="lesson-reflection" className="course-activity lesson-evidence-panel"><label htmlFor="lesson-evidence"><span className="eyebrow">Your evidence</span><h2>Record what you tried and learned</h2></label><p>Use fictional or general classroom examples. Do not enter student names or records.</p><textarea id="lesson-evidence" maxLength={1200} aria-describedby="evidence-help" onBlur={saveEvidence} onChange={(event) => setEvidence(event.target.value)} placeholder="Describe your classroom task, what changed and what you would verify before use…" rows={6} value={evidence} /><small id="evidence-help">{evidence.trim().length}/30 minimum characters. Describe a specific decision, change or check.</small></section>
        <PublishedContent module={module} lessonSlug={slug} />
        <p className="lesson-completion-note" id="completion-requirements">{completed.includes(slug) ? "This lesson is recorded as complete. You can revisit it whenever you need." : !activityReady ? module === 4 ? "Complete the linked Source Studio activity first, then return to save this lesson." : module === 2 ? "Complete the three prompt templates above before recording this lesson." : "Complete the linked AI Staffroom activity first, then return here." : !selected || (check && selected !== check.answer) ? "Choose the correct answer in the understanding check and save a reflection of at least 30 characters." : evidence.trim().length < 30 ? "Add a reflection of at least 30 characters to complete this lesson." : "Your check and practice evidence are ready. Complete the lesson when you are satisfied with your reflection."}</p>
        <div className="lesson-footer-actions"><SyncStatus /><button className="button button-primary" aria-describedby="completion-requirements" disabled={!canComplete && !completed.includes(slug)} onClick={completed.includes(slug) ? () => router.push(index < lessons.length - 1 ? `/learn/module-${module}/lessons/${lessons[index + 1].id}` : `/learn/module-${module}`) : finish} type="button">{completed.includes(slug) ? index < lessons.length - 1 ? "Continue to next lesson" : "Return to module" : "Complete lesson"}<Icon name="arrow-right" /></button></div>
        <nav className="lesson-bottom-nav" aria-label="Adjacent lessons">{index > 0 ? <Link className="text-link" href={`/learn/module-${module}/lessons/${lessons[index - 1].id}`}><Icon name="arrow-left" />{lessons[index - 1].title}</Link> : <Link className="text-link" href={`/learn/module-${module}`}>Module overview</Link>}<Link className="text-link" href={`/learn/module-${module}/quiz`}>Open knowledge check<Icon name="arrow-right" /></Link></nav>
      </article>
      <aside className="course-lesson-rail"><span className="eyebrow">Your route</span><h2>Module {module}</h2><ol>{lessons.map((item, itemIndex) => <li key={item.id} className={itemIndex === index ? "active" : completed.includes(item.id) ? "complete" : ""}><span>{completed.includes(item.id) ? <Icon name="check" /> : itemIndex + 1}</span><Link href={`/learn/module-${module}/lessons/${item.id}`}>{item.title}</Link></li>)}</ol><Link className="text-link" href={`/learn/module-${module}`}>View module overview <Icon name="arrow-right" /></Link></aside>
    </div>
  </AppShell></HydrationGate>;
}
