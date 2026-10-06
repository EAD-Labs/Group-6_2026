import { createHash } from "node:crypto";
import { assessmentBanks, assessmentVersion } from "@/features/demo/server-assessment";
import { isQuestionCorrect } from "@/features/learning/quiz";
import { uuidPattern } from "@/features/platform/server";

export type LearningEvent = {
  id: string; sessionId: string; attemptId?: string; kind: string; path: string; occurredAt: string;
  activeMs: number; target?: string; module?: number; questionId?: string; selectedOptions?: string[];
  correct?: boolean; contentVersion?: string;
};
export function validateEvents(value: unknown, now = Date.now()): LearningEvent[] {
  if (!Array.isArray(value) || value.length < 1 || value.length > 50) throw new Error("Send 1–50 activity events.");
  return value.map(raw => {
    if (!raw || typeof raw !== "object" || Array.isArray(raw)) throw new Error("Invalid activity event.");
    const time = Date.parse(raw.occurredAt);
    if (!uuidPattern.test(raw.id) || !uuidPattern.test(raw.sessionId) ||
      !["page_view", "page_time", "click", "question_view", "question_answer", "quiz_submit"].includes(raw.kind) ||
      typeof raw.path !== "string" || raw.path.length > 180 || !/^\/(?:dashboard|learn|progress|profile|onboarding|certificate|admin|staff)(?:\/[a-z0-9-]+)*$/.test(raw.path) ||
      !Number.isFinite(time) || time > now + 60_000 || time < now - 7 * 86400_000 ||
      !Number.isInteger(raw.activeMs) || raw.activeMs < 0 || raw.activeMs > 3600_000) throw new Error("Invalid activity fields.");
    const event: LearningEvent = { id: raw.id, sessionId: raw.sessionId, kind: raw.kind, path: raw.path, occurredAt: new Date(time).toISOString(), activeMs: raw.activeMs };
    if (raw.kind !== "page_time" && raw.kind !== "question_answer") event.activeMs = 0;
    if (raw.kind === "click") {
      if (typeof raw.target !== "string" || !/^[a-z0-9_/:.\-]{1,160}$/i.test(raw.target)) throw new Error("Invalid click target.");
      event.target = raw.target;
    }
    if (raw.kind.startsWith("question_") || raw.kind === "quiz_submit") {
      if (!Number.isInteger(raw.module) || raw.module < 1 || raw.module > 4 || !uuidPattern.test(raw.attemptId) || raw.path !== `/learn/module-${raw.module}/quiz`) throw new Error("Invalid quiz activity.");
      event.module = raw.module; event.attemptId = raw.attemptId;
      const questions = Object.values(assessmentBanks)[raw.module - 1];
      event.contentVersion = `${assessmentVersion}:${createHash("sha256").update(JSON.stringify(questions)).digest("hex").slice(0, 16)}`;
      if (raw.kind !== "quiz_submit") {
        const question = questions.find(q => q.id === raw.questionId);
        if (!question) throw new Error("Unknown question.");
        event.questionId = question.id;
        if (raw.kind === "question_answer") {
          if (!Array.isArray(raw.selectedOptions) || !raw.selectedOptions.length || new Set(raw.selectedOptions).size !== raw.selectedOptions.length ||
            raw.selectedOptions.some((id: unknown) => !question.options.some(o => o.id === id)) || (question.kind === "single" && raw.selectedOptions.length !== 1)) throw new Error("Invalid answer selection.");
          event.selectedOptions = raw.selectedOptions;
          event.correct = isQuestionCorrect(question, raw.selectedOptions);
        }
      }
    }
    return event;
  });
}
