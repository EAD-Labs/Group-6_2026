import {
  initialDemoState,
  type AiFamiliarity,
  type AssistantSpec,
  type AssistantPassportSnapshot,
  type AssistantTest,
  type DemoState,
  type QuizAttempt,
  type PromptTemplate,
  type TeachingLevel,
} from "./demo-state";
import { moduleTwoLessons } from "@/features/learning/module-two-content";
import { moduleFourLessons } from "@/features/learning/module-four-content";
import { sanitizeSourcePortfolio } from "@/features/learning/source-studio";
import { moduleThreeLessons } from "@/features/learning/module-three-content";

const templateCategories = ["planning", "assessment", "adaptation"] as const;

function cleanPromptLibrary(value: unknown): PromptTemplate[] {
  if (!Array.isArray(value)) return [];
  return templateCategories.flatMap((category) => {
    const raw = value.find((item) => item && typeof item === "object" && item.category === category) as Partial<PromptTemplate> | undefined;
    return raw ? [{ category, template: cleanString(raw.template, "", 2500),
      completedExample: cleanString(raw.completedExample, "", 2500),
      reviewBasis: raw.reviewBasis === "observed" || raw.reviewBasis === "guided" ? raw.reviewBasis : undefined,
      knownFailure: cleanString(raw.knownFailure, "", 1200),
      reviewChecklist: cleanString(raw.reviewChecklist, "", 1200),
      transferNote: cleanString(raw.transferNote, "", 1200) }] : [];
  });
}

const allowedTeachingLevels: TeachingLevel[] = [
  "Classes 5–7",
  "Classes 8–10",
  "Both",
];
const allowedAiFamiliarity: AiFamiliarity[] = [
  "New to AI",
  "Tried it a few times",
  "Use it sometimes",
];
const allowedLessonSlugs = [
  "meet-generative-ai",
  "useful-teacher-tasks",
  "review-before-use",
  "verify-ai-claims",
  "choose-the-right-tool",
  "responsible-use-challenge",
];

function cleanString(value: unknown, fallback: string, maxLength: number) {
  return typeof value === "string"
    ? value.trim().slice(0, maxLength)
    : fallback;
}

function cleanQuizAttempts(value: unknown): QuizAttempt[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item): QuizAttempt | null => {
      if (!item || typeof item !== "object") {
        return null;
      }

      const attempt = item as Partial<QuizAttempt>;
      const scorePercent = Math.max(
        0,
        Math.min(100, Math.round(Number(attempt.scorePercent) || 0)),
      );

      return {
        id: cleanString(attempt.id, "", 100) || undefined,
        contentVersion: cleanString(attempt.contentVersion, "", 80) || undefined,
        verifiedAt: cleanString(attempt.verifiedAt, "", 40) || undefined,
        answers:
          attempt.answers && typeof attempt.answers === "object"
            ? attempt.answers
            : {},
        attemptedAt:
          typeof attempt.attemptedAt === "string"
            ? attempt.attemptedAt
            : new Date().toISOString(),
        correctAnswers: Math.max(
          0,
          Math.min(10, Math.round(Number(attempt.correctAnswers) || 0)),
        ),
        passed: scorePercent >= 70,
        scorePercent,
      };
    })
    .filter((attempt): attempt is QuizAttempt => Boolean(attempt));
}

function cleanLessonIds(value: unknown, allowed: string[]) {
  return Array.isArray(value)
    ? [...new Set(value.filter((id): id is string => typeof id === "string" && allowed.includes(id)))]
    : [];
}

function cleanPassportSnapshot(value: unknown): AssistantPassportSnapshot | undefined {
  if (!value || typeof value !== "object" || Array.isArray(value)) return undefined;
  const raw = value as Partial<AssistantPassportSnapshot>;
  const optional = (key: keyof AssistantPassportSnapshot) => typeof raw[key] === "string" ? cleanString(raw[key], "", 2500) : undefined;
  return {
    name: cleanString(raw.name, "", 100), purpose: cleanString(raw.purpose, "", 2000),
    persona: cleanString(raw.persona, "", 2000), task: cleanString(raw.task, "", 2000),
    context: cleanString(raw.context, "", 2000), format: cleanString(raw.format, "", 2000),
    boundaries: cleanString(raw.boundaries, "", 2000), reviewChecks: cleanString(raw.reviewChecks, "", 2000),
    creatorCredit: optional("creatorCredit"), optionalInputs: optional("optionalInputs"),
    toolsPermitted: optional("toolsPermitted"), clarificationRule: optional("clarificationRule"),
    stopRule: optional("stopRule"), sharingScope: optional("sharingScope"),
  };
}

