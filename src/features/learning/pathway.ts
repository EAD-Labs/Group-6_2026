import type { AssistantSpec, DemoState, QuizAttempt } from "@/features/demo/demo-state";
import { moduleOneLessons } from "./catalog";
import { moduleTwoLessons } from "./module-two-content";
import { moduleThreeLessons } from "./module-three-content";
import { staffroomChallenges } from "./staffroom-challenges";
import { promptLibraryReady } from "./prompt-library";

export function hasPassed(attempts: QuizAttempt[]) {
  return attempts.some((attempt) => attempt.scorePercent >= 70);
}

export function completedCount(ids: string[], requiredIds: string[]) {
  return requiredIds.filter((id) => ids.includes(id)).length;
}

export function assistantHasPassport(assistant: AssistantSpec) {
  return !assistant.deletedAt &&
    [assistant.name, assistant.purpose, assistant.persona, assistant.task,
      assistant.context, assistant.format, assistant.boundaries, assistant.reviewChecks]
      .every((value) => value.trim().length >= 3);
}

export function assistantHasRepairEvidence(assistant: AssistantSpec) {
  const firstVersion = assistant.tests.filter((test) => (test.version ?? 1) === 1);
  const isChallenge = (caseId?: string) => staffroomChallenges.some((challenge) => challenge.id === caseId);
  const problem = firstVersion.find((test) => isChallenge(test.caseId) && (test.verdict === "partial" || test.verdict === "fail"));
  const hasPassingRetest = (test: AssistantSpec["tests"][number]) => assistant.tests.some((later) =>
    (later.version ?? 1) >= 2 && later.caseId === test.caseId && later.verdict === "pass" &&
    later.input.trim() === test.input.trim() && later.output.trim().length >= 3 &&
    later.review.trim().length >= 3,
  );
  const priorPassingRetests = firstVersion.filter((test) => isChallenge(test.caseId) && test.verdict === "pass" && hasPassingRetest(test));
  return assistant.weakness.trim().length >= 3 && assistant.revision.trim().length >= 3 &&
    staffroomChallenges.every((challenge) => assistant.tests.some((test) =>
      test.caseId === challenge.id && Boolean(test.verdict) &&
      test.input.trim().length >= 3 && test.output.trim().length >= 3 && test.review.trim().length >= 3,
    )) && new Set(assistant.tests.map((test) => test.input.trim().toLowerCase())).size >= 2 &&
    (assistant.version ?? 1) >= 2 && Boolean(problem && hasPassingRetest(problem)) &&
    new Set(priorPassingRetests.map((test) => test.caseId)).size >= 2;
}

export function assistantHasEvidence(assistant: AssistantSpec) {
  return assistantHasPassport(assistant) && assistantHasRepairEvidence(assistant) &&
    Boolean(assistant.classContextCard?.trim()) && Boolean(assistant.sourcePack?.trim()) &&
    Boolean(assistant.handoffNotes?.trim()) && Boolean(assistant.reuseDiary?.trim()) &&
    Boolean(assistant.rehearsalTranscript?.trim()) && Boolean(assistant.revisedQuestion?.trim());
}

export function getPathwayStatus(state: DemoState) {
  const oneLessons = completedCount(state.completedLessonSlugs, moduleOneLessons.map((lesson) => lesson.slug));
  const twoLessons = completedCount(state.moduleTwoCompletedLessonIds, moduleTwoLessons.map((lesson) => lesson.id));
  const threeLessons = completedCount(state.moduleThreeCompletedLessonIds, moduleThreeLessons.map((lesson) => lesson.id));
  const onePassed = oneLessons === moduleOneLessons.length && hasPassed(state.quizAttempts);
  const twoPassed = onePassed && twoLessons === moduleTwoLessons.length && state.craftPracticeCount >= 2 && promptLibraryReady(state.promptLibrary) && hasPassed(state.moduleTwoQuizAttempts);
  const assistantReady = state.assistants.some(assistantHasEvidence);
  const threePassed = twoPassed && threeLessons === moduleThreeLessons.length && assistantReady && hasPassed(state.moduleThreeQuizAttempts);
  const totalActivities = moduleOneLessons.length + moduleTwoLessons.length + moduleThreeLessons.length + 3;
  const completeActivities = oneLessons + twoLessons + threeLessons + Number(onePassed) + Number(twoPassed) + Number(threePassed);

  return {
    oneLessons, twoLessons, threeLessons,
    onePassed, twoPassed, threePassed, assistantReady,
    coursePercent: Math.round((completeActivities / totalActivities) * 75),
  };
}
