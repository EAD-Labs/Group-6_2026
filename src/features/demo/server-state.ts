import {
  initialDemoState,
  type AiFamiliarity,
  type DemoState,
  type QuizAttempt,
  type TeachingLevel,
} from "./demo-state";

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
          Math.min(5, Math.round(Number(attempt.correctAnswers) || 0)),
        ),
        passed: scorePercent >= 70,
        scorePercent,
      };
    })
    .filter((attempt): attempt is QuizAttempt => Boolean(attempt))
    .slice(0, 20);
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
    aiFamiliarity,
    captionsEnabled: input.captionsEnabled !== false,
    completedLessonSlugs: Array.isArray(input.completedLessonSlugs)
      ? input.completedLessonSlugs.filter(
          (slug): slug is string =>
            typeof slug === "string" && allowedLessonSlugs.includes(slug),
        )
      : [],
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
    reducedMotion: Boolean(input.reducedMotion),
    reflection: cleanString(input.reflection, "", 500),
    safeUseAccepted: Boolean(input.safeUseAccepted),
    teachingLevel,
    yearsTeaching: cleanString(input.yearsTeaching, "0", 2),
  };
}
