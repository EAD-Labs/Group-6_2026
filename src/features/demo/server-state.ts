import {
  initialDemoState,
  type AiFamiliarity,
  type AssistantSpec,
  type DemoState,
  type QuizAttempt,
  type PromptTemplate,
  type TeachingLevel,
} from "./demo-state";
import { moduleTwoLessons } from "@/features/learning/module-two-content";
import { moduleThreeLessons } from "@/features/learning/module-three-content";

const templateCategories = ["planning", "assessment", "adaptation"] as const;

function cleanPromptLibrary(value: unknown): PromptTemplate[] {
  if (!Array.isArray(value)) return [];
  return templateCategories.flatMap((category) => {
    const raw = value.find((item) => item && typeof item === "object" && item.category === category) as Partial<PromptTemplate> | undefined;
    return raw ? [{ category, template: cleanString(raw.template, "", 2500),
      completedExample: cleanString(raw.completedExample, "", 2500),
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
    .filter((attempt): attempt is QuizAttempt => Boolean(attempt))
    .slice(0, 20);
}

function cleanLessonIds(value: unknown, allowed: string[]) {
  return Array.isArray(value)
    ? [...new Set(value.filter((id): id is string => typeof id === "string" && allowed.includes(id)))]
    : [];
}

function cleanAssistants(value: unknown): AssistantSpec[] {
  if (!Array.isArray(value)) return [];
  return value.slice(0, 20).flatMap((item): AssistantSpec[] => {
    if (!item || typeof item !== "object") return [];
    const raw = item as Partial<AssistantSpec>;
    if (typeof raw.id !== "string" || !/^[0-9a-f-]{36}$/i.test(raw.id)) return [];
    const field = (key: keyof AssistantSpec) => cleanString(raw[key], "", 2500);
    return [{
      id: raw.id,
      version: Math.max(1, Math.min(100, Math.floor(Number(raw.version) || 1))),
      versions: Array.isArray(raw.versions) ? raw.versions.slice(0, 30).flatMap((entry) =>
        entry && typeof entry === "object" ? [{
          version: Math.max(1, Math.min(100, Math.floor(Number(entry.version) || 1))),
          at: cleanString(entry.at, "", 40), note: cleanString(entry.note, "", 500),
        }] : [],
      ) : [],
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
      tests: Array.isArray(raw.tests) ? raw.tests.slice(0, 24).flatMap((test) =>
        test && typeof test === "object" ? [{
          id: cleanString(test.id, "", 100),
          caseId: cleanString(test.caseId, "", 10),
          expected: cleanString(test.expected, "", 1200),
          verdict: ["pass", "partial", "fail"].includes(String(test.verdict)) ? test.verdict : undefined,
          version: Math.max(1, Math.min(100, Math.floor(Number(test.version) || 1))),
          input: cleanString(test.input, "", 2500), output: cleanString(test.output, "", 6000),
          review: cleanString(test.review, "", 2500), createdAt: cleanString(test.createdAt, "", 40),
        }] : [],
      ) : [],
      updatedAt: cleanString(raw.updatedAt, new Date().toISOString(), 40),
      deletedAt: raw.deletedAt ? cleanString(raw.deletedAt, "", 40) : undefined,
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
        .filter(([id, value]) => [...moduleTwoLessons.map((lesson) => lesson.id), ...moduleThreeLessons.map((lesson) => lesson.id)].includes(id) && typeof value === "string")
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
    displayName: cleanString(input.displayName, "Participant", 120),
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
    reducedMotion: Boolean(input.reducedMotion),
    reflection: cleanString(input.reflection, "", 500),
    safeUseAccepted: Boolean(input.safeUseAccepted),
    teachingLevel,
    yearsTeaching: cleanString(input.yearsTeaching, "0", 2),
  };
}
