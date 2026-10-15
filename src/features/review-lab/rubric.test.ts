import { describe, expect, it } from "vitest";
import { createReviewRecord, emptyRatings, summarizeReview, teachingRubric, validateRubric } from "./rubric";
const ratings = (score: 0 | 1 | 2 | 3) => Object.fromEntries(teachingRubric.criteria.map(c => [c.id, { score, evidence: "Specific reviewed evidence from the lesson." }]));
describe("portable teaching evidence rubric", () => {
  it("does not assign a score before every criterion has justified human evidence", () => {
    expect(summarizeReview(teachingRubric, emptyRatings(teachingRubric)).score).toBeNull();
    const partial = ratings(3); partial.evidence.evidence = "okay";
    expect(summarizeReview(teachingRubric, partial).missing).toContain("evidence");
  });
  it("keeps critical safety/source failures visible even when other ratings are high", () => {
    const input = ratings(3); input.evidence.score = 0;
    const result = summarizeReview(teachingRubric, input);
    expect(result.blockers).toEqual(["evidence"]); expect(result.status).toBe("Resolve critical checks");
  });
  it("compares recorded revisions using one versioned rubric and preserves their evidence", () => {
    const record = createReviewRecord(teachingRubric, { audience: "Class 6", objective: "Explain evaporation using an observation.", source: "Fictional reviewed source" }, { material: "An original fictional teaching activity.", ratings: ratings(1) }, { material: "A revised fictional activity with source evidence.", ratings: ratings(3) });
    expect(record.comparison?.scoreChange).toBe(67);
    expect(record.comparison?.resolvedCriticalChecks).toEqual(["evidence", "safe-use"]);
    expect(record.original.ratings.evidence.score).toBe(1); expect(record.rubric.version).toBe("1.0");
  });
  it("rejects duplicated IDs, missing weights and oversized imported criteria", () => {
    expect(() => validateRubric({ ...teachingRubric, criteria: [teachingRubric.criteria[0], ...teachingRubric.criteria] })).toThrow(/different/);
    expect(() => validateRubric({ ...teachingRubric, criteria: teachingRubric.criteria.map(c => ({ ...c, weight: 99 })) })).toThrow(/weight/);
    expect(() => validateRubric({ ...teachingRubric, criteria: teachingRubric.criteria.map(c => ({ ...c, question: "x".repeat(501) })) })).toThrow(/long/);
  });
  it("rejects incomplete exports and treats imported strings only as material", () => {
    expect(() => createReviewRecord(teachingRubric, { audience: "Class 6", objective: "Explain a fictional teaching concept.", source: "" }, { material: "A fictional activity for classroom review.", ratings: emptyRatings(teachingRubric) })).toThrow(/Rate every/);
    const rubric = validateRubric({ ...teachingRubric, title: "<script>untrusted material</script>" });
    expect(rubric.title).toContain("<script>");
  });
});
