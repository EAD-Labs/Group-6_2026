import { describe,expect,it } from "vitest";
import { baseAssessmentBanks,releaseIdFromVersion,validateAssessmentDraft } from "./assessment-release";
const draft=()=>({module:1,title:"Revised knowledge check",passThresholdPercent:90,questions:structuredClone(baseAssessmentBanks[0])});
describe("assessment release validation",()=>{
  it("accepts every original bank without changing the 75-question baseline",()=>{
    expect(baseAssessmentBanks.flat()).toHaveLength(75);
    baseAssessmentBanks.forEach((questions,index)=>expect(validateAssessmentDraft({...draft(),module:index+1,questions}).questions).toEqual(questions));
  });
  it.each([69,101,85.5,NaN])("rejects unapproved passing score %s",threshold=>expect(()=>validateAssessmentDraft({...draft(),passThresholdPercent:threshold})).toThrow(/70%/));
  it("rejects duplicate identities, invalid correct answers and wrong-module lesson references",()=>{
    const value=draft();value.questions[1].id=value.questions[0].id;expect(()=>validateAssessmentDraft(value)).toThrow(/different identifier/);
    const choices=draft();choices.questions[0].correctOptionIds=["invented"];expect(()=>validateAssessmentDraft(choices)).toThrow(/correct answer/);
    const lesson=draft();lesson.questions[0].lessonSlug="not-in-this-module";expect(()=>validateAssessmentDraft(lesson)).toThrow(/lesson/);
  });
  it("parses only complete stable release references",()=>{
    expect(releaseIdFromVersion("assessment:10000000-0000-4000-8000-000000000001")).toBe("10000000-0000-4000-8000-000000000001");
    expect(releaseIdFromVersion("assessment:guess")).toBeNull();
  });
  it.each(["constructor","toString","valueOf","hasOwnProperty"])("rejects prototype-derived question identifiers %s",id=>{
    const value=draft();value.questions[0].id=id;expect(()=>validateAssessmentDraft(value)).toThrow(/safe stable identifier/);
  });
});
