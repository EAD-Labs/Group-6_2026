import { describe, expect, it } from "vitest";

import { moduleOneQuizQuestions } from "./catalog";
import { evaluateQuiz, isQuestionCorrect } from "./quiz";

describe("Module 1 quiz evaluation", () => {
  it("requires every correct option and no extra option for multi-select", () => {
    const question = moduleOneQuizQuestions[3];
    expect(isQuestionCorrect(question, ["d", "a", "c", "b"])).toBe(true);
    expect(isQuestionCorrect(question, ["a", "b", "c"])).toBe(false);
    expect(isQuestionCorrect(question, ["a", "b", "c", "d", "e"])).toBe(false);
  });

  it("passes four answers out of five and reports the missed concept", () => {
    const answers = Object.fromEntries(
      moduleOneQuizQuestions.map((question) => [question.id, question.correctOptionIds]),
    );
    answers["m1-q1"] = ["a"];

    expect(evaluateQuiz(moduleOneQuizQuestions, answers)).toMatchObject({
      correctAnswers: 4,
      missedQuestionIds: ["m1-q1"],
      passed: true,
      scorePercent: 80,
    });
  });

  it("fails three answers out of five", () => {
    const answers = Object.fromEntries(
      moduleOneQuizQuestions.map((question) => [question.id, question.correctOptionIds]),
    );
    answers["m1-q1"] = ["a"];
    answers["m1-q2"] = ["a"];

    expect(evaluateQuiz(moduleOneQuizQuestions, answers)).toMatchObject({
      correctAnswers: 3,
      passed: false,
      scorePercent: 60,
    });
  });
});