function cleanAssistantVersions(value: unknown): NonNullable<AssistantSpec["versions"]> {
  if (!Array.isArray(value)) return [];
  const versions = new Map<number, NonNullable<AssistantSpec["versions"]>[number]>();
  for (const entry of value) {
    if (!entry || typeof entry !== "object") continue;
    const version = cleanAssistantVersion(entry.version);
    if (!versions.has(version)) versions.set(version, {
      version, at: cleanString(entry.at, "", 40), note: cleanString(entry.note, "", 500),
      snapshot: cleanPassportSnapshot(entry.snapshot),
    });
  }
  return [...versions.values()];
}

function cleanAssistantVersion(value: unknown) {
  const version = Number(value);
  return Number.isSafeInteger(version) && version > 0 ? version : 1;
}

function cleanAssistantTests(value: unknown): AssistantTest[] {
  if (!Array.isArray(value)) return [];
  const tests = new Map<string, AssistantTest>();
  // The request is byte-bounded by the API. Do not truncate saved history on
  // subsequent loads: old reviewed cases are still evidence for their version.
  for (const item of value) {
    if (!item || typeof item !== "object") continue;
    const test = item as Partial<AssistantTest>;
    const id = cleanString(test.id, "", 100);
    if (!id || tests.has(id)) continue;
    tests.set(id, {
      id, evidenceMode: ["live", "external", "prepared"].includes(String(test.evidenceMode)) ? test.evidenceMode : undefined,
      sourcePack: typeof test.sourcePack === "string" ? cleanString(test.sourcePack, "", 2500) : undefined,
      classContextCard: typeof test.classContextCard === "string" ? cleanString(test.classContextCard, "", 2500) : undefined,
      caseId: cleanString(test.caseId, "", 10), expected: cleanString(test.expected, "", 1200),
      verdict: ["pass", "partial", "fail"].includes(String(test.verdict)) ? test.verdict : undefined,
      version: cleanAssistantVersion(test.version),
      input: cleanString(test.input, "", 2500), output: cleanString(test.output, "", 6000),
      review: cleanString(test.review, "", 2500), createdAt: cleanString(test.createdAt, "", 40),
    });
  }
  return [...tests.values()];
}

function cleanAssistants(value: unknown): AssistantSpec[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((item): AssistantSpec[] => {
    if (!item || typeof item !== "object") return [];
    const raw = item as Partial<AssistantSpec>;
    if (typeof raw.id !== "string" || !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(raw.id)) return [];
    const field = (key: keyof AssistantSpec) => cleanString(raw[key], "", 2500);
    return [{
      id: raw.id,
      improvementApproach: raw.improvementApproach === "strengthen" ? "strengthen" : "repair",
      version: cleanAssistantVersion(raw.version),
      versions: cleanAssistantVersions(raw.versions),
      creatorCredit: field("creatorCredit"), sourcePack: field("sourcePack"),
      classContextCard: field("classContextCard"),
      optionalInputs: field("optionalInputs"), toolsPermitted: field("toolsPermitted"),
      clarificationRule: field("clarificationRule"), stopRule: field("stopRule"),
      sharingScope: field("sharingScope"), handoffNotes: field("handoffNotes"),
      reuseDiary: field("reuseDiary"), rehearsalTranscript: field("rehearsalTranscript"),
      revisedQuestion: field("revisedQuestion"),
      name: cleanString(raw.name, "", 100), purpose: field("purpose"), persona: field("persona"),
      task: field("task"), context: field("context"), format: field("format"),
      boundaries: field("boundaries"), reviewChecks: field("reviewChecks"),
      weakness: field("weakness"), revision: field("revision"),
      tests: cleanAssistantTests(raw.tests),
      updatedAt: typeof raw.updatedAt === "string" && Number.isFinite(Date.parse(raw.updatedAt)) ? new Date(raw.updatedAt).toISOString() : new Date().toISOString(),
      deletedAt: typeof raw.deletedAt === "string" && Number.isFinite(Date.parse(raw.deletedAt)) ? new Date(raw.deletedAt).toISOString() : undefined,
    }];
  });
}

