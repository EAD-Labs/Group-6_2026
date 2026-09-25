import { describe, expect, it } from "vitest";
import { initialDemoState, type AssistantSpec, type QuizAttempt } from "@/features/demo/demo-state";
import { moduleOneLessons } from "./catalog";
import { moduleTwoLessons } from "./module-two-content";
import { moduleThreeLessons } from "./module-three-content";
import { assistantHasEvidence, getPathwayStatus } from "./pathway";
import { staffroomChallenges } from "./staffroom-challenges";
import { promptLibraryCategories } from "./prompt-library";

const pass: QuizAttempt = { answers: {}, attemptedAt: "2026-09-25T00:00:00Z", correctAnswers: 4, passed: true, scorePercent: 80 };
const assistant: AssistantSpec = {
  id: "00000000-0000-4000-8000-000000000999", version: 2, name: "Exit tickets", purpose: "Draft exit tickets", persona: "Class 6 teacher",
  task: "Create questions", context: "Ask for learning goal", format: "Three items with answers",
  boundaries: "No private data", reviewChecks: "Verify each answer", weakness: "Invented citation",
  revision: "Cite only supplied text", updatedAt: "2026-09-25T00:00:00Z",
  rehearsalTranscript: "Three synthetic turns and a debrief", revisedQuestion: "Which part would you compare first?",
  classContextCard: "Class 7; objective: compare fractions; 30 minutes; paper strips",
  sourcePack: "Fictional note A, dated 2026-09-25: equivalent fractions have the same value.",
  handoffNotes: "Planner to Detective; teacher checks source conflict", reuseDiary: "Self-transfer to a new topic; five minutes review",
  tests: [
    ...staffroomChallenges.map((challenge, index) => ({
      id: challenge.id, caseId: challenge.id, input: challenge.input, expected: challenge.expected,
      output: "Reviewed classroom draft", review: "Teacher checked behavior", version: 1,
      verdict: (index === 2 ? "partial" : "pass") as "partial" | "pass", createdAt: "2026-09-25T00:00:00Z",
    })),
    ...["T1", "T2", "T3"].map((caseId) => ({ id: `retest-${caseId}`, caseId,
      input: staffroomChallenges.find((challenge) => challenge.id === caseId)!.input,
      expected: "Corrected behavior", output: "Reviewed updated draft",
      review: "Teacher compared versions", version: 2, verdict: "pass" as const,
      createdAt: "2026-09-25T00:30:00Z",
    })),
  ],
};
const promptLibrary = promptLibraryCategories.map(({ id }) => ({
  category: id, template: "Create [output] for [grade] and [objective] with [constraints].",
  completedExample: "Create an exit question for Class 7 evaporation using board only.",
  knownFailure: "First result assumed a projector was available in class.",
  reviewChecklist: "Check answers, learning alignment, timing, language and privacy.",
  transferNote: "Tried Class 8 condensation and changed the materials slot.",
}));

describe("three-module progression", () => {
  it("requires all Module 1 lessons before passing even with a high quiz score", () => {
    expect(getPathwayStatus({ ...initialDemoState, quizAttempts: [pass] }).onePassed).toBe(false);
  });

  it("requires two CRAFT attempts, all lessons and the Module 2 quiz", () => {
    const base = { ...initialDemoState,
      completedLessonSlugs: moduleOneLessons.map((lesson) => lesson.slug), quizAttempts: [pass],
      moduleTwoCompletedLessonIds: moduleTwoLessons.map((lesson) => lesson.id), moduleTwoQuizAttempts: [pass],
    };
    expect(getPathwayStatus(base).twoPassed).toBe(false);
    expect(getPathwayStatus({ ...base, craftPracticeCount: 2 }).twoPassed).toBe(false);
    expect(getPathwayStatus({ ...base, craftPracticeCount: 2, promptLibrary }).twoPassed).toBe(true);
  });

  it("requires all six cases and reviewed regression retests for Module 3", () => {
    const base = { ...initialDemoState,
      completedLessonSlugs: moduleOneLessons.map((lesson) => lesson.slug), quizAttempts: [pass],
      moduleTwoCompletedLessonIds: moduleTwoLessons.map((lesson) => lesson.id), moduleTwoQuizAttempts: [pass],
      craftPracticeCount: 2, promptLibrary, moduleThreeCompletedLessonIds: moduleThreeLessons.map((lesson) => lesson.id),
      moduleThreeQuizAttempts: [pass], assistants: [assistant],
    };
    expect(getPathwayStatus(base).threePassed).toBe(true);
    expect(assistantHasEvidence({ ...assistant, tests: assistant.tests.filter((test) => test.caseId !== "T6") })).toBe(false);
    expect(assistantHasEvidence({ ...assistant, tests: assistant.tests.map((test) =>
      test.id === "retest-T3" ? { ...test, review: "" } : test,
    ) })).toBe(false);
    expect(getPathwayStatus({ ...base, assistants: [{ ...assistant, revision: "" }] }).threePassed).toBe(false);
  });
});
