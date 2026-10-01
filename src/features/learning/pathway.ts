import type { AssistantSpec, DemoState, QuizAttempt } from "@/features/demo/demo-state";
import { moduleOneLessons } from "./catalog";
import { moduleTwoLessons } from "./module-two-content";
import { moduleThreeLessons } from "./module-three-content";
import { moduleFourLessons } from "./module-four-content";
import { sourcePortfolioReady } from "./source-studio";
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
  const isChallenge = (caseId?: string) => staffroomChallenges.some((challenge) => challenge.id === caseId);
  const reviewed = (test: AssistantSpec["tests"][number]) => isChallenge(test.caseId) && Boolean(test.verdict) &&
    [test.input, test.output, test.review, test.expected ?? ""].every((value) => value.trim().length >= 3);
  const firstVersion = assistant.tests.filter((test) => (test.version ?? 1) === 1 && reviewed(test));
  const problem = firstVersion.find((test) => isChallenge(test.caseId) && (test.verdict === "partial" || test.verdict === "fail"));
  const hasPassingRetest = (test: AssistantSpec["tests"][number]) => assistant.tests.some((later) =>
    (later.version ?? 1) >= 2 && later.caseId === test.caseId && later.verdict === "pass" &&
    reviewed(later) && later.input.trim() === test.input.trim() &&
    typeof test.sourcePack === "string" && typeof test.classContextCard === "string" &&
    later.sourcePack === test.sourcePack && later.classContextCard === test.classContextCard &&
    (later.evidenceMode === "prepared") === (test.evidenceMode === "prepared"),
  );
  const priorPassingRetests = firstVersion.filter((test) => isChallenge(test.caseId) && test.verdict === "pass" && hasPassingRetest(test));
  const allInitialCasesPass = staffroomChallenges.every((challenge) =>
    firstVersion.some((test) => test.caseId === challenge.id && test.verdict === "pass"));
  const retestsReady = assistant.improvementApproach === "strengthen"
    ? !problem && allInitialCasesPass && new Set(priorPassingRetests.map((test) => test.caseId)).size >= 3
    : Boolean(problem && hasPassingRetest(problem)) && new Set(priorPassingRetests.map((test) => test.caseId)).size >= 2;
  return assistant.weakness.trim().length >= 3 && assistant.revision.trim().length >= 3 &&
    staffroomChallenges.every((challenge) => firstVersion.some((test) => test.caseId === challenge.id)) &&
    new Set(firstVersion.map((test) => test.input.trim().toLowerCase())).size >= 2 &&
    (assistant.version ?? 1) >= 2 && retestsReady;
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
  const fourLessons = completedCount(state.moduleFourCompletedLessonIds, moduleFourLessons.map((lesson) => lesson.id));
  const onePassed = oneLessons === moduleOneLessons.length && hasPassed(state.quizAttempts);
  const twoPassed = twoLessons === moduleTwoLessons.length && state.craftPracticeCount >= 2 && promptLibraryReady(state.promptLibrary) && hasPassed(state.moduleTwoQuizAttempts);
  const assistantReady = state.assistants.some(assistantHasEvidence);
  const threePassed = threeLessons === moduleThreeLessons.length && assistantReady && hasPassed(state.moduleThreeQuizAttempts);
  const sourceReady = sourcePortfolioReady(state.sourcePortfolio);
  const fourPassed = fourLessons === moduleFourLessons.length && sourceReady && hasPassed(state.moduleFourQuizAttempts);
  const courseComplete = onePassed && twoPassed && threePassed && fourPassed;
  const completedModules = Number(onePassed) + Number(twoPassed) + Number(threePassed) + Number(fourPassed);
  const totalActivities = moduleOneLessons.length + moduleTwoLessons.length + moduleThreeLessons.length + moduleFourLessons.length + 4;
  const completeActivities = oneLessons + twoLessons + threeLessons + fourLessons + Number(onePassed) + Number(twoPassed) + Number(threePassed) + Number(fourPassed);

  return {
    oneLessons, twoLessons, threeLessons, fourLessons,
    onePassed, twoPassed, threePassed, fourPassed, assistantReady, sourceReady, courseComplete, completedModules,
    coursePercent: Math.round((completeActivities / totalActivities) * 100),
  };
}
