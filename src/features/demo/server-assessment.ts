import { createHash } from "node:crypto";
import type { DemoState, QuizAttempt } from "./demo-state";
import { moduleOneQuizQuestions, type QuizQuestion } from "@/features/learning/catalog";
import { moduleTwoQuizQuestions } from "@/features/learning/module-two-content";
import { moduleThreeQuizQuestions } from "@/features/learning/module-three-content";
import { moduleFourQuizQuestions } from "@/features/learning/module-four-content";
import { evaluateQuiz } from "@/features/learning/quiz";

export const assessmentVersion = "2026-10-06-pilot-v2";
export const assessmentBanks = {
  quizAttempts: moduleOneQuizQuestions,
  moduleTwoQuizAttempts: moduleTwoQuizQuestions,
  moduleThreeQuizAttempts: moduleThreeQuizQuestions,
  moduleFourQuizAttempts: moduleFourQuizQuestions,
} as const;

export class AssessmentValidationError extends Error {}

function canonicalAnswers(answers: QuizAttempt["answers"]) {
  if (!answers || typeof answers !== "object" || Array.isArray(answers) ||
    Object.values(answers).some((selection) => !Array.isArray(selection) || selection.some((value) => typeof value !== "string") || new Set(selection).size !== selection.length)) {
    throw new AssessmentValidationError("Quiz answers must contain valid, nonduplicated selections.");
  }
  return JSON.stringify(Object.entries(answers).sort(([left], [right]) => left.localeCompare(right)).map(([id, selection]) => [id, [...selection].sort()]));
}

export function gradeAttempt(attempt: QuizAttempt, questions: QuizQuestion[], bank: string): QuizAttempt {
  const raw = attempt.answers;
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    throw new AssessmentValidationError("Quiz answers must be a question-to-selection record.");
  }
  const answers: Record<string, string[]> = {};
  for (const [questionId, selection] of Object.entries(raw)) {
    const question = questions.find((entry) => entry.id === questionId);
    if (!question || !Array.isArray(selection) || selection.some((id) => typeof id !== "string" || !question.options.some((option) => option.id === id)) ||
      new Set(selection).size !== selection.length || (question.kind === "single" && selection.length > 1)) {
      throw new AssessmentValidationError("The quiz contains an unknown question, invalid option or duplicate selection. Please retry this knowledge check.");
    }
    answers[questionId] = [...selection].sort();
  }
  const attemptedAt = Number.isFinite(Date.parse(attempt.attemptedAt)) ? new Date(attempt.attemptedAt).toISOString() : new Date().toISOString();
  const normalized = Object.fromEntries(Object.entries(answers).sort(([left], [right]) => left.localeCompare(right)));
  const id = attempt.id || createHash("sha256").update(JSON.stringify([bank, attemptedAt, normalized])).digest("hex");
  const result = evaluateQuiz(questions, answers);
  return { id, answers, attemptedAt, correctAnswers: result.correctAnswers, passed: result.passed,
    scorePercent: result.scorePercent, contentVersion: `${assessmentVersion}:${createHash("sha256").update(JSON.stringify(questions)).digest("hex").slice(0, 16)}`, verifiedAt: new Date().toISOString() };
}

// Saved attempts are immutable. The caller supplies only server-loaded history here.
export function assessParticipantState(input: DemoState, saved?: DemoState): DemoState {
  const result = { ...input };
  result.assistants = input.assistants.map((assistant) => {
    const previous = saved?.assistants.find((entry) => entry.id === assistant.id);
    if (!previous) return assistant;
    // A version describes the Passport at capture time. Later current edits may
    // neither replace that history nor manufacture snapshots for legacy entries.
    const versions = new Map((previous.versions ?? []).map((entry) => [entry.version, entry]));
    for (const entry of assistant.versions ?? []) {
      const testedWithoutSnapshot = previous.tests.some((test) => (test.version ?? 1) === entry.version);
      if (!versions.has(entry.version) && !testedWithoutSnapshot) versions.set(entry.version, entry);
    }
    // Each saved case is a reviewed observation. Corrections/reruns use a new id;
    // neither a stale tab nor an edited payload can rewrite the original run.
    const tests = new Map(previous.tests.map((test) => [test.id, test]));
    for (const test of assistant.tests) if (!tests.has(test.id)) tests.set(test.id, test);
    return { ...assistant, tests: [...tests.values()], versions: [...versions.values()] };
  });
  for (const [key, questions] of Object.entries(assessmentBanks)) {
    const field = key as keyof typeof assessmentBanks;
    const history = saved?.[field] ?? [];
    const merged = new Map(history.map((attempt) => [attempt.id, attempt]));
    for (const attempt of input[field]) {
      const historical = attempt.id ? merged.get(attempt.id) : undefined;
      if (historical) {
        if (canonicalAnswers(historical.answers) !== canonicalAnswers(attempt.answers)) throw new AssessmentValidationError("A submitted quiz attempt cannot be changed. Start a new attempt.");
        continue; // Preserve the original score/content version after curriculum revisions.
      }
      const graded = gradeAttempt(attempt, questions, field);
      const previous = merged.get(graded.id);
      if (previous) {
        if (canonicalAnswers(previous.answers) !== canonicalAnswers(graded.answers)) {
          throw new AssessmentValidationError("A submitted quiz attempt cannot be changed. Start a new attempt.");
        }
      } else {
        merged.set(graded.id, graded);
      }
    }
    result[field] = [...merged.values()];
  }
  return result;
}