export function sanitizeDemoState(value: unknown): DemoState {
  const input =
    value && typeof value === "object"
      ? (value as Partial<DemoState>)
      : initialDemoState;
  const teachingLevel = allowedTeachingLevels.includes(
    input.teachingLevel as TeachingLevel,
  )
    ? (input.teachingLevel as TeachingLevel)
    : initialDemoState.teachingLevel;
  const aiFamiliarity = allowedAiFamiliarity.includes(
    input.aiFamiliarity as AiFamiliarity,
  )
    ? (input.aiFamiliarity as AiFamiliarity)
    : initialDemoState.aiFamiliarity;

  return {
    assistants: cleanAssistants(input.assistants),
    craftPracticeCount: Math.max(0, Math.min(1000, Math.floor(Number(input.craftPracticeCount) || 0))),
    promptLibrary: cleanPromptLibrary(input.promptLibrary),
    lessonEvidence: input.lessonEvidence && typeof input.lessonEvidence === "object"
      ? Object.fromEntries(Object.entries(input.lessonEvidence)
        .filter(([id, value]) => [...moduleTwoLessons.map((lesson) => lesson.id), ...moduleThreeLessons.map((lesson) => lesson.id), ...moduleFourLessons.map((lesson) => lesson.id)].includes(id) && typeof value === "string")
        .map(([id, value]) => [id, cleanString(value, "", 1200)])) : {},
    aiFamiliarity,
    captionsEnabled: input.captionsEnabled !== false,
    completedLessonSlugs: Array.isArray(input.completedLessonSlugs)
      ? input.completedLessonSlugs.filter(
          (slug): slug is string =>
            typeof slug === "string" && allowedLessonSlugs.includes(slug),
        )
      : [],
    moduleTwoCompletedLessonIds: cleanLessonIds(input.moduleTwoCompletedLessonIds, moduleTwoLessons.map((lesson) => lesson.id)),
    moduleThreeCompletedLessonIds: cleanLessonIds(input.moduleThreeCompletedLessonIds, moduleThreeLessons.map((lesson) => lesson.id)),
    moduleFourCompletedLessonIds: cleanLessonIds(input.moduleFourCompletedLessonIds, moduleFourLessons.map((lesson) => lesson.id)),
    sourcePortfolio: sanitizeSourcePortfolio(input.sourcePortfolio),
    displayName: cleanString(input.displayName, "Participant", 120) || "Participant",
    goals: Array.isArray(input.goals)
      ? input.goals
          .filter((goal): goal is string => typeof goal === "string")
          .map((goal) => goal.trim().slice(0, 120))
          .filter(Boolean)
          .slice(0, 8)
      : [],
    institution: cleanString(input.institution, "", 160),
    largerText: Boolean(input.largerText),
    onboardingCompleted: Boolean(input.onboardingCompleted),
    primarySubject: cleanString(input.primarySubject, "General", 80),
    quizAttempts: cleanQuizAttempts(input.quizAttempts),
    moduleTwoQuizAttempts: cleanQuizAttempts(input.moduleTwoQuizAttempts),
    moduleThreeQuizAttempts: cleanQuizAttempts(input.moduleThreeQuizAttempts),
    moduleFourQuizAttempts: cleanQuizAttempts(input.moduleFourQuizAttempts),
    reducedMotion: Boolean(input.reducedMotion),
    reflection: cleanString(input.reflection, "", 500),
    safeUseAccepted: Boolean(input.safeUseAccepted),
    teachingLevel,
    yearsTeaching: String(Math.max(0, Math.min(70, Math.floor(Number(input.yearsTeaching) || 0)))),
  };
}
