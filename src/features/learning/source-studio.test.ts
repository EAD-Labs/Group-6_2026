import { readyPortfolio } from "@/test/fixtures/source-portfolio";
import { describe, expect, it } from "vitest";
import { evaluateQuiz } from "./quiz";
import { moduleFourQuizQuestions } from "./module-four-content";
import {
  auditIsCorrect, artifactTypes, buildPracticeDraft, emptySourcePortfolio, exportSourcePortfolio,
  sanitizeSourcePortfolio, sourceAuditCount, sourceCases, sourcePortfolioReady,
} from "./source-studio";


describe("source-grounded practice evidence", () => {
  it.each(sourceCases.map((item) => item.id))("requires three correct, explained passage audits for %s", (id) => {
    const portfolio = readyPortfolio(id);
    expect(sourceAuditCount(portfolio)).toBe(3);
    expect(sourcePortfolioReady(portfolio)).toBe(true);
    const first = sourceCases.find((item) => item.id === id)!.claims[0];
    expect(auditIsCorrect(id, first.id, { ...portfolio.audits[first.id], references: [] })).toBe(false);
    expect(sourcePortfolioReady({ ...portfolio, audits: {} })).toBe(false);
  });

  it("requires both sides of conflicting evidence and does not accept a fluent explanation alone", () => {
    const portfolio = readyPortfolio("seed-enquiry");
    const audit = portfolio.audits.c2;
    expect(auditIsCorrect(portfolio.caseId, "c2", { ...audit, references: ["B:1"] })).toBe(false);
    expect(auditIsCorrect(portfolio.caseId, "c2", { ...audit, verdict: "supported" })).toBe(false);
  });

  it("rejects missing permission, privacy confirmation, revision, review or reflection", () => {
    const portfolio = readyPortfolio();
    for (const patch of [{ sourcePermission: "" as const }, { sourceSafe: false }, { revisionNote: "" }, { reviewChecks: [] }, { reflection: "" }]) {
      expect(sourcePortfolioReady({ ...portfolio, ...patch })).toBe(false);
    }
  });

  it("sanitizes old or malformed data and removes forged claims and references", () => {
    expect(sanitizeSourcePortfolio(null)).toEqual(emptySourcePortfolio);
    const clean = sanitizeSourcePortfolio({ ...readyPortfolio(), caseId: "unknown", draft: "x".repeat(10000),
      audits: { c1: { verdict: "verified", references: ["A:1", "X:99"], note: "Evidence" }, extra: { verdict: "supported" } },
      reviewChecks: ["privacy", "privacy", "made-up"], sourceSafe: "yes" });
    expect(clean.draft).toHaveLength(6000);
    expect(clean.audits.c1).toMatchObject({ verdict: "", references: ["A:1"] });
    expect(clean.audits.extra).toBeUndefined();
    expect(clean.reviewChecks).toEqual(["privacy"]);
    expect(clean.sourceSafe).toBe(false);
  });

  it.each(artifactTypes)("keeps passage labels and teacher guidance in a %s practice draft", (type) => {
    const draft = buildPracticeDraft("river-story", type);
    expect(draft).toContain("A:1");
    expect(draft).toMatch(/Teacher (?:answer )?guide/);
    expect(draft).toContain("fictional practice pack");
  });

  it("marks incomplete exports honestly and includes review decisions in finished portfolios", () => {
    expect(exportSourcePortfolio(emptySourcePortfolio)).toContain("Draft — evidence incomplete");
    const exported = exportSourcePortfolio(readyPortfolio());
    expect(exported).toContain("Required practice evidence recorded");
    expect(exported).toContain("Verdict: unsupported");
    expect(exported).toContain("## Original practice sources");
    expect(exported).toContain("A:2 Evaporation can happen below the boiling point.");
    expect(exported).toContain("B:3 No thermometer, scale or repeated trials were used.");
    expect(exported).toContain("[x]");
    expect(exported).toContain("not a certificate");
  });

  it("passes the curriculum knowledge check with four correct answers and gives explanations", () => {
    const answers = Object.fromEntries(moduleFourQuizQuestions.map((question) => [question.id, question.correctOptionIds]));
    const oneWrong = { ...answers, [moduleFourQuizQuestions[0].id]: ["c"] };
    expect(evaluateQuiz(moduleFourQuizQuestions, oneWrong)).toMatchObject({ scorePercent: 80, passed: true });
    expect(evaluateQuiz(moduleFourQuizQuestions, { ...oneWrong, [moduleFourQuizQuestions[1].id]: ["a"] })).toMatchObject({ scorePercent: 60, passed: false });
  });
});
