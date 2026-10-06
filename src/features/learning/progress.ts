import type {
  ModuleProgressInput,
  ModuleStatus,
  PersistedModuleProgress,
  QuizResult,
} from "./domain";

export const modulePassThresholdPercent = 70;

export function calculateQuizResult(
  correctAnswers: number,
  totalQuestions: number,
  passThresholdPercent = modulePassThresholdPercent,
): QuizResult {
  if (!Number.isInteger(correctAnswers) || correctAnswers < 0) {
    throw new RangeError("Correct answers must be a non-negative integer.");
  }

  if (!Number.isInteger(totalQuestions) || totalQuestions <= 0) {
    throw new RangeError("Total questions must be a positive integer.");
  }

  if (correctAnswers > totalQuestions) {
    throw new RangeError("Correct answers cannot exceed total questions.");
  }

  if (passThresholdPercent < 0 || passThresholdPercent > 100) {
    throw new RangeError("Pass threshold must be between 0 and 100.");
  }

  const scorePercent = Math.floor((correctAnswers / totalQuestions) * 100);

  return {
    correctAnswers,
    passed: scorePercent >= passThresholdPercent,
    scorePercent,
    totalQuestions,
  };
}

export function deriveModuleStatus({
  passedAt,
  startedAt,
}: ModuleProgressInput): ModuleStatus {
  if (passedAt) {
    return "passed";
  }

  return startedAt ? "in_progress" : "available";
}

export function canStartQuiz(requiredLessons?: number, completedLessons?: number) {
  void requiredLessons; void completedLessons;
  return true;
}

export function canUnlockNextModule(currentModulePassed?: boolean) {
  void currentModulePassed;
  return true;
}

export function getNextAttemptNumber(previousAttemptCount: number) {
  if (!Number.isInteger(previousAttemptCount) || previousAttemptCount < 0) {
    throw new RangeError("Previous attempt count must be a non-negative integer.");
  }

  return previousAttemptCount + 1;
}

export function applyQuizResultToProgress(
  currentProgress: PersistedModuleProgress,
  quizResult: QuizResult,
  submittedAt: string,
): PersistedModuleProgress {
  const bestScorePercent = Math.max(
    currentProgress.bestScorePercent ?? 0,
    quizResult.scorePercent,
  );
  const hasPassed = currentProgress.status === "passed" || quizResult.passed;

  return {
    bestScorePercent,
    passedAt:
      currentProgress.passedAt ?? (quizResult.passed ? submittedAt : null),
    status: hasPassed ? "passed" : "in_progress",
  };
}
