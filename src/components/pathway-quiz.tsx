"use client";

import Link from "next/link";
import { useState } from "react";

import { useDemo } from "@/features/demo/demo-provider";
import { getBestQuizScore } from "@/features/demo/demo-state";
import { getPathwayStatus } from "@/features/learning/pathway";
import { moduleTwoLessons, moduleTwoQuizQuestions } from "@/features/learning/module-two-content";
import { moduleThreeLessons, moduleThreeQuizQuestions } from "@/features/learning/module-three-content";
import { promptLibraryReady } from "@/features/learning/prompt-library";
import { evaluateQuiz, type QuizEvaluation } from "@/features/learning/quiz";
import { AppShell } from "./app-shell";
import { HydrationGate } from "./ui/hydration-gate";
import { Icon } from "./ui/icon";

export function PathwayQuiz({ module }: { module: 2 | 3 }) {
  const { state, isPresentationDemo, recordModuleQuizAttempt } = useDemo();
  const questions = module === 2 ? moduleTwoQuizQuestions : moduleThreeQuizQuestions;
  const requiredCorrect = Math.ceil(questions.length * 0.7);
  const lessons = module === 2 ? moduleTwoLessons : moduleThreeLessons;
  const completed = module === 2 ? state.moduleTwoCompletedLessonIds : state.moduleThreeCompletedLessonIds;
  const attempts = module === 2 ? state.moduleTwoQuizAttempts : state.moduleThreeQuizAttempts;
  const status = getPathwayStatus(state);
  const [started, setStarted] = useState(false);
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string[]>>({});
  const [result, setResult] = useState<QuizEvaluation | null>(null);
  const unlocked = (isPresentationDemo || (module === 2 ? status.onePassed : status.twoPassed)) && lessons.every((lesson) => completed.includes(lesson.id));
  const evidenceReady = module === 2 ? state.craftPracticeCount >= 2 && promptLibraryReady(state.promptLibrary) : status.assistantReady;
  const question = questions[index];
  const selected = answers[question.id] ?? [];

  function toggle(optionId: string) {
    setAnswers((current) => {
      const before = current[question.id] ?? [];
      return { ...current, [question.id]: question.kind === "single" ? [optionId] : before.includes(optionId) ? before.filter((id) => id !== optionId) : [...before, optionId] };
    });
  }

  function advance() {
    if (index < questions.length - 1) return setIndex(index + 1);
    const evaluation = evaluateQuiz(questions, answers);
    recordModuleQuizAttempt(module, {
      answers, attemptedAt: new Date().toISOString(), correctAnswers: evaluation.correctAnswers,
      passed: evaluation.passed, scorePercent: evaluation.scorePercent,
    });
    setResult(evaluation);
  }

  function retry() { setStarted(true); setIndex(0); setAnswers({}); setResult(null); }

  return <HydrationGate><AppShell active="learn">
    <nav className="breadcrumbs" aria-label="Breadcrumb"><Link href={`/learn/module-${module}`}>Module {module}</Link><Icon name="chevron-right" /><span>Knowledge check</span></nav>
    {!unlocked ? <section className="empty-state-card locked-module-card"><span className="empty-state-icon"><Icon name="lock" /></span><div><h1>Finish the lessons first</h1><p>Complete all {lessons.length} lessons before the knowledge check.</p></div><Link className="button button-primary" href={`/learn/module-${module}`}>View lessons <Icon name="arrow-right" /></Link></section>
    : !evidenceReady ? <section className="empty-state-card locked-module-card"><span className="empty-state-icon"><Icon name="target" /></span><div><h1>{module === 2 ? "Finish your prompt practice" : "Complete your Staffroom evidence"}</h1><p>{module === 2 ? `Record two CRAFT evaluations (${state.craftPracticeCount}/2) and complete all three library templates.` : "Finish the Passport, six challenge cases, versioned repair, rehearsal, handoff and reuse diary before taking this quiz."}</p></div><Link className="button button-primary" href={module === 2 ? state.craftPracticeCount < 2 ? "/learn/module-2/practice" : "/learn/module-2/lessons/teaching-prompt-library" : "/learn/module-3/staffroom"}>{module === 2 ? state.craftPracticeCount < 2 ? "Open CRAFT lab" : "Open prompt library" : "Open AI Staffroom"} <Icon name="arrow-right" /></Link></section>
    : result ? <div className="course-quiz-result"><section className={`quiz-result ${result.passed ? "passed" : "failed"}`}><div className="result-hero"><div className="result-copy"><span className="eyebrow">Module {module} · Attempt {attempts.length}</span><h1>{result.passed ? "Knowledge check passed" : "Review and try again"}</h1><p>{result.correctAnswers} of {questions.length} correct. {requiredCorrect} correct answers are needed to pass.</p><div className="result-actions"><button className="button button-secondary" onClick={retry} type="button"><Icon name="refresh" />Try again</button><Link className="button button-primary" href={result.passed ? module === 2 ? "/learn/module-3" : "/progress" : `/learn/module-${module}`}>{result.passed ? "Continue learning" : "Review lessons"}<Icon name="arrow-right" /></Link></div></div><strong className="course-quiz-score">{result.scorePercent}%</strong></div></section><section className="answer-review"><h2>Question review</h2>{questions.map((item) => <details key={item.id}><summary><strong>{item.prompt}</strong></summary><p>{item.explanation}</p><p><strong>Correct answer:</strong> {item.options.filter((option) => item.correctOptionIds.includes(option.id)).map((option) => option.label).join(", ")}</p></details>)}</section></div>
    : !started ? <section className="quiz-intro"><div className="quiz-intro-copy"><span className="eyebrow">Module {module} · Knowledge check</span><h1>Show what you can do</h1><p>{questions.length} classroom questions, answer explanations and unlimited retries. You need {requiredCorrect} correct answers to pass.</p><p>Previous best score: <strong>{attempts.length ? `${getBestQuizScore(attempts)}%` : "No attempts yet"}</strong></p><button className="button button-primary" onClick={() => setStarted(true)} type="button">Start quiz <Icon name="arrow-right" /></button></div></section>
    : <><div className="quiz-topbar"><div><span className="eyebrow">Module {module} knowledge check</span><strong>Question {index + 1} of {questions.length}</strong></div></div><div className="quiz-progress"><span style={{ width: `${((index + 1) / questions.length) * 100}%` }} /></div><section className="quiz-question-card"><span className="eyebrow">{question.kind === "multiple" ? "Select all that apply" : "Choose one"}</span><h1>{question.prompt}</h1><div className="quiz-options">{question.options.map((option, choiceIndex) => <button aria-pressed={selected.includes(option.id)} className={selected.includes(option.id) ? "quiz-option selected" : "quiz-option"} key={option.id} onClick={() => toggle(option.id)} type="button"><span className="option-key">{String.fromCharCode(65 + choiceIndex)}</span><span>{option.label}</span></button>)}</div></section><div className="quiz-navigation"><button className="button button-secondary" disabled={index === 0} onClick={() => setIndex(index - 1)} type="button">Previous</button><button className="button button-primary" disabled={!selected.length} onClick={advance} type="button">{index === questions.length - 1 ? "Submit quiz" : "Next question"}<Icon name="arrow-right" /></button></div></>}
  </AppShell></HydrationGate>;
}
