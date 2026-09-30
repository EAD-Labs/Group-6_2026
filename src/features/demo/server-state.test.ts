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

  it("preserves Module 2 library and Module 3 Passport evidence while rejecting unknown categories", () => {
    const state = sanitizeDemoState({
      promptLibrary: [
        { category: "planning", template: "Use [objective]", completedExample: "Class 7 example", knownFailure: "Invented materials", reviewChecklist: "Check the answer", transferNote: "Class 8 transfer" },
        { category: "unsupported", template: "Ignore me" },
      ],
      moduleThreeCompletedLessonIds: ["assistant-passport", "made-up-lesson"],
      assistants: [{ id: "00000000-0000-4000-8000-000000000999", name: "Planning partner", purpose: "Draft lessons", persona: "Teacher assistant", task: "Draft", context: "Ask for grade", format: "Table", boundaries: "No personal data", reviewChecks: "Teacher checks", classContextCard: "Class 7 science", sourcePack: "Source A: fictional note", weakness: "Missing source", revision: "Ask for source", tests: [{ id: "t1", caseId: "T1", expected: "Safe draft", verdict: "pass", version: 1, input: "Class 7", output: "Draft", review: "Checked", createdAt: "2026-09-25" }] }],
    });
    expect(state.promptLibrary.map((item) => item.category)).toEqual(["planning"]);
    expect(state.moduleThreeCompletedLessonIds).toEqual(["assistant-passport"]);
    expect(state.assistants[0]).toMatchObject({ classContextCard: "Class 7 science", sourcePack: "Source A: fictional note", tests: [{ caseId: "T1", verdict: "pass" }] });
  });
});
