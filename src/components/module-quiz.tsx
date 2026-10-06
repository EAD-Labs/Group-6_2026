"use client";

import type { Route } from "next";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { createActiveClock, recordActivity } from "@/features/analytics/client";
import { useDemo } from "@/features/demo/demo-provider";
import { moduleOneQuizQuestions, type QuizQuestion } from "@/features/learning/catalog";
import { moduleTwoQuizQuestions } from "@/features/learning/module-two-content";
import { moduleThreeQuizQuestions } from "@/features/learning/module-three-content";
import { moduleFourQuizQuestions } from "@/features/learning/module-four-content";
import { evaluateQuiz, reviewSavedAttempt, type QuizEvaluation } from "@/features/learning/quiz";
import { AppShell } from "./app-shell";
import { getLearningPlan } from "./learning-plan";
import { RequirementList } from "./requirement-list";
import { HydrationGate } from "./ui/hydration-gate";
import { Icon } from "./ui/icon";
import { ProgressRing } from "./ui/progress-ring";
import { useScopedDraft } from "./ui/use-scoped-draft";

type Draft = { attemptId?: string; started: boolean; index: number; answers: Record<string, string[]> };
const emptyDraft: Draft = { started: false, index: 0, answers: {} };
const banks = [moduleOneQuizQuestions, moduleTwoQuizQuestions, moduleThreeQuizQuestions, moduleFourQuizQuestions];
function cleanDraft(value: unknown, questions: QuizQuestion[]): Draft {
  const raw = value && typeof value === "object" ? value as Partial<Draft> : {};
  const answers: Record<string, string[]> = {};
  for (const question of questions) {
    const selected = raw.answers?.[question.id];
    if (Array.isArray(selected)) answers[question.id] = [...new Set(selected.filter((id) => question.options.some((option) => option.id === id)))].slice(0, question.kind === "single" ? 1 : question.options.length);
  }
  return { attemptId: typeof raw.attemptId === "string" && /^[0-9a-f-]{36}$/i.test(raw.attemptId) ? raw.attemptId : undefined, started: raw.started === true, index: Math.max(0, Math.min(Number.isInteger(raw.index) ? raw.index! : 0, questions.length - 1)), answers };
}

