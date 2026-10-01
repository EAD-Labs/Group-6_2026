import { describe, expect, it } from "vitest";
import { aggregateProgress, aggregateQuestionPatterns, questionPatternsCsv, csvCell, reportCsv, type ReportQuestionBank, type VerifiedSubmission } from "./reporting";
describe("privacy-preserving cohort reports", () => {
  it("includes only cohort members and only four aggregate module totals", () => {
    const result = aggregateProgress([{ participant_id: "alice", cohort_id: "pilot" }], [
      { participant_id: "alice", module_id: "00000000-0000-4000-8000-000000000001", status: "passed", best_score_percent: 80 },
      { participant_id: "bob", module_id: "00000000-0000-4000-8000-000000000001", status: "passed", best_score_percent: 100 },
    ]);
    expect(result.participants).toBe(1); expect(result.modules[0]).toMatchObject({ passed: 1, meanScore: 80 });
    expect(JSON.stringify(result)).not.toMatch(/alice|bob/);
    expect(reportCsv("Pilot", result)).toContain('"80"');
  });
  it.each(["  =SUM(1,2)", "\tcommand", "\rcommand", "+1", "-1", "@command"])("escapes whitespace and formula prefixes %j", value => {
    expect(csvCell(value).startsWith("\"'")).toBe(true);
  });
  it("quotes separators and disables spreadsheet formulas in cohort titles", () => {
    expect(csvCell('=HYPERLINK("https://example.test")')).toMatch(/^"'=/);
    expect(csvCell('Science, "Pilot"')).toBe('"Science, ""Pilot"""');
  });
});

describe("question patterns from verified attempts",()=>{
  const bank:ReportQuestionBank={module:1,quizId:"quiz-1",contentVersion:"current",questions:[
    {id:"q1",lessonSlug:"lesson",kind:"multiple",concept:"Checking sources",prompt:"Which claims have evidence?",options:[{id:"a",label:"First"},{id:"b",label:"Second"}],correctOptionIds:["a","b"],explanation:"Check both."},
  ]};
  const row=(participant_id:string,attempt_id:string,answers:Record<string,string[]>,verified_at:string,content_version="current"):VerifiedSubmission=>({participant_id,attempt_id,answers,verified_at,content_version,quiz_id:"quiz-1"});
  it("counts each member once using the latest verified current-version attempt and leaks no selections or identities",()=>{
    const result=aggregateQuestionPatterns([{participant_id:"alice",cohort_id:"cohort"},{participant_id:"carol",cohort_id:"cohort"},{participant_id:"dara",cohort_id:"cohort"}], [
      row("alice","old",{q1:["a"]},"2026-10-01T10:00:00Z"),
      row("alice","new",{q1:["b","a"]},"2026-10-01T11:00:00Z"),
      row("alice","different-bank",{q1:[]},"2026-10-01T12:00:00Z","historical"),
      row("bob","outside-cohort",{q1:["a"]},"2026-10-01T11:00:00Z"),
      row("carol","unanswered",{},"2026-10-01T11:00:00Z"),
      row("dara","correct",{q1:["a","b"]},"2026-10-01T11:00:00Z"),
    ],[bank]);
    expect(result).toEqual([{module:1,questionId:"q1",question:bank.questions[0].prompt,concept:"Checking sources",respondents:3,missed:1}]);
    expect(JSON.stringify(result)).not.toMatch(/alice|bob|carol|dara|answers|attempt|participant_id/);
    const csv=questionPatternsCsv("Pilot",result);
    expect(csv).toContain('"3","1"');expect(csv).not.toMatch(/alice|bob|carol|dara/);
  });
  it("excludes obsolete question versions and invalid dates rather than regrading them against new wording",()=>{
    const result=aggregateQuestionPatterns([{participant_id:"alice",cohort_id:"cohort"}],[
      row("alice","old",{q1:["a"]},"2026-10-01T10:00:00Z","historical"),
      row("alice","bad-time",{},"invalid"),
    ],[bank]);
    expect(result[0]).toMatchObject({respondents:0,missed:null});
  });
  it("suppresses correctness for a small respondent group in both JSON and CSV",()=>{
    const result=aggregateQuestionPatterns([{participant_id:"alice",cohort_id:"cohort"}], [row("alice","only",{},"2026-10-01T11:00:00Z")],[bank]);
    expect(result[0]).toMatchObject({respondents:1,missed:null});
    expect(questionPatternsCsv("Pilot",result)).toContain('"1",""');
  });
});
