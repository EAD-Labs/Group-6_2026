import { buildPracticeDraft, emptySourcePortfolio, sourceCases, sourceReviewChecks, type SourcePortfolio } from "@/features/learning/source-studio";

export function readyPortfolio(caseId = sourceCases[0].id): SourcePortfolio {
  const selected = sourceCases.find((item) => item.id === caseId)!;
  return {
    ...emptySourcePortfolio, caseId, objective: selected.objective, audience: selected.audience,
    sourceLabel: "Original fictional classroom practice pack", sourcePermission: "original", sourceSafe: true,
    draft: buildPracticeDraft(caseId, "worksheet"), revisionNote: "I corrected the unsupported statement and added a written response option while preserving the source qualification.",
    audits: Object.fromEntries(selected.claims.map((claim) => [claim.id, { verdict: claim.verdict,
      references: claim.references, note: "I compared the exact meaning with the selected passage and retained the source boundary." }])),
    reviewChecks: sourceReviewChecks.map((check) => check.id),
    reflection: "I used a clear learning goal, checked the evidence and revised a misleading draft. Next I will test a new comprehension task and ask a colleague to review the language.",
  };
}
