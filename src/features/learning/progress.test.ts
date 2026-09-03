import { describe, expect, it } from "vitest";

import {
  applyQuizResultToProgress,
  calculateQuizResult,
  canStartQuiz,
  canUnlockNextModule,
  deriveModuleStatus,
  getNextAttemptNumber,
} from "./progress";

describe("calculateQuizResult", () => {
  it("passes four correct answers out of five", () => {
    expect(calculateQuizResult(4, 5)).toEqual({
      correctAnswers: 4,
      passed: true,
      scorePercent: 80,
      totalQuestions: 5,
    });
  });

  it("fails three correct answers out of five", () => {
    expect(calculateQuizResult(3, 5)).toMatchObject({
      passed: false,
      scorePercent: 60,
    });
  });

  it("passes exactly at the 70 percent boundary", () => {
    expect(calculateQuizResult(7, 10)).toMatchObject({
      passed: true,
      scorePercent: 70,
    });
  });

  it("fails immediately below the 70 percent boundary", () => {
    expect(calculateQuizResult(69, 100)).toMatchObject({
      passed: false,
      scorePercent: 69,
    });
  });

  it("supports a reviewed module-specific threshold", () => {
    expect(calculateQuizResult(3, 4, 75)).toMatchObject({
      passed: true,
      scorePercent: 75,
    });
  });

  it.each([
    [-1, 5],
    [6, 5],
    [1.5, 5],
    [0, 0],
  ])("rejects invalid counts %s/%s", (correct, total) => {
    expect(() => calculateQuizResult(correct, total)).toThrow(RangeError);
  });
});

describe("module progression", () => {
  it("keeps a module locked until the previous module passes", () => {
    expect(
      deriveModuleStatus({
        passedAt: null,
        previousModulePassed: false,
        startedAt: null,
      }),
    ).toBe("locked");
  });

  it("makes the first eligible module available", () => {
    expect(
      deriveModuleStatus({
        passedAt: null,
        previousModulePassed: true,
        startedAt: null,
      }),
    ).toBe("available");
  });

  it("preserves passed status", () => {
    expect(
      deriveModuleStatus({
        passedAt: "2026-09-03T09:00:00.000Z",
        previousModulePassed: true,
        startedAt: "2026-09-03T08:00:00.000Z",
      }),
    ).toBe("passed");
  });

  it("unlocks the quiz only after every required lesson", () => {
    expect(canStartQuiz(3, 2)).toBe(false);
    expect(canStartQuiz(3, 3)).toBe(true);
  });

  it("unlocks the next module only after a pass", () => {
    expect(canUnlockNextModule(false)).toBe(false);
    expect(canUnlockNextModule(true)).toBe(true);
  });

  it("increments an immutable attempt sequence", () => {
    expect(getNextAttemptNumber(0)).toBe(1);
    expect(getNextAttemptNumber(3)).toBe(4);
  });

  it("keeps progress in progress after a failed first attempt", () => {
    const updatedProgress = applyQuizResultToProgress(
      { bestScorePercent: null, passedAt: null, status: "in_progress" },
      calculateQuizResult(3, 5),
      "2026-09-03T09:00:00.000Z",
    );

    expect(updatedProgress).toEqual({
      bestScorePercent: 60,
      passedAt: null,
      status: "in_progress",
    });
  });

  it("passes on retry and records the first passing timestamp", () => {
    const updatedProgress = applyQuizResultToProgress(
      { bestScorePercent: 60, passedAt: null, status: "in_progress" },
      calculateQuizResult(4, 5),
      "2026-09-03T10:00:00.000Z",
    );

    expect(updatedProgress).toEqual({
      bestScorePercent: 80,
      passedAt: "2026-09-03T10:00:00.000Z",
      status: "passed",
    });
  });

  it("does not remove a pass or reduce the best score after a later retry", () => {
    const updatedProgress = applyQuizResultToProgress(
      {
        bestScorePercent: 80,
        passedAt: "2026-09-03T10:00:00.000Z",
        status: "passed",
      },
      calculateQuizResult(2, 5),
      "2026-09-03T11:00:00.000Z",
    );

    expect(updatedProgress).toEqual({
      bestScorePercent: 80,
      passedAt: "2026-09-03T10:00:00.000Z",
      status: "passed",
    });
  });
});
