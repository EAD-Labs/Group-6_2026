import { emptySourcePortfolio, sanitizeSourcePortfolio, type SourcePortfolio } from "@/features/learning/source-studio";
import { emptyAiExperience, sanitizeAiExperience, type AiExperience } from "./ai-experience";

export const demoStorageKey = "promptshala:presentation-state:v1";

export type TeachingLevel = "Classes 5–7" | "Classes 8–10" | "Both";
export type AiFamiliarity = "New to AI" | "Tried it a few times" | "Use it sometimes" | "Use it regularly";

export type QuizAttempt = {
  id?: string;
  contentVersion?: string;
  verifiedAt?: string;
  answers: Record<string, string[]>;
  attemptedAt: string;
  correctAnswers: number;
  passed: boolean;
  scorePercent: number;
};

export type AssistantTest = {
  evidenceMode?: "live" | "external" | "prepared";
  sourcePack?: string;
  classContextCard?: string;
  id: string;
  caseId?: string;
  expected?: string;
  verdict?: "pass" | "partial" | "fail";
  version?: number;
  input: string;
  output: string;
  review: string;
  createdAt: string;
};

export type AssistantSpec = {
  improvementApproach?: "repair" | "strengthen";
  id: string;
  version?: number;
  versions?: { version: number; at: string; note: string; snapshot?: AssistantPassportSnapshot }[];
  creatorCredit?: string;
  sourcePack?: string;
  classContextCard?: string;
  optionalInputs?: string;
  toolsPermitted?: string;
  clarificationRule?: string;
  stopRule?: string;
  sharingScope?: string;
  handoffNotes?: string;
  reuseDiary?: string;
  rehearsalTranscript?: string;
  revisedQuestion?: string;
  name: string;
  purpose: string;
  persona: string;
  task: string;
  context: string;
  format: string;
  boundaries: string;
  reviewChecks: string;
  weakness: string;
  revision: string;
  tests: AssistantTest[];
  updatedAt: string;
  deletedAt?: string;
};

export type AssistantPassportSnapshot = Pick<AssistantSpec,
  "name" | "purpose" | "persona" | "task" | "context" | "format" | "boundaries" | "reviewChecks" |
  "creatorCredit" | "optionalInputs" | "toolsPermitted" | "clarificationRule" | "stopRule" | "sharingScope"
>;

export type PromptTemplate = {
  reviewBasis?: "observed" | "guided";
  category: "planning" | "assessment" | "adaptation";
  template: string;
  completedExample: string;
  knownFailure: string;
  reviewChecklist: string;
  transferNote: string;
};

export type DemoState = AiExperience & {
  assistants: AssistantSpec[];
  craftPracticeCount: number;
  promptLibrary: PromptTemplate[];
  aiFamiliarity: AiFamiliarity;
  captionsEnabled: boolean;
  completedLessonSlugs: string[];
  lessonEvidence: Record<string, string>;
  moduleTwoCompletedLessonIds: string[];
  moduleThreeCompletedLessonIds: string[];
  moduleFourCompletedLessonIds: string[];
  sourcePortfolio: SourcePortfolio;
  displayName: string;
  goals: string[];
  institution: string;
  largerText: boolean;
  onboardingCompleted: boolean;
  primarySubject: string;
  quizAttempts: QuizAttempt[];
  moduleTwoQuizAttempts: QuizAttempt[];
  moduleThreeQuizAttempts: QuizAttempt[];
  moduleFourQuizAttempts: QuizAttempt[];
  reducedMotion: boolean;
  reflection: string;
  safeUseAccepted: boolean;
  teachingLevel: TeachingLevel;
  yearsTeaching: string;
};

export const initialDemoState: DemoState = {
  ...emptyAiExperience,
  assistants: [],
  craftPracticeCount: 0,
  promptLibrary: [],
  aiFamiliarity: "New to AI",
  captionsEnabled: true,
  completedLessonSlugs: [],
  lessonEvidence: {},
  moduleTwoCompletedLessonIds: [],
  moduleThreeCompletedLessonIds: [],
  moduleFourCompletedLessonIds: [],
  sourcePortfolio: emptySourcePortfolio,
  displayName: "Meera",
  goals: [],
  institution: "",
  largerText: false,
  onboardingCompleted: false,
  primarySubject: "Science",
  quizAttempts: [],
  moduleTwoQuizAttempts: [],
  moduleThreeQuizAttempts: [],
  moduleFourQuizAttempts: [],
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
    return {
      ...initialDemoState,
      ...parsedValue,
      ...sanitizeAiExperience(parsedValue),
      assistants: Array.isArray(parsedValue.assistants) ? parsedValue.assistants : [],
      craftPracticeCount: Math.max(0, Math.min(1000, Number(parsedValue.craftPracticeCount) || 0)),
      promptLibrary: Array.isArray(parsedValue.promptLibrary) ? parsedValue.promptLibrary : [],
      lessonEvidence: parsedValue.lessonEvidence && typeof parsedValue.lessonEvidence === "object" ? parsedValue.lessonEvidence : {},
      moduleTwoCompletedLessonIds: Array.isArray(parsedValue.moduleTwoCompletedLessonIds) ? parsedValue.moduleTwoCompletedLessonIds : [],
      moduleThreeCompletedLessonIds: Array.isArray(parsedValue.moduleThreeCompletedLessonIds) ? parsedValue.moduleThreeCompletedLessonIds : [],
      moduleTwoQuizAttempts: Array.isArray(parsedValue.moduleTwoQuizAttempts) ? parsedValue.moduleTwoQuizAttempts : [],
      moduleThreeQuizAttempts: Array.isArray(parsedValue.moduleThreeQuizAttempts) ? parsedValue.moduleThreeQuizAttempts : [],
      moduleFourQuizAttempts: Array.isArray(parsedValue.moduleFourQuizAttempts) ? parsedValue.moduleFourQuizAttempts : [],
      moduleFourCompletedLessonIds: Array.isArray(parsedValue.moduleFourCompletedLessonIds) ? parsedValue.moduleFourCompletedLessonIds : [],
      sourcePortfolio: sanitizeSourcePortfolio(parsedValue.sourcePortfolio),
    };
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