export function ModuleQuiz({ module }: { module: 1 | 2 | 3 | 4 }) {
  const { storageScope } = useDemo();
  return <QuizContent key={`${storageScope}:${module}`} module={module} />;
}
function QuizContent({ module }: { module: 1 | 2 | 3 | 4 }) {
  const { state, recordQuizAttempt, recordModuleQuizAttempt } = useDemo();
  const questions = banks[module - 1];
  const validate = useMemo(() => (value: unknown) => cleanDraft(value, questions), [questions]);
  const [draft, setDraft, storage] = useScopedDraft(`quiz-${module}`, emptyDraft, validate);
  const [result, setResult] = useState<{ evaluation: QuizEvaluation; answers: Draft["answers"] } | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const answersRef = useRef(draft.answers);
  useEffect(() => { answersRef.current = draft.answers; }, [draft.answers]);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const plan = getLearningPlan(state)[module - 1];
  const question = questions[draft.index];
  const selected = draft.answers[question.id] ?? [];
  const answered = questions.filter((item) => draft.answers[item.id]?.length).length;
  const required = Math.ceil(questions.length * 0.7);
  const best = Math.max(0, ...plan.attempts.map((attempt) => attempt.scorePercent));
  const incomplete = plan.requirements.filter((item) => !item.complete);
  useEffect(() => { if (draft.started || result) headingRef.current?.focus(); }, [draft.index, draft.started, result]);

  useEffect(() => {
    if (!draft.started || result || !draft.attemptId) return;
    const clock = createActiveClock();
    const base = { module, questionId: question.id, attemptId: draft.attemptId };
    recordActivity({ kind: "question_view", ...base });
    return () => {
      const selectedOptions = answersRef.current[question.id];
      if (selectedOptions?.length) recordActivity({ kind: "question_answer", ...base, selectedOptions, activeMs: clock.read() });
      clock.stop();
    };
  }, [draft.started, draft.index, draft.attemptId, result, module, question.id]);

  function toggle(id: string) {
    const selection = question.kind === "single" ? [id] : selected.includes(id) ? selected.filter((item) => item !== id) : [...selected, id];
    setDraft({ ...draft, answers: { ...draft.answers, [question.id]: selection } });
  }
  function submit() {
    if (answered !== questions.length || submitted) return;
    const evaluation = evaluateQuiz(questions, draft.answers);
    const attempt = { answers: draft.answers, attemptedAt: new Date().toISOString(), correctAnswers: evaluation.correctAnswers, passed: evaluation.passed, scorePercent: evaluation.scorePercent };
    recordActivity({ kind: "quiz_submit", module, attemptId: draft.attemptId });
    setSubmitted(true);
    if (module === 1) recordQuizAttempt(attempt); else recordModuleQuizAttempt(module, attempt);
    setResult({ evaluation, answers: draft.answers });
    setDraft(emptyDraft);
  }
  function restart() { setResult(null); setSubmitted(false); setDraft({ ...emptyDraft, started: true, attemptId: crypto.randomUUID() }); }
  const savedMessage = storage.persisted ? "Answers saved on this device until submission" : "Answers remain in this tab; device storage is unavailable";

  return <HydrationGate><AppShell active="learn" contentClassName="quiz-workspace">
    <nav className="breadcrumbs" aria-label="Breadcrumb"><Link href={`/learn/module-${module}`}>Module {module}</Link><Icon name="chevron-right" /><span>Knowledge check</span></nav>
    {result ? <>
      <section className={`quiz-result ${result.evaluation.passed ? "passed" : "failed"}`}><div className="result-hero"><div className="result-copy"><span className="eyebrow">Module {module} · Knowledge check</span><h1 ref={headingRef} tabIndex={-1}>{result.evaluation.passed ? "Knowledge check passed." : "A few ideas to revisit."}</h1><p>{result.evaluation.correctAnswers} of {result.evaluation.totalQuestions} correct. {Math.ceil(result.evaluation.totalQuestions * 0.7)} correct answers are needed to pass.</p><p>{plan.passed ? "The lessons and required practice evidence for this module are also complete." : "Your quiz result is recorded separately from lesson and practice completion."}</p><div className="result-actions"><Link className="button button-primary" href={(plan.passed ? module === 4 ? "/progress" : `/learn/module-${module + 1}` : plan.next.href) as Route}>{plan.passed ? "Continue learning" : "Continue module"}<Icon name="arrow-right" /></Link><button className="button button-secondary" onClick={restart} type="button">Try again<Icon name="refresh" /></button></div></div><div className="score-card"><ProgressRing value={result.evaluation.scorePercent} label={`Score ${result.evaluation.scorePercent}%`} /><strong>{result.evaluation.scorePercent}%</strong><span>Best recorded: {best}%</span></div></div></section>
      {incomplete.length ? <section className="quiz-outstanding"><h2>Still to complete in this module</h2><RequirementList requirements={incomplete} /></section> : null}
      <section className="answer-review" aria-labelledby="review-title"><div className="section-heading"><div><span className="eyebrow">Take the explanation with you</span><h2 id="review-title">Review your answers</h2></div></div>{result.evaluation.totalQuestions !== questions.length ? <p>This is your recorded result from an earlier question bank. New questions are available when you start another attempt.</p> : null}{questions.filter(item => Object.hasOwn(result.answers, item.id)).map((item, index) => {
        const correct = result.evaluation.correctQuestionIds.includes(item.id);
        return <details key={item.id} open={!correct}><summary><span className={correct ? "review-status correct" : "review-status missed"}><Icon name={correct ? "check" : "info"} /></span><span><small>Question {index + 1} · {correct ? "Correct" : "Review this idea"}</small><strong>{item.prompt}</strong></span><Icon name="chevron-right" /></summary><div><p><strong>Your answer:</strong> {item.options.filter((option) => result.answers[item.id]?.includes(option.id)).map((option) => option.label).join("; ") || "Not answered"}</p><p><strong>Correct answer:</strong> {item.options.filter((option) => item.correctOptionIds.includes(option.id)).map((option) => option.label).join("; ")}</p><p>{item.explanation}</p><Link className="text-link" href={`/learn/module-${module}/lessons/${item.lessonSlug}` as Route}>Revisit the lesson<Icon name="arrow-right" /></Link></div></details>;
      })}</section>
    </> : !draft.started ? <section className="quiz-intro"><div className="quiz-intro-copy"><span className="eyebrow">Module {module} · A check on your decisions</span><h1>Show what you understand.</h1><p>Take a few classroom questions at your own pace. Each answer comes with an explanation after you submit.</p><div className="quiz-facts"><span><Icon name="document" /><strong>{questions.length} questions</strong><small>Choose one or select all</small></span><span><Icon name="target" /><strong>{required} correct to pass</strong><small>70% course threshold</small></span><span><Icon name="refresh" /><strong>Unlimited retries</strong><small>Your highest score is retained</small></span><span><Icon name="clock" /><strong>No time limit</strong><small>Go back before submitting</small></span></div>{plan.attempts.length ? <p className="previous-score">Best score: <strong>{best}%</strong> · {plan.attempts.length} attempt{plan.attempts.length === 1 ? "" : "s"}</p> : null}<button className="button button-primary" onClick={() => setDraft({ ...draft, started: true, attemptId: crypto.randomUUID() })} data-analytics-id="quiz-start" type="button">Start knowledge check<Icon name="arrow-right" /></button>{plan.attempts.length ? <button className="text-link previous-result-link" type="button" onClick={() => { const last = plan.attempts.at(-1)!; setResult({ evaluation: reviewSavedAttempt(questions, last), answers: last.answers }); }}>Review latest attempt</button> : null}</div><aside className="quiz-reassurance"><span className="eyebrow">Before you begin</span><h2>Make the choice you would make in class.</h2><p>Look for evidence, useful constraints and the point where a teacher should step in.</p><p>You can take this check at any time. Completing the module also requires its lessons and practical work.</p><Link className="text-link" href={`/learn/module-${module}`}>Review module requirements<Icon name="arrow-right" /></Link></aside></section> : <>
      <div className="quiz-topbar"><div><span className="eyebrow">Module {module} · Knowledge check</span><strong>Question {draft.index + 1} of {questions.length}</strong></div><span className="save-state"><Icon name="document" />{answered}/{questions.length} answered</span></div><div className="quiz-progress" role="progressbar" aria-label="Questions answered" aria-valuenow={answered} aria-valuemin={0} aria-valuemax={questions.length}><span style={{ width: `${answered / questions.length * 100}%` }} /></div>
      <section className="quiz-question-card"><span className="eyebrow">{question.kind === "multiple" ? "Select all that apply" : "Choose one answer"}</span><h1 id="question-title" ref={headingRef} tabIndex={-1}>{question.prompt}</h1><fieldset className="quiz-options" aria-labelledby="question-title"><legend className="visually-hidden">{question.kind === "multiple" ? "Select every correct answer" : "Choose the strongest answer"}</legend>{question.options.map((option, index) => <label className={selected.includes(option.id) ? "quiz-option selected" : "quiz-option"} key={option.id}><input type={question.kind === "single" ? "radio" : "checkbox"} name={question.id} checked={selected.includes(option.id)} onChange={() => toggle(option.id)} /><span className="option-key" aria-hidden="true">{String.fromCharCode(65 + index)}</span><span>{option.label}</span></label>)}</fieldset><p className="question-help">{question.kind === "multiple" ? "Choose the complete set. Extra selections make this answer incorrect." : "Choose the strongest answer for this classroom situation."}</p></section>
      <div className="quiz-navigation"><button className="button button-secondary" disabled={draft.index === 0} onClick={() => setDraft({ ...draft, index: draft.index - 1 })} type="button"><Icon name="arrow-left" />Previous</button><nav className="question-dots" aria-label="Jump to question">{questions.map((item, index) => <button type="button" aria-current={draft.index === index ? "step" : undefined} aria-label={`Question ${index + 1}, ${draft.answers[item.id]?.length ? "answered" : "not answered"}`} className={index === draft.index ? "current" : draft.answers[item.id]?.length ? "answered" : ""} key={item.id} onClick={() => setDraft({ ...draft, index })}>{index + 1}</button>)}</nav>{draft.index === questions.length - 1 ? <button className="button button-primary" disabled={answered !== questions.length || submitted} onClick={submit} data-analytics-id="quiz-submit" type="button">Submit answers<Icon name="check" /></button> : <button className="button button-primary" onClick={() => setDraft({ ...draft, index: draft.index + 1 })} data-analytics-id="quiz-next" type="button">Next question<Icon name="arrow-right" /></button>}</div>
      <p className="draft-note" role="status">{savedMessage}. {draft.index === questions.length - 1 && answered !== questions.length ? `Answer the remaining ${questions.length - answered} question${questions.length - answered === 1 ? "" : "s"} before submitting.` : "Your result is recorded only when you submit."}</p>
    </>}
  </AppShell></HydrationGate>;
}
