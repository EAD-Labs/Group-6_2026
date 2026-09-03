import type {
  ModuleProgressInput,
  ModuleStatus,
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

  const scorePercent = Math.round((correctAnswers / totalQuestions) * 100);

  return {
    correctAnswers,
    passed: scorePercent >= passThresholdPercent,
    scorePercent,
    totalQuestions,
  };
}

export function deriveModuleStatus({
  passedAt,
  previousModulePassed,
  startedAt,
}: ModuleProgressInput): ModuleStatus {
  if (passedAt) {
    return "passed";
  }

  if (!previousModulePassed) {
    return "locked";
  }

  return startedAt ? "in_progress" : "available";
}

export function canStartQuiz(requiredLessons: number, completedLessons: number) {
  return requiredLessons > 0 && completedLessons >= requiredLessons;
}

export function canUnlockNextModule(currentModulePassed: boolean) {
  return currentModulePassed;
}

export function getNextAttemptNumber(previousAttemptCount: number) {
  if (!Number.isInteger(previousAttemptCount) || previousAttemptCount < 0) {
    throw new RangeError("Previous attempt count must be a non-negative integer.");
  }

  return previousAttemptCount + 1;
}
