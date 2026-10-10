import { describe, expect, it } from "vitest";

import { sanitizeDemoState } from "./server-state";
import { readyPortfolio } from "@/test/fixtures/source-portfolio";

describe("authenticated participant state validation", () => {
  it("retains optional AI experience answers and removes unsupported tool choices", () => {
    const state = sanitizeDemoState({ aiToolsUsed: ["Gemini", "ChatGPT", "unsupported", "Gemini"], aiFamiliarity: "Use it regularly", aiUseFrequency: "Every week", currentAiUse: " Make quiz questions ", aiToolOther: "Ignored unless Other is selected" });
    expect(state).toMatchObject({ aiToolsUsed: ["Gemini", "ChatGPT"], aiFamiliarity: "Use it regularly", aiUseFrequency: "Every week", currentAiUse: "Make quiz questions", aiToolOther: "" });
    expect(sanitizeDemoState({ aiToolsUsed: ["None yet"], aiFamiliarity: "Use it regularly", aiUseFrequency: "Most days", currentAiUse: "Contradictory old answer" }))
      .toMatchObject({ aiToolsUsed: ["None yet"], aiFamiliarity: "New to AI", aiUseFrequency: "Not yet", currentAiUse: "" });
  });
  it("retains correct-answer totals for expanded pilot question banks", () => {
    const state = sanitizeDemoState({ moduleThreeQuizAttempts: [{ correctAnswers: 23, scorePercent: 100 }] });
    expect(state.moduleThreeQuizAttempts[0].correctAnswers).toBe(23);
  });
  it("preserves Module 4 evidence and rejects unknown lesson IDs", () => {
    const state = sanitizeDemoState({ moduleFourCompletedLessonIds: ["citation-detective", "unknown"],
      moduleFourQuizAttempts: [{ scorePercent: 80, correctAnswers: 4 }],
      sourcePortfolio: readyPortfolio(), lessonEvidence: { "citation-detective": "Checked A:2 against the contradicted claim." } });
    expect(state.moduleFourCompletedLessonIds).toEqual(["citation-detective"]);
    expect(state.moduleFourQuizAttempts[0]).toMatchObject({ scorePercent: 80, passed: true });
    expect(state.sourcePortfolio.audits.c2.verdict).toBe("contradicted");
    expect(state.lessonEvidence["citation-detective"]).toContain("A:2");
  });
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
  it("retains honest prepared-example evidence labels and a strengthening approach", () => {
    const state = sanitizeDemoState({ assistants: [{ id: "00000000-0000-4000-8000-000000000999", improvementApproach: "strengthen", tests: [
      { id: "prepared", evidenceMode: "prepared" }, { id: "unknown", evidenceMode: "verified-by-ai" }, { id: "legacy" },
    ] }] });
    expect(state.assistants[0].improvementApproach).toBe("strengthen");
    expect(state.assistants[0].tests.map((test) => test.evidenceMode)).toEqual(["prepared", undefined, undefined]);
    expect(sanitizeDemoState({ assistants: [{ id: "00000000-0000-4000-8000-000000000999" }] }).assistants[0].improvementApproach).toBe("repair");
  });
  it("bounds Passport snapshots, preserves legacy absence, and keeps the first duplicate version", () => {
    const state = sanitizeDemoState({ assistants: [{ id: "00000000-0000-4000-8000-000000000999", versions: [
      { version: 1, note: "Original", snapshot: { name: "N".repeat(150), task: "T".repeat(3000), optionalInputs: "I".repeat(3000), unsafeExtra: "discard" } },
      { version: 1, note: "Overwrite", snapshot: { name: "Replacement" } },
      { version: 2, note: "Legacy without snapshot" },
    ] }] });
    const history = state.assistants[0].versions!;
    expect(history).toHaveLength(2);
    expect(history[0].note).toBe("Original");
    expect(history[0].snapshot?.name).toHaveLength(100);
    expect(history[0].snapshot?.task).toHaveLength(2000);
    expect(history[0].snapshot?.optionalInputs).toHaveLength(2500);
    expect(history[0].snapshot?.creatorCredit).toBeUndefined();
    expect(history[0].snapshot).not.toHaveProperty("unsafeExtra");
    expect(history[1].snapshot).toBeUndefined();
  });
  it("retains complete deduplicated history and the actual per-run conditions without inventing legacy values", () => {
    const tests = Array.from({ length: 35 }, (_, i) => ({ id: `test-${i}`, version: i + 1, input: `Original ${i}` }));
    const state = sanitizeDemoState({ assistants: [{ id: "00000000-0000-4000-8000-000000000999", versions: tests.map((test) => ({ version: test.version })), tests: [
      ...tests, { id: "test-0", input: "Overwrite" },
      { id: "contextual", sourcePack: "S".repeat(3000), classContextCard: "C".repeat(3000) },
      { id: "empty-conditions", sourcePack: "", classContextCard: "" },
    ] }] });
    const assistant = state.assistants[0];
    expect(assistant.tests).toHaveLength(37);
    expect(assistant.versions).toHaveLength(35);
    expect(assistant.tests[0].input).toBe("Original 0");
    expect(assistant.tests[0].sourcePack).toBeUndefined();
    expect(assistant.tests[0].classContextCard).toBeUndefined();
    expect(assistant.tests[35].sourcePack).toHaveLength(2500);
    expect(assistant.tests[35].classContextCard).toHaveLength(2500);
    expect(assistant.tests[36]).toMatchObject({ sourcePack: "", classContextCard: "" });
  });
});
