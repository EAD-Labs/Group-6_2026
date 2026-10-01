import type { DemoState } from "@/features/demo/demo-state";
import { learningModules, moduleOneLessons } from "@/features/learning/catalog";
import { moduleTwoLessons } from "@/features/learning/module-two-content";
import { moduleThreeLessons } from "@/features/learning/module-three-content";
import { moduleFourLessons } from "@/features/learning/module-four-content";
import { assistantHasEvidence, assistantHasPassport, assistantHasRepairEvidence, getPathwayStatus, hasPassed } from "@/features/learning/pathway";
import { promptLibraryCategories } from "@/features/learning/prompt-library";
import { sourceAuditCount, sourceReviewChecks } from "@/features/learning/source-studio";

export type LearningRequirement = { label: string; complete: boolean; href: string };
export function getLearningPlan(state: DemoState) {
  const status = getPathwayStatus(state);
  const lessons = [moduleOneLessons.map((lesson) => ({ ...lesson, id: lesson.slug })), moduleTwoLessons, moduleThreeLessons, moduleFourLessons];
  const completed = [state.completedLessonSlugs, state.moduleTwoCompletedLessonIds, state.moduleThreeCompletedLessonIds, state.moduleFourCompletedLessonIds];
  const attempts = [state.quizAttempts, state.moduleTwoQuizAttempts, state.moduleThreeQuizAttempts, state.moduleFourQuizAttempts];
  const passed = [status.onePassed, status.twoPassed, status.threePassed, status.fourPassed];
  return learningModules.map((module, index) => {
    const path = `/learn/${module.slug}`;
    const done = lessons[index].filter((lesson) => completed[index].includes(lesson.id)).length;
    const nextLesson = lessons[index].find((lesson) => !completed[index].includes(lesson.id));
    const requirements: LearningRequirement[] = [{ label: `${done}/${lessons[index].length} lessons complete`, complete: !nextLesson, href: nextLesson ? `${path}/lessons/${nextLesson.id}` : path }];
    if (index === 1) {
      requirements.push({ label: `${Math.min(state.craftPracticeCount, 2)}/2 prompt evaluations recorded`, complete: state.craftPracticeCount >= 2, href: `${path}/practice` });
      for (const category of promptLibraryCategories) {
        const template = state.promptLibrary.find((item) => item.category === category.id);
        const ready = Boolean(template && template.reviewBasis && [template.template, template.completedExample, template.knownFailure, template.reviewChecklist, template.transferNote].every((value) => value.trim().length >= 20));
        requirements.push({ label: `${category.label} template, example and review record`, complete: ready, href: `${path}/lessons/teaching-prompt-library` });
      }
    }
    if (index === 2) {
      // All evidence must belong to one assistant. Prefer the finished one, then the furthest along.
      const assistant = state.assistants.find(assistantHasEvidence) ?? state.assistants.filter((item) => !item.deletedAt).sort((a, b) => b.tests.length - a.tests.length)[0];
      const groups: [string, boolean][] = [
        ["A complete Agent Passport", Boolean(assistant && assistantHasPassport(assistant))],
        ["Six initial cases and a versioned improvement with three retests", Boolean(assistant && assistantHasRepairEvidence(assistant))],
        ["Class context and approved source pack", Boolean(assistant?.classContextCard?.trim() && assistant?.sourcePack?.trim())],
        ["Synthetic rehearsal and a revised question", Boolean(assistant?.rehearsalTranscript?.trim() && assistant?.revisedQuestion?.trim())],
        ["Workflow handoff and reuse diary", Boolean(assistant?.handoffNotes?.trim() && assistant?.reuseDiary?.trim())],
      ];
      requirements.push(...groups.map(([label, complete]) => ({ label, complete, href: `${path}/staffroom` })));
    }
    if (index === 3) {
      const portfolio = state.sourcePortfolio;
      const groups: [string, boolean][] = [
        ["Objective, audience and permitted source record", portfolio.objective.trim().length >= 20 && portfolio.audience.trim().length >= 3 && portfolio.sourceLabel.trim().length >= 3 && Boolean(portfolio.sourcePermission) && portfolio.sourceSafe],
        [`${sourceAuditCount(portfolio)}/3 passage-linked claim audits`, sourceAuditCount(portfolio) === 3],
        ["Classroom draft and explanation of your revision", portfolio.draft.trim().length >= 100 && portfolio.revisionNote.trim().length >= 40],
        [`${portfolio.reviewChecks.length}/6 teacher review checks`, sourceReviewChecks.every((check) => portfolio.reviewChecks.includes(check.id))],
        ["Course reflection and next classroom use", portfolio.reflection.trim().length >= 60],
      ];
      requirements.push(...groups.map(([label, complete]) => ({ label, complete, href: `${path}/studio` })));
    }
    const best = Math.max(0, ...attempts[index].map((attempt) => attempt.scorePercent));
    requirements.push({ label: attempts[index].length ? `Knowledge check: best ${best}% · 70% required` : "Pass the knowledge check with at least 70%", complete: hasPassed(attempts[index]), href: `${path}/quiz` });
    return { ...module, lessons: lessons[index], completed: done, attempts: attempts[index], requirements, passed: passed[index], percent: Math.round((done + Number(passed[index])) / (lessons[index].length + 1) * 100), next: requirements.find((item) => !item.complete) ?? { label: "Review module", href: path, complete: true } };
  });
}
