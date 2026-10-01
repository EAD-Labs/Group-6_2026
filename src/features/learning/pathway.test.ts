import { describe, expect, it } from "vitest";
import { initialDemoState, type AssistantSpec, type QuizAttempt } from "@/features/demo/demo-state";
import { moduleOneLessons } from "./catalog";
import { moduleTwoLessons } from "./module-two-content";
import { moduleFourLessons } from "./module-four-content";
import { readyPortfolio } from "@/test/fixtures/source-portfolio";
import { moduleThreeLessons } from "./module-three-content";
import { assistantHasEvidence, assistantHasRepairEvidence, getPathwayStatus } from "./pathway";
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
      evidenceMode: "external" as const, sourcePack: "Original run source", classContextCard: "Original run classroom", output: "Reviewed classroom draft", review: "Teacher checked behavior", version: 1,
      verdict: (index === 2 ? "partial" : "pass") as "partial" | "pass", createdAt: "2026-09-25T00:00:00Z",
    })),
    ...["T1", "T2", "T3"].map((caseId) => ({ id: `retest-${caseId}`, caseId,
      input: staffroomChallenges.find((challenge) => challenge.id === caseId)!.input,
      evidenceMode: "external" as const, sourcePack: "Original run source", classContextCard: "Original run classroom", expected: "Corrected behavior", output: "Reviewed updated draft",
      review: "Teacher compared versions", version: 2, verdict: "pass" as const,
      createdAt: "2026-09-25T00:30:00Z",
    })),
  ],
};
const promptLibrary = promptLibraryCategories.map(({ id }) => ({
  category: id, reviewBasis: "observed" as const, template: "Create [output] for [grade] and [objective] with [constraints].",
  completedExample: "Create an exit question for Class 7 evaporation using board only.",
  knownFailure: "First result assumed a projector was available in class.",
  reviewChecklist: "Check answers, learning alignment, timing, language and privacy.",
  transferNote: "Tried Class 8 condensation and changed the materials slot.",
}));

describe("four-module progression", () => {
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

  it("records Module 2 and 3 completion independently of earlier modules", () => {
    const moduleTwo = { ...initialDemoState, moduleTwoCompletedLessonIds: moduleTwoLessons.map((lesson) => lesson.id),
      moduleTwoQuizAttempts: [pass], craftPracticeCount: 2, promptLibrary };
    expect(getPathwayStatus(moduleTwo)).toMatchObject({ onePassed: false, twoPassed: true });
    const moduleThree = { ...initialDemoState, moduleThreeCompletedLessonIds: moduleThreeLessons.map((lesson) => lesson.id),
      moduleThreeQuizAttempts: [pass], assistants: [assistant] };
    expect(getPathwayStatus(moduleThree)).toMatchObject({ onePassed: false, twoPassed: false, threePassed: true });
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
  it("records Module 4 independently, but requires its lessons, portfolio and quiz", () => {
    const four = { ...initialDemoState, moduleFourCompletedLessonIds: moduleFourLessons.map((lesson) => lesson.id),
      moduleFourQuizAttempts: [pass], sourcePortfolio: readyPortfolio() };
    expect(getPathwayStatus(four)).toMatchObject({ onePassed: false, fourPassed: true, courseComplete: false });
    expect(getPathwayStatus({ ...four, sourcePortfolio: initialDemoState.sourcePortfolio }).fourPassed).toBe(false);
    expect(getPathwayStatus({ ...four, moduleFourQuizAttempts: [] }).fourPassed).toBe(false);
    expect(getPathwayStatus({ ...four, moduleFourCompletedLessonIds: [] }).fourPassed).toBe(false);
  });

  it("accepts an honest all-pass baseline only after a documented improvement and three matching retests", () => {
    const strengthened: AssistantSpec = { ...assistant, improvementApproach: "strengthen", weakness: "No observed failure; make the source-gap stopping instruction explicit.", tests: assistant.tests.map(test => ({ ...test, verdict: "pass" })) };
    expect(assistantHasRepairEvidence(strengthened)).toBe(true);
    expect(assistantHasRepairEvidence({ ...strengthened, improvementApproach: "repair" })).toBe(false);
    expect(assistantHasRepairEvidence({ ...strengthened, tests: strengthened.tests.filter(test => test.id !== "retest-T3") })).toBe(false);
    expect(assistantHasRepairEvidence({ ...strengthened, tests: strengthened.tests.map(test => test.id === "retest-T3" ? { ...test, input: "A different task" } : test) })).toBe(false);
    expect(assistantHasRepairEvidence({ ...strengthened, revision: "" })).toBe(false);
  });

  it("requires all six baseline cases before the later version and keeps prepared comparisons distinct", () => {
    expect(assistantHasRepairEvidence({ ...assistant, tests: assistant.tests.map(test => test.id === "T6" ? { ...test, version: 2 } : test) })).toBe(false);
    const prepared: AssistantSpec = { ...assistant, tests: assistant.tests.map(test => ({ ...test, evidenceMode: "prepared" })) };
    expect(assistantHasRepairEvidence(prepared)).toBe(true);
    expect(assistantHasRepairEvidence({ ...prepared, tests: prepared.tests.map(test => test.id === "retest-T3" ? { ...test, evidenceMode: "live" } : test) })).toBe(false);
  });

  it("reaches 100 percent only when all four module requirements are complete", () => {
    const complete = { ...initialDemoState,
      completedLessonSlugs: moduleOneLessons.map((lesson) => lesson.slug), quizAttempts: [pass],
      moduleTwoCompletedLessonIds: moduleTwoLessons.map((lesson) => lesson.id), moduleTwoQuizAttempts: [pass],
      craftPracticeCount: 2, promptLibrary, moduleThreeCompletedLessonIds: moduleThreeLessons.map((lesson) => lesson.id),
      moduleThreeQuizAttempts: [pass], assistants: [assistant],
      moduleFourCompletedLessonIds: moduleFourLessons.map((lesson) => lesson.id), moduleFourQuizAttempts: [pass],
      sourcePortfolio: readyPortfolio(),
    };
    expect(getPathwayStatus(complete)).toMatchObject({ courseComplete: true, coursePercent: 100, completedModules: 4 });
    expect(getPathwayStatus({ ...complete, moduleFourQuizAttempts: [] }).coursePercent).toBeLessThan(100);
  });

});

it("does not credit a repaired result obtained after changing the source or classroom conditions", () => {
  expect(assistantHasRepairEvidence(assistant)).toBe(true);
  expect(assistantHasRepairEvidence({ ...assistant, tests: assistant.tests.map(test => test.id === "retest-T3" ? { ...test, sourcePack: "Replaced the missing source with the answer" } : test) })).toBe(false);
  expect(assistantHasRepairEvidence({ ...assistant, tests: assistant.tests.map(test => test.id === "retest-T3" ? { ...test, classContextCard: "Changed the grade and objective" } : test) })).toBe(false);
  expect(assistantHasRepairEvidence({ ...assistant, tests: assistant.tests.map(test => ({ ...test, sourcePack: undefined, classContextCard: undefined })) })).toBe(false);
});
