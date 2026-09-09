export const demoStorageKey = "promptshala:presentation-state:v1";

export type TeachingLevel = "Classes 5–7" | "Classes 8–10" | "Both";
export type AiFamiliarity = "New to AI" | "Tried it a few times" | "Use it sometimes";

export type QuizAttempt = {
  answers: Record<string, string[]>;
  attemptedAt: string;
  correctAnswers: number;
  passed: boolean;
  scorePercent: number;
};

export type DemoState = {
  aiFamiliarity: AiFamiliarity;
  captionsEnabled: boolean;
  completedLessonSlugs: string[];
  displayName: string;
  goals: string[];
  institution: string;
  largerText: boolean;
  onboardingCompleted: boolean;
  primarySubject: string;
  quizAttempts: QuizAttempt[];
  reducedMotion: boolean;
  reflection: string;
  safeUseAccepted: boolean;
  teachingLevel: TeachingLevel;
  yearsTeaching: string;
};

export const initialDemoState: DemoState = {
  aiFamiliarity: "New to AI",
  captionsEnabled: true,
  completedLessonSlugs: [],
  displayName: "Meera",
  goals: [],
  institution: "",
  largerText: false,
  onboardingCompleted: false,
  primarySubject: "Science",
  quizAttempts: [],
  reducedMotion: false,
  reflection: "",
  safeUseAccepted: false,
  teachingLevel: "Classes 5–7",
  yearsTeaching: "8",
};

export function loadDemoState(storage: Pick<Storage, "getItem">): DemoState {
  const storedValue = storage.getItem(demoStorageKey);

  if (!storedValue) {
    return initialDemoState;
  }

  try {
    const parsedValue = JSON.parse(storedValue) as Partial<DemoState>;
    return { ...initialDemoState, ...parsedValue };
  } catch {
    return initialDemoState;
  }
}

export function saveDemoState(
  storage: Pick<Storage, "setItem">,
  state: DemoState,
) {
  storage.setItem(demoStorageKey, JSON.stringify(state));
}

export function getBestQuizScore(attempts: QuizAttempt[]) {
  return attempts.reduce(
    (bestScore, attempt) => Math.max(bestScore, attempt.scorePercent),
    0,
  );
}

export function hasPassedModuleOne(attempts: QuizAttempt[]) {
  return attempts.some((attempt) => attempt.passed);
}
