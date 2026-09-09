import { describe, expect, it } from "vitest";

import { sanitizeDemoState } from "./server-state";

describe("authenticated participant state validation", () => {
  it("keeps supported profile and progress values", () => {
    const state = sanitizeDemoState({
      displayName: " Meera ",
      teachingLevel: "Classes 5–7",
      completedLessonSlugs: ["meet-generative-ai", "unknown"],
      quizAttempts: [{ scorePercent: 80, correctAnswers: 4, passed: false }],
    });

    expect(state.displayName).toBe("Meera");
    expect(state.completedLessonSlugs).toEqual(["meet-generative-ai"]);
    expect(state.quizAttempts[0]).toMatchObject({
      scorePercent: 80,
      passed: true,
    });
  });

  it("rejects unsupported enum values and oversized collections", () => {
    const state = sanitizeDemoState({
      aiFamiliarity: "expert",
      teachingLevel: "University",
      goals: Array.from({ length: 12 }, (_, index) => "Goal " + index),
    });

    expect(state.aiFamiliarity).toBe("New to AI");
    expect(state.teachingLevel).toBe("Classes 5–7");
    expect(state.goals).toHaveLength(8);
  });
});
