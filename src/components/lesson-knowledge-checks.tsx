"use client";

import { useEffect, useRef, useState } from "react";
import type { QuizQuestion } from "@/features/learning/catalog";
import { createActiveClock, recordActivity } from "@/features/analytics/client";
import { isQuestionCorrect } from "@/features/learning/quiz";

export function LessonKnowledgeChecks({ module, questions, onReady }: { module: number; questions: QuizQuestion[]; onReady: (ready: boolean) => void }) {
  const [index, setIndex] = useState(0), [answers, setAnswers] = useState<Record<string, string[]>>({}), [checked, setChecked] = useState<Record<string, boolean>>({});
  const attempt = useRef<string | null>(null);
  const clock = useRef<ReturnType<typeof createActiveClock> | null>(null);
  const question = questions[index], selected = answers[question.id] ?? [];
  useEffect(() => { onReady(false); }, [onReady]);
  useEffect(() => {
    attempt.current ??= crypto.randomUUID(); clock.current = createActiveClock();
    recordActivity({ kind: "question_view", module, questionId: question.id, attemptId: attempt.current });
    return () => clock.current?.stop();
  }, [index, module, question.id]);
  function choose(id: string) {
    const selection = question.kind === "single" ? [id] : selected.includes(id) ? selected.filter(value => value !== id) : [...selected, id];
    setAnswers({ ...answers, [question.id]: selection });
    const next = { ...checked, [question.id]: false }; setChecked(next); onReady(questions.every(q => next[q.id]));
  }
  function check() {
    recordActivity({ kind: "question_answer", module, questionId: question.id, attemptId: attempt.current!, selectedOptions: selected, activeMs: clock.current?.take() ?? 0 });
    const next = { ...checked, [question.id]: isQuestionCorrect(question, selected) }; setChecked(next); onReady(questions.every(q => next[q.id]));
  }
  const correct = checked[question.id];
  const [feedback, setFeedback] = useState<string | null>(null);
  return <section id="lesson-check" className="concept-check" aria-label="Lesson knowledge checks"><span className="eyebrow">Check your understanding · {questions.length} questions</span><h2>Put the ideas into practice</h2>
    <nav className="question-dots" aria-label="Lesson questions">{questions.map((q, i) => <button key={q.id} type="button" aria-current={index === i ? "step" : undefined} aria-label={`Lesson question ${i + 1}${checked[q.id] ? ", correct" : ""}`} onClick={() => { setIndex(i); setFeedback(null); }}>{i + 1}</button>)}</nav>
    <p><strong>Question {index + 1} of {questions.length}: {question.prompt}</strong></p><p>{question.kind === "multiple" ? "Select all that apply." : "Choose one answer."}</p>
    <fieldset className="quiz-options concept-radio-group"><legend className="visually-hidden">{question.prompt}</legend>{question.options.map(option => <label className={selected.includes(option.id) ? "quiz-option selected" : "quiz-option"} key={option.id}><input type={question.kind === "single" ? "radio" : "checkbox"} name={`lesson-${question.id}`} checked={selected.includes(option.id)} onChange={() => { choose(option.id); setFeedback(null); }} /><span>{option.label}</span></label>)}</fieldset>
    <button className="button button-secondary" type="button" disabled={!selected.length} data-analytics-id="lesson-check-answer" onClick={() => { check(); setFeedback(question.id); }}>Check answer</button>
    {feedback === question.id ? <div className={correct ? "feedback-box correct" : "feedback-box supportive"} role="status"><p><strong>{correct ? "Correct." : "Try again."}</strong> {question.explanation}</p></div> : null}
    <p>{questions.filter(q => checked[q.id]).length} of {questions.length} checks correct. You can revisit any question.</p>
  </section>;
}
