import { type QuizQuestion, moduleOneQuizQuestions } from "@/features/learning/catalog";
import { moduleTwoQuizQuestions } from "@/features/learning/module-two-content";
import { moduleThreeQuizQuestions } from "@/features/learning/module-three-content";
import { moduleFourQuizQuestions } from "@/features/learning/module-four-content";
import { authoringLessons } from "./lesson-package";

export const assessmentFields = ["quizAttempts", "moduleTwoQuizAttempts", "moduleThreeQuizAttempts", "moduleFourQuizAttempts"] as const;
export const baseAssessmentBanks = [moduleOneQuizQuestions, moduleTwoQuizQuestions, moduleThreeQuizQuestions, moduleFourQuizQuestions];
export type ResolvedAssessment = { module: number; title: string; questions: QuizQuestion[]; contentVersion: string; passThresholdPercent: number; releaseId?: string };
export type AssessmentRelease = { id: string; module_number: number; title: string; questions: QuizQuestion[]; pass_threshold: number; version: number; status: "draft" | "published" | "archived" };
export type AssessmentDraft = { module: number; title: string; passThresholdPercent: number; questions: QuizQuestion[] };
export const releaseContentVersion = (id: string) => `assessment:${id}`;
export function releaseIdFromVersion(value: unknown): string | null { return typeof value === "string" && /^assessment:[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value) ? value.slice(11) : null; }
export function resolveRelease(row: AssessmentRelease): ResolvedAssessment { return { module: row.module_number, title: row.title, questions: row.questions, contentVersion: releaseContentVersion(row.id), passThresholdPercent: row.pass_threshold, releaseId: row.id }; }
function text(value: unknown, name: string, min: number, max: number): string { if (typeof value !== "string" || value.trim().length < min || value.trim().length > max) throw new Error(`${name} must contain ${min}–${max} characters.`); return value.trim(); }
function id(value: unknown, name: string) { if (typeof value !== "string" || !/^[a-z0-9][a-z0-9_-]{0,99}$/i.test(value) || Object.hasOwn(Object.prototype,value)) throw new Error(`${name} needs a safe stable identifier using letters, numbers, dashes or underscores.`); return value; }
export function validateAssessmentDraft(payload: Record<string, unknown>): AssessmentDraft {
  const moduleNumber = Number(payload.module), threshold = Number(payload.passThresholdPercent);
  if (!Number.isInteger(moduleNumber) || !authoringLessons[moduleNumber - 1]) throw new Error("Choose a course module.");
  if (!Number.isInteger(threshold) || threshold < 70 || threshold > 100) throw new Error("The passing score must be a whole number from 70% to 100%.");
  if (!Array.isArray(payload.questions) || payload.questions.length < 5 || payload.questions.length > 40) throw new Error("A knowledge check needs 5–40 questions.");
  const questionIds = new Set<string>();
  const questions = payload.questions.map((value: unknown): QuizQuestion => {
    if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error("Check the question details.");
    const raw = value as Record<string, unknown>, questionId = id(raw.id, "Question");
    if (questionIds.has(questionId)) throw new Error("Each question must have a different identifier."); questionIds.add(questionId);
    if (!["single", "multiple"].includes(String(raw.kind)) || !authoringLessons[moduleNumber - 1].some(lesson => lesson.id === raw.lessonSlug)) throw new Error("Choose an answer type and a lesson in this module.");
    if (!Array.isArray(raw.options) || raw.options.length < 2 || raw.options.length > 6) throw new Error("Each question needs 2–6 answer choices.");
    const optionIds = new Set<string>();
    const options = raw.options.map((entry: unknown) => {
      if (!entry || typeof entry !== "object" || Array.isArray(entry)) throw new Error("Check the answer choices.");
      const option = entry as Record<string, unknown>, optionId = id(option.id, "Answer choice");
      if (optionIds.has(optionId)) throw new Error("Each answer choice needs a different identifier."); optionIds.add(optionId);
      return { id: optionId, label: text(option.label, "Answer choice", 1, 1500) };
    });
    if (!Array.isArray(raw.correctOptionIds) || !raw.correctOptionIds.length || new Set(raw.correctOptionIds).size !== raw.correctOptionIds.length || raw.correctOptionIds.some(answer => typeof answer !== "string" || !optionIds.has(answer)) || raw.kind === "single" && raw.correctOptionIds.length !== 1) throw new Error("Mark the correct answer choices. A single-answer question must have exactly one.");
    return { id: questionId, kind: raw.kind as QuizQuestion["kind"], lessonSlug: String(raw.lessonSlug), options, correctOptionIds: raw.correctOptionIds as string[], prompt: text(raw.prompt, "Question text", 10, 2500), concept: text(raw.concept, "Concept", 3, 200), explanation: text(raw.explanation, "Feedback explanation", 10, 3000) };
  });
  if(new TextEncoder().encode(JSON.stringify(questions)).byteLength>250000)throw new Error("The question text is too long. Shorten the questions and answer explanations before saving.");
  return { module: moduleNumber, title: text(payload.title, "Knowledge check title", 3, 180), passThresholdPercent: threshold, questions };
}
