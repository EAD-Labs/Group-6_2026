import { describe, expect, it } from "vitest";

import {
  getBestQuizScore,
  hasPassedModuleOne,
  initialDemoState,
  loadDemoState,
  saveDemoState,
} from "./demo-state";

describe("presentation demo state", () => {
  it("returns a safe initial state when storage is empty", () => {
    expect(loadDemoState({ getItem: () => null })).toEqual(initialDemoState);
  });

  it("recovers from invalid stored JSON", () => {
    expect(loadDemoState({ getItem: () => "not-json" })).toEqual(initialDemoState);
  });

  it("persists a serializable state", () => {
    let value = "";
    saveDemoState({ setItem: (_key, storedValue) => (value = storedValue) }, initialDemoState);
    expect(JSON.parse(value)).toMatchObject({ displayName: "Meera" });
  });

  it("retains the highest quiz score and any passing attempt", () => {
    const attempts = [
      {
        answers: {},
        attemptedAt: "2026-09-08T09:00:00.000Z",
        correctAnswers: 3,
        passed: false,
        scorePercent: 60,
      },
      {
        answers: {},
        attemptedAt: "2026-09-08T09:05:00.000Z",
        correctAnswers: 4,
        passed: true,
        scorePercent: 80,
      },
    ];

    expect(getBestQuizScore(attempts)).toBe(80);
    expect(hasPassedModuleOne(attempts)).toBe(true);
  });
});
