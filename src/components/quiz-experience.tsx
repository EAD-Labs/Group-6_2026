"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import { AppShell } from "@/components/app-shell";
import { HydrationGate } from "@/components/ui/hydration-gate";
import { Icon } from "@/components/ui/icon";
import { ProgressRing } from "@/components/ui/progress-ring";
import { useDemo } from "@/features/demo/demo-provider";
import { getBestQuizScore } from "@/features/demo/demo-state";
import { moduleOneQuizQuestions } from "@/features/learning/catalog";
import { evaluateQuiz, type QuizEvaluation } from "@/features/learning/quiz";

type QuizStage = "intro" | "questions" | "result";

export function QuizExperience() {
  const { recordQuizAttempt, state } = useDemo();
  const [stage, setStage] = useState<QuizStage>("intro");
  const [questionIndex, setQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string[]>>({});
  const [evaluation, setEvaluation] = useState<QuizEvaluation | null>(null);
  const question = moduleOneQuizQuestions[questionIndex];
  const currentSelection = answers[question?.id] ?? [];
  const bestScore = Math.max(getBestQuizScore(state.quizAttempts), evaluation?.scorePercent ?? 0);
  const quizUnlocked = state.completedLessonSlugs.length === 3;

  const missedQuestions = useMemo(
    () =>
      evaluation
        ? moduleOneQuizQuestions.filter((item) => evaluation.missedQuestionIds.includes(item.id))
        : [],
    [evaluation],
  );

  function selectOption(optionId: string) {
    setAnswers((currentAnswers) => {
      const selected = currentAnswers[question.id] ?? [];
      if (question.kind === "single") {
        return { ...currentAnswers, [question.id]: [optionId] };
      }
      return {
        ...currentAnswers,
        [question.id]: selected.includes(optionId)
          ? selected.filter((selectedId) => selectedId !== optionId)
          : [...selected, optionId],
      };
    });
  }

  function goForward() {
    if (questionIndex < moduleOneQuizQuestions.length - 1) {
      setQuestionIndex((currentIndex) => currentIndex + 1);
      return;
    }

    const nextEvaluation = evaluateQuiz(moduleOneQuizQuestions, answers);
    setEvaluation(nextEvaluation);
    recordQuizAttempt({
      answers,
      attemptedAt: new Date().toISOString(),
      correctAnswers: nextEvaluation.correctAnswers,
      passed: nextEvaluation.passed,
      scorePercent: nextEvaluation.scorePercent,
    });
    setStage("result");
  }

  function retryQuiz() {
    setAnswers({});
    setEvaluation(null);
    setQuestionIndex(0);
    setStage("questions");
  }

  if (!quizUnlocked) {
    return (
      <HydrationGate>
        <AppShell active="learn">
          <section className="locked-page-state"><span><Icon name="lock" /></span><div><span className="eyebrow">Knowledge check locked</span><h1>Finish the three short lessons first.</h1><p>The quiz unlocks after each required activity is complete. Your current lesson progress is saved.</p><Link className="button button-primary" href="/learn/module-1">Return to Module 1 <Icon name="arrow-right" /></Link></div></section>
        </AppShell>
      </HydrationGate>
    );
  }

  if (stage === "intro") {
    return (
      <HydrationGate>
        <AppShell active="learn">
          <nav className="breadcrumbs" aria-label="Breadcrumb"><Link href="/learn/module-1">Module 1</Link><Icon name="chevron-right" /><span>Knowledge check</span></nav>
          <section className="quiz-intro"><div className="quiz-intro-copy"><span className="quiz-icon"><Icon name="target" /></span><span className="eyebrow">Ready when you are</span><h1>Module 1 knowledge check</h1><p>Five practical questions help you confirm what you understand. This is for learning—not ranking.</p><div className="quiz-facts"><span><Icon name="document" /><strong>5 questions</strong><small>Single and multiple choice</small></span><span><Icon name="clock" /><strong>About 5 minutes</strong><small>Progress saves as you go</small></span><span><Icon name="target" /><strong>70% to pass</strong><small>4 of 5 in this quiz</small></span><span><Icon name="refresh" /><strong>Unlimited retries</strong><small>Guided explanations included</small></span></div>{state.quizAttempts.length ? <div className="previous-score"><Icon name="progress" /><span>Previous best score</span><strong>{bestScore}%</strong></div> : null}<button className="button button-primary" onClick={() => setStage("questions")} type="button">Start knowledge check <Icon name="arrow-right" /></button></div><aside className="quiz-reassurance"><span className="eyebrow">What happens next</span><ol><li><span>1</span><div><strong>Answer all five</strong><p>You can move backward before submitting.</p></div></li><li><span>2</span><div><strong>See clear explanations</strong><p>Missed ideas link to the right lesson.</p></div></li><li><span>3</span><div><strong>Retry or unlock</strong><p>A pass unlocks Classroom Prompt Writing.</p></div></li></ol><div className="privacy-mini"><Icon name="shield" /><p>No student information is needed for this activity.</p></div></aside></section>
        </AppShell>
      </HydrationGate>
    );
  }

  if (stage === "questions") {
    const progress = Math.round(((questionIndex + 1) / moduleOneQuizQuestions.length) * 100);
    return (
      <HydrationGate>
        <AppShell active="learn">
          <div className="quiz-topbar"><div><span className="eyebrow">Module 1 knowledge check</span><strong>Question {questionIndex + 1} of {moduleOneQuizQuestions.length}</strong></div><span className="save-state"><Icon name="cloud" />Answers saved</span></div>
          <div className="quiz-progress" aria-label={`${progress}% through quiz`}><span style={{ width: `${progress}%` }} /></div>
          <section className="quiz-question-card" aria-labelledby="question-title"><div className="question-meta"><span>{question.kind === "multiple" ? "Select all that apply" : "Choose one answer"}</span><span>1 point</span></div><h1 id="question-title">{question.prompt}</h1><div className="quiz-options">{question.options.map((option, index) => { const selected = currentSelection.includes(option.id); return <button aria-pressed={selected} className={selected ? "quiz-option selected" : "quiz-option"} key={option.id} onClick={() => selectOption(option.id)} type="button"><span className="option-key">{String.fromCharCode(65 + index)}</span><span>{option.label}</span><span className="option-check">{selected ? <Icon name="check" /> : null}</span></button>; })}</div><p className="question-help"><Icon name="info" />Choose the strongest classroom-safe answer. Explanations appear after submission.</p></section>
          <div className="quiz-navigation"><button className="button button-secondary" disabled={questionIndex === 0} onClick={() => setQuestionIndex((currentIndex) => currentIndex - 1)} type="button"><Icon name="arrow-left" />Previous</button><div className="question-dots" aria-label="Question status">{moduleOneQuizQuestions.map((item, index) => <button aria-label={`Go to question ${index + 1}${answers[item.id]?.length ? ", answered" : ""}`} className={index === questionIndex ? "current" : answers[item.id]?.length ? "answered" : ""} key={item.id} onClick={() => setQuestionIndex(index)} type="button">{index + 1}</button>)}</div><button className="button button-primary" disabled={!currentSelection.length} onClick={goForward} type="button">{questionIndex === moduleOneQuizQuestions.length - 1 ? "Submit answers" : "Next question"}<Icon name="arrow-right" /></button></div>
        </AppShell>
      </HydrationGate>
    );
  }

  if (!evaluation) return null;

  return (
    <HydrationGate>
      <AppShell active="learn">
        <section className={`quiz-result ${evaluation.passed ? "passed" : "failed"}`}>
          <div className="result-hero"><div className="result-copy"><span className="result-icon"><Icon name={evaluation.passed ? "sparkles" : "book"} /></span><span className="eyebrow">Attempt {state.quizAttempts.length}</span><h1>{evaluation.passed ? "Module complete—well done!" : "Almost there—review and try again."}</h1><p>{evaluation.passed ? "You showed safe, responsible judgment across the Module 1 concepts." : `You answered ${evaluation.correctAnswers} of 5 correctly. Two focused reviews can get you ready for the next attempt.`}</p><div className="result-actions">{evaluation.passed ? <><Link className="button button-primary" href="/dashboard">See Module 2 unlocked <Icon name="arrow-right" /></Link><button className="button button-secondary" onClick={retryQuiz} type="button"><Icon name="refresh" />Practise again</button></> : <><button className="button button-primary" onClick={retryQuiz} type="button"><Icon name="refresh" />Review and retry</button><Link className="button button-secondary" href={`/learn/module-1/lessons/${missedQuestions[0]?.lessonSlug ?? "review-before-use"}`}><Icon name="book" />Review lesson</Link></>}</div></div><div className="score-card"><ProgressRing label={`Score ${evaluation.scorePercent}%, ${evaluation.passed ? "passed" : "not yet passed"}`} value={evaluation.scorePercent} /><strong>{evaluation.scorePercent}%</strong><span>Pass threshold: 70%</span><small>Highest score retained: {bestScore}%</small></div></div>
          {evaluation.passed ? <section className="unlock-card"><span className="unlock-icon"><Icon name="sparkles" /></span><div><span className="eyebrow">Newly unlocked</span><h2>Module 2 · Classroom Prompt Writing</h2><p>Build classroom-ready instructions with the CRAFT framework: Context, Role, Action, Format and Target.</p></div><Link className="button button-demo" href="/dashboard">View pathway <Icon name="arrow-right" /></Link></section> : <section className="review-focus"><div className="section-heading"><div><span className="eyebrow">Your focused review</span><h2>Concepts to revisit</h2></div><span className="supportive-label"><Icon name="info" />Feedback, not penalty</span></div><div className="review-grid">{missedQuestions.map((missedQuestion) => <article key={missedQuestion.id}><span><Icon name="book" /></span><div><h3>{missedQuestion.concept}</h3><p>{missedQuestion.explanation}</p><Link className="text-link" href={`/learn/module-1/lessons/${missedQuestion.lessonSlug}`}>Review the lesson <Icon name="arrow-right" /></Link></div></article>)}</div></section>}
          <section className="answer-review" aria-labelledby="answer-review-title"><div className="section-heading"><div><span className="eyebrow">Transparent feedback</span><h2 id="answer-review-title">Question-by-question review</h2></div><span>{evaluation.correctAnswers}/5 correct</span></div>{moduleOneQuizQuestions.map((item, index) => { const correct = evaluation.correctQuestionIds.includes(item.id); return <details key={item.id}><summary><span className={correct ? "review-status correct" : "review-status missed"}><Icon name={correct ? "check" : "info"} /></span><span><small>Question {index + 1} · {correct ? "Correct" : "Review recommended"}</small><strong>{item.prompt}</strong></span><Icon name="chevron-right" /></summary><div><p>{item.explanation}</p><strong>Correct answer: {item.options.filter((option) => item.correctOptionIds.includes(option.id)).map((option) => option.label).join(", ")}</strong></div></details>; })}</section>
        </section>
      </AppShell>
    </HydrationGate>
  );
}
