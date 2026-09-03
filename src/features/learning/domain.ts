export const moduleStatuses = [
  "locked",
  "available",
  "in_progress",
  "passed",
] as const;

export type ModuleStatus = (typeof moduleStatuses)[number];

export type ModuleProgressInput = {
  previousModulePassed: boolean;
  startedAt: string | null;
  passedAt: string | null;
};

export type QuizResult = {
  correctAnswers: number;
  passed: boolean;
  scorePercent: number;
  totalQuestions: number;
};

export type PersistedModuleProgress = {
  bestScorePercent: number | null;
  passedAt: string | null;
  status: ModuleStatus;
};

export type LearningModule = {
  description: string;
  estimatedMinutes: number;
  id: string;
  position: number;
  slug: string;
  title: string;
};

export type Lesson = {
  id: string;
  moduleId: string;
  position: number;
  slug: string;
  title: string;
};
