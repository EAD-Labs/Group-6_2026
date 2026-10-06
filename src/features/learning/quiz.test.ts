import { describe, expect, it } from "vitest";

import { moduleOneQuizQuestions } from "./catalog";
import { evaluateQuiz, isQuestionCorrect, reviewSavedAttempt } from "./quiz";

describe("Module 1 quiz evaluation", () => {
  it("preserves a historical score after the question bank expands", () => {
    const answers = Object.fromEntries(moduleOneQuizQuestions.slice(0, 5).map(question => [question.id, question.correctOptionIds]));
    const review = reviewSavedAttempt(moduleOneQuizQuestions, { answers, correctAnswers: 5, passed: true, scorePercent: 100 });
    expect(review).toMatchObject({ correctAnswers: 5, totalQuestions: 5, passed: true, scorePercent: 100, missedQuestionIds: [] });
  });
  it("requires every correct option and no extra option for multi-select", () => {
    const question = moduleOneQuizQuestions[3];
    expect(isQuestionCorrect(question, ["d", "a", "c", "b"])).toBe(true);
    expect(isQuestionCorrect(question, ["a", "b", "c"])).toBe(false);
    expect(isQuestionCorrect(question, ["a", "b", "c", "d", "e"])).toBe(false);
  });

  it("passes thirteen answers out of fourteen and reports the missed concept", () => {
    const answers = Object.fromEntries(
      moduleOneQuizQuestions.map((question) => [question.id, question.correctOptionIds]),
    );
    answers["m1-q1"] = ["a"];

    expect(evaluateQuiz(moduleOneQuizQuestions, answers)).toMatchObject({
      correctAnswers: 13,
      missedQuestionIds: ["m1-q1"],
      passed: true,
      scorePercent: 92,
    });
  });

  it("fails below the pilot knowledge-check threshold", () => {
    const answers = Object.fromEntries(
      moduleOneQuizQuestions.map((question) => [question.id, question.correctOptionIds]),
    );
    answers["m1-q1"] = ["a"];
    for (const question of moduleOneQuizQuestions.slice(1, 5)) answers[question.id] = [];

    expect(evaluateQuiz(moduleOneQuizQuestions, answers)).toMatchObject({
      correctAnswers: 9,
      passed: false,
      scorePercent: 64,
    });
  });
});
