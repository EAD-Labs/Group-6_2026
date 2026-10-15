export type ReviewCriterion = { id: string; label: string; question: string; weight: number; critical: boolean };
export type TeachingRubric = { id: string; version: string; title: string; criteria: ReviewCriterion[] };
export type CriterionReview = { score: 0 | 1 | 2 | 3 | null; evidence: string };
export type ReviewRatings = Record<string, CriterionReview>;
export const reviewLevels = ["0 · Not yet supported", "1 · Needs a substantial change", "2 · Usable after a small change", "3 · Supported by clear evidence"];
export const teachingRubric: TeachingRubric = {
  id: "teaching-material-review", version: "1.0", title: "Classroom readiness review",
  criteria: [
    { id: "objective", label: "Learning purpose", question: "What will learners be able to do, and where does the activity practise it?", weight: 2, critical: false },
    { id: "evidence", label: "Facts and sources", question: "Which source supports each claim? Have you independently checked the answer key?", weight: 3, critical: true },
    { id: "learner-fit", label: "Right for these learners", question: "Is the language, difficulty and prior knowledge appropriate for this group?", weight: 2, critical: false },
    { id: "accessibility", label: "Everyone can take part", question: "Are instructions clear, and is there an alternative for learners who need one?", weight: 2, critical: false },
    { id: "safe-use", label: "Privacy and permission", question: "Does it avoid identifiable learner information, and do you have permission to use the material?", weight: 3, critical: true },
  ],
};

export function emptyRatings(rubric: TeachingRubric): ReviewRatings {
  return Object.fromEntries(rubric.criteria.map(c => [c.id, { score: null, evidence: "" }]));
}

export function validateRubric(value: unknown): TeachingRubric {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error("Choose a rubric JSON object.");
  const raw = value as Record<string, unknown>;
  const text = (value: unknown, max: number) => {
    if (typeof value !== "string" || value.trim().length < 3 || value.length > max) throw new Error("Rubric text is missing or too long.");
    return value.trim();
  };
  const id = text(raw.id, 80), version = text(raw.version, 40), title = text(raw.title, 120);
  if (!/^[a-z0-9-]+$/.test(id) || !/^[a-zA-Z0-9.-]+$/.test(version)) throw new Error("Use a simple rubric ID and version.");
  if (!Array.isArray(raw.criteria) || raw.criteria.length < 3 || raw.criteria.length > 10) throw new Error("A rubric needs 3–10 review criteria.");
  const criteria = raw.criteria.map((entry: unknown): ReviewCriterion => {
    if (!entry || typeof entry !== "object" || Array.isArray(entry)) throw new Error("Each criterion must be an object.");
    const c = entry as Record<string, unknown>, id = text(c.id, 80);
    if (!/^[a-z0-9-]+$/.test(id) || !Number.isInteger(c.weight) || Number(c.weight) < 1 || Number(c.weight) > 5 || typeof c.critical !== "boolean") throw new Error("Each criterion needs a simple ID, weight 1–5 and a true/false critical flag.");
    return { id, label: text(c.label, 100), question: text(c.question, 500), weight: Number(c.weight), critical: c.critical };
  });
  if (new Set(criteria.map(c => c.id)).size !== criteria.length) throw new Error("Criterion IDs must be different.");
  return { id, version, title, criteria };
}

export function summarizeReview(rubric: TeachingRubric, ratings: ReviewRatings) {
  const missing = rubric.criteria.filter(c => {
    const review = ratings[c.id];
    return !review || !Number.isInteger(review.score) || Number(review.score) < 0 || Number(review.score) > 3 || review.score === null || typeof review.evidence !== "string" || review.evidence.trim().length < 10 || review.evidence.length > 1500;
  }).map(c => c.id);
  const blockers = rubric.criteria.filter(c => c.critical && ratings[c.id]?.score !== null && Number(ratings[c.id]?.score) < 2).map(c => c.id);
  const score = missing.length ? null : Math.round(100 * rubric.criteria.reduce((sum, c) => sum + Number(ratings[c.id].score) * c.weight, 0) / (3 * rubric.criteria.reduce((sum, c) => sum + c.weight, 0)));
  return { missing, blockers, score, status: missing.length ? "Review incomplete" : blockers.length ? "Resolve critical checks" : "Review recorded" };
}

export function createReviewRecord(rubric: TeachingRubric, brief: { audience: string; objective: string; source: string }, original: { material: string; ratings: ReviewRatings }, revision?: { material: string; ratings: ReviewRatings }) {
  const checked = validateRubric(rubric);
  if (brief.audience.trim().length < 3 || brief.audience.length > 160 || brief.objective.trim().length < 10 || brief.objective.length > 500 || brief.source.length > 20_000) throw new Error("Add the learners and a clear learning objective.");
  for (const item of [original, ...(revision ? [revision] : [])]) {
    if (item.material.trim().length < 20 || item.material.length > 24_000) throw new Error("Add material between 20 and 24,000 characters.");
    if (summarizeReview(checked, item.ratings).missing.length) throw new Error("Rate every criterion and give at least 10 characters of supporting evidence for each.");
  }
  const snapshot = (item: typeof original) => ({ material: item.material.trim(), ratings: Object.fromEntries(checked.criteria.map(c => [c.id, { score: item.ratings[c.id].score, evidence: item.ratings[c.id].evidence.trim() }])), summary: summarizeReview(checked, item.ratings) });
  const first = snapshot(original), second = revision ? snapshot(revision) : null;
  return { schemaVersion: "teaching-review/1", createdAt: new Date().toISOString(), rubric: checked, brief, original: first, revision: second,
    comparison: second ? { scoreChange: second.summary.score! - first.summary.score!, resolvedCriticalChecks: first.summary.blockers.filter(id => !second.summary.blockers.includes(id)) } : null,
    interpretation: "Human-reviewed evidence using the same rubric. Ratings are not a guarantee of factual correctness, teaching effectiveness or permission to publish. No learning impact has been measured." };
}
