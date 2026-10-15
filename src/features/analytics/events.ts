import { isQuestionCorrect } from "@/features/learning/quiz";
import { uuidPattern } from "@/features/platform/server";
import { releaseIdFromVersion, type ResolvedAssessment } from "@/features/content-authoring/assessment-release";
import { baseAssessment } from "@/features/content-authoring/server-assessment-releases";

export type LearningEvent = {
  id: string; sessionId: string; attemptId?: string; kind: string; path: string; occurredAt: string;
  activeMs: number; target?: string; module?: number; questionId?: string; selectedOptions?: string[];
  correct?: boolean; contentVersion?: string;
};
function eventBatch(value: unknown): Record<string, unknown>[] {
  if (!Array.isArray(value) || value.length < 1 || value.length > 50) throw new Error("Send 1–50 activity events.");
  return value.map(raw => {
    if (!raw || typeof raw !== "object" || Array.isArray(raw)) throw new Error("Invalid activity event.");
    return raw as Record<string, unknown>;
  });
}

/** Bounded IDs only. Caller must fetch these from the trusted immutable table. */
export function requestedReleaseIds(value: unknown): string[] {
  return [...new Set(eventBatch(value).flatMap(raw => {
    if (!["question_view", "question_answer", "quiz_submit"].includes(String(raw.kind)) ||
      raw.path !== `/learn/module-${raw.module}/quiz` || typeof raw.contentVersion !== "string" || !raw.contentVersion.startsWith("assessment:")) return [];
    const id = releaseIdFromVersion(raw.contentVersion);
    if (!id) throw new Error("Invalid knowledge check version.");
    return [id];
  }))];
}

export function validateEvents(value: unknown, now = Date.now(), releases: readonly ResolvedAssessment[] = []): LearningEvent[] {
  return eventBatch(value).map(raw => {
    const time = typeof raw.occurredAt === "string" ? Date.parse(raw.occurredAt) : NaN;
    if (typeof raw.id !== "string" || !uuidPattern.test(raw.id) || typeof raw.sessionId !== "string" || !uuidPattern.test(raw.sessionId) ||
      typeof raw.kind !== "string" || !["page_view", "page_time", "click", "question_view", "question_answer", "quiz_submit"].includes(raw.kind) ||
      typeof raw.path !== "string" || raw.path.length > 180 || !/^\/(?:dashboard|learn|progress|profile|onboarding|certificate|admin|staff)(?:\/[a-z0-9-]+)*$/.test(raw.path) ||
      !Number.isFinite(time) || time > now + 60_000 || time < now - 7 * 86400_000 ||
      typeof raw.activeMs !== "number" || !Number.isInteger(raw.activeMs) || raw.activeMs < 0 || raw.activeMs > 3600_000) throw new Error("Invalid activity fields.");
    const event: LearningEvent = { id: raw.id, sessionId: raw.sessionId, kind: raw.kind, path: raw.path, occurredAt: new Date(time).toISOString(), activeMs: raw.activeMs };
    if (raw.kind !== "page_time" && raw.kind !== "question_answer") event.activeMs = 0;
    if (raw.kind === "click") {
      if (typeof raw.target !== "string" || !/^[a-z0-9_/:.\-]{1,160}$/i.test(raw.target)) throw new Error("Invalid click target.");
      event.target = raw.target;
    }
    if (raw.kind.startsWith("question_") || raw.kind === "quiz_submit") {
      if (typeof raw.module !== "number" || !Number.isInteger(raw.module) || raw.module < 1 || raw.module > 4 || typeof raw.attemptId !== "string" || !uuidPattern.test(raw.attemptId)) throw new Error("Invalid quiz activity.");
      event.module = raw.module; event.attemptId = raw.attemptId;
      const base = baseAssessment(raw.module), isQuizPage = raw.path === `/learn/module-${raw.module}/quiz`;
      if (raw.contentVersion !== undefined && (typeof raw.contentVersion !== "string" || !raw.contentVersion.length || raw.contentVersion.length > 100)) throw new Error("Invalid knowledge check version.");
      const version = raw.contentVersion || base.contentVersion;
      // Missing versions come from the old base-bank client. Never silently
      // attach an earlier event to whichever release happens to be current now.
      const assessment = isQuizPage && version !== base.contentVersion
        ? releases.find(release => release.module === raw.module && release.contentVersion === version)
        : version === base.contentVersion ? base : undefined;
      if (!assessment) throw new Error("The activity refers to an unavailable knowledge check version.");
      const questions = assessment.questions;
      event.contentVersion = assessment.contentVersion;
      if (raw.kind === "quiz_submit" && !isQuizPage) throw new Error("Invalid quiz page.");
      if (raw.kind !== "quiz_submit") {
        const question = questions.find(q => q.id === raw.questionId);
        if (!question) throw new Error("Unknown question.");
        if (raw.path !== `/learn/module-${raw.module}/quiz` && raw.path !== `/learn/module-${raw.module}/lessons/${question.lessonSlug}`) throw new Error("Invalid question page.");
        event.questionId = question.id;
        if (raw.kind === "question_answer") {
          if (!Array.isArray(raw.selectedOptions) || !raw.selectedOptions.length || new Set(raw.selectedOptions).size !== raw.selectedOptions.length ||
            raw.selectedOptions.some((id: unknown) => typeof id !== "string" || !question.options.some(o => o.id === id)) || (question.kind === "single" && raw.selectedOptions.length !== 1)) throw new Error("Invalid answer selection.");
          event.selectedOptions = raw.selectedOptions;
          event.correct = isQuestionCorrect(question, raw.selectedOptions);
        }
      }
    }
    return event;
  });
}
