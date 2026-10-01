import { describe, expect, it } from "vitest";
import { initialDemoState, type QuizAttempt } from "./demo-state";
import { assessParticipantState, assessmentBanks, gradeAttempt } from "./server-assessment";
import { sanitizeDemoState } from "./server-state";

const attempt = (answers: QuizAttempt["answers"]): QuizAttempt => ({ id: "attempt-1", answers, attemptedAt: "2026-09-30T12:00:00Z", passed: true, scorePercent: 100, correctAnswers: 5 });
const questions = assessmentBanks.quizAttempts;
const correctAnswers = Object.fromEntries(questions.map((question) => [question.id, question.correctOptionIds]));

describe("trusted server assessment", () => {
  it("ignores fabricated score, pass and correct-answer totals", () => {
    const graded = gradeAttempt(attempt({}), questions, "module-1");
    expect(graded).toMatchObject({ scorePercent: 0, passed: false, correctAnswers: 0 });
    expect(gradeAttempt({ ...attempt(correctAnswers), passed: false, scorePercent: 0 }, questions, "module-1")).toMatchObject({ scorePercent: 100, passed: true });
  });
  it.each([
    { bogus: ["fake"] },
    { [questions[0].id]: ["unknown"] },
    { [questions[0].id]: [questions[0].options[0].id, questions[0].options[0].id] },
  ])("rejects unknown and duplicate responses", (answers) => {
    expect(() => gradeAttempt(attempt(answers), questions, "module-1")).toThrow();
  });
  it("makes retries idempotent and retains immutable historical attempts", () => {
    const saved = assessParticipantState({ ...initialDemoState, quizAttempts: [attempt(correctAnswers)] });
    const replay = assessParticipantState({ ...initialDemoState, quizAttempts: [attempt(correctAnswers)] }, saved);
    expect(replay.quizAttempts).toEqual(saved.quizAttempts);
    expect(assessParticipantState(initialDemoState, saved).quizAttempts).toEqual(saved.quizAttempts);
    expect(() => assessParticipantState({ ...initialDemoState, quizAttempts: [attempt({})] }, saved)).toThrow(/cannot be changed/);
  });
  it("grades every module against its own question bank", () => {
    const state = { ...initialDemoState };
    for (const key of Object.keys(assessmentBanks) as Array<keyof typeof assessmentBanks>) {
      state[key] = [attempt(Object.fromEntries(assessmentBanks[key].map((question) => [question.id, question.correctOptionIds])))];
    }
    const graded = assessParticipantState(state);
    expect(graded.moduleThreeQuizAttempts[0].correctAnswers).toBe(10);
    expect(graded.moduleFourQuizAttempts[0].scorePercent).toBe(100);
  });
  it("preserves verified historical answers and content versions after a question is retired", () => {
    const historical = { ...attempt({ retiredQuestion: ["retiredAnswer"] }), contentVersion: "older-published-version", verifiedAt: "2026-09-01T12:00:00Z" };
    const saved = { ...initialDemoState, quizAttempts: [historical] };
    const result = assessParticipantState({ ...saved, displayName: "Updated profile", quizAttempts: [{ ...historical, scorePercent: 0, contentVersion: "forged" }] }, saved);
    expect(result.quizAttempts).toEqual([historical]);
    expect(() => assessParticipantState({ ...initialDemoState, quizAttempts: [historical] })).toThrow(/unknown question/);
  });
  it("preserves captured Passport history while allowing current edits and whole-assistant deletion", () => {
    const id = "00000000-0000-4000-8000-000000000999";
    const saved = sanitizeDemoState({ assistants: [{ id, name: "Current original", versions: [
      { version: 1, at: "2026-10-01", note: "Captured", snapshot: { name: "Original Passport", task: "Original task" } },
      { version: 2, at: "2026-10-02", note: "Legacy record" },
    ] }] });
    const input = sanitizeDemoState({ assistants: [{ id, name: "Current edited", versions: [
      { version: 1, note: "Overwrite", snapshot: { name: "Replacement" } },
      { version: 2, snapshot: { name: "Invented legacy snapshot" } },
      { version: 3, note: "New version", snapshot: { name: "Third Passport" } },
    ] }] });
    const result = assessParticipantState(input, saved);
    expect(result.assistants[0].name).toBe("Current edited");
    expect(result.assistants[0].versions?.slice(0, 2)).toEqual(saved.assistants[0].versions);
    expect(result.assistants[0].versions?.[2].snapshot?.name).toBe("Third Passport");
    expect(assessParticipantState(sanitizeDemoState({ assistants: [{ id }] }), saved).assistants[0].versions).toEqual(saved.assistants[0].versions);
    expect(assessParticipantState(initialDemoState, saved).assistants).toEqual([]);
    const legacy = sanitizeDemoState({ assistants: [{ id, tests: [{ id: "old-test", version: 1 }] }] });
    expect(assessParticipantState(input, legacy).assistants[0].versions?.some((entry) => entry.version === 1)).toBe(false);
  });
  it("retains reviewed test observations and run conditions across edited or stale payloads", () => {
    const id = "00000000-0000-4000-8000-000000000999";
    const saved = sanitizeDemoState({ assistants: [{ id, tests: [
      { id: "case-1", caseId: "T1", version: 1, input: "Original input", output: "Original observed output", expected: "Ask for source", review: "Original teacher review", verdict: "fail", evidenceMode: "external", sourcePack: "Original source", classContextCard: "Original class" },
      { id: "case-2", version: 1, input: "Legacy test without conditions" },
    ] }] });
    const input = sanitizeDemoState({ assistants: [{ id, sourcePack: "Current source edited", tests: [
      { id: "case-1", version: 2, input: "Changed input", output: "Fabricated pass", verdict: "pass", evidenceMode: "live", sourcePack: "Changed source", classContextCard: "Changed class" },
      { id: "new-rerun", version: 2, input: "Original input", output: "New observed output", verdict: "pass", sourcePack: "Original source", classContextCard: "Original class" },
    ] }] });
    const result = assessParticipantState(input, saved);
    expect(result.assistants[0].tests.slice(0, 2)).toEqual(saved.assistants[0].tests);
    expect(result.assistants[0].tests[2].id).toBe("new-rerun");
    expect(result.assistants[0].sourcePack).toBe("Current source edited");
    expect(assessParticipantState(sanitizeDemoState({ assistants: [{ id }] }), saved).assistants[0].tests).toEqual(saved.assistants[0].tests);
    expect(assessParticipantState(initialDemoState, saved).assistants).toEqual([]);
  });
});
