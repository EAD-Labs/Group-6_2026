import type { QuizQuestion } from "./catalog";

export type QuizEvaluation = {
  correctAnswers: number;
  correctQuestionIds: string[];
  missedQuestionIds: string[];
  passed: boolean;
  scorePercent: number;
  totalQuestions: number;
};

function normalizedSelection(selection: string[]) {
  return [...new Set(selection)].sort();
}

export function isQuestionCorrect(question: QuizQuestion, selection: string[]) {
  const actual = normalizedSelection(selection);
  const expected = normalizedSelection(question.correctOptionIds);
  return actual.length === expected.length && actual.every((option, index) => option === expected[index]);
}

export function evaluateQuiz(
  questions: QuizQuestion[],
  answers: Record<string, string[]>,
  passThresholdPercent = 70,
): QuizEvaluation {
  const correctQuestionIds = questions
    .filter((question) => isQuestionCorrect(question, answers[question.id] ?? []))
    .map((question) => question.id);
  const correctAnswers = correctQuestionIds.length;
  const scorePercent = questions.length
    ? Math.round((correctAnswers / questions.length) * 100)
    : 0;

  return {
    correctAnswers,
    correctQuestionIds,
    missedQuestionIds: questions
      .filter((question) => !correctQuestionIds.includes(question.id))
      .map((question) => question.id),
    passed: scorePercent >= passThresholdPercent,
    scorePercent,
    totalQuestions: questions.length,
  };
}
