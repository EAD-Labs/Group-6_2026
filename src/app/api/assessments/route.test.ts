import { beforeEach,describe,expect,it,vi } from "vitest";
const mocks=vi.hoisted(()=>({participant:vi.fn(),from:vi.fn(),upsert:vi.fn(),previous:vi.fn(),releases:vi.fn()}));
vi.mock("server-only",()=>({}));
vi.mock("@/features/platform/server",async()=>({...await vi.importActual<typeof import("@/features/platform/server")>("@/features/platform/server"),requireParticipant:mocks.participant}));
vi.mock("@/lib/supabase/admin",()=>({createAdminClient:()=>({from:()=>({upsert:mocks.upsert})})}));
import { GET,POST } from "./route";
import { baseAssessmentBanks,releaseContentVersion } from "@/features/content-authoring/assessment-release";
import { baseAssessment } from "@/features/content-authoring/server-assessment-releases";
const release={id:"90000000-0000-4000-8000-000000000001",module_number:1,title:"A revised check",questions:baseAssessmentBanks[0].slice(0,5),pass_threshold:90,version:1,status:"published"};
const attemptId="90000000-0000-4000-8000-000000000002";
const request=(extra:Record<string,unknown>={})=>new Request("https://example.test/api/assessments",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({module:1,attemptId,contentVersion:releaseContentVersion(release.id),answers:Object.fromEntries(release.questions.slice(0,4).map(question=>[question.id,question.correctOptionIds])),...extra})});
beforeEach(()=>{
  vi.clearAllMocks();mocks.previous.mockReturnValue(null);mocks.releases.mockReturnValue([release]);mocks.upsert.mockImplementation(async row=>{mocks.previous.mockReturnValue({quiz_id:row.quiz_id,grading_receipt:row.grading_receipt});return {error:null};});
  mocks.participant.mockResolvedValue({client:{from:mocks.from},user:{id:"teacher-owner"}});
  mocks.from.mockImplementation((table:string)=>{const query={select:vi.fn().mockReturnThis(),eq:vi.fn().mockReturnThis(),maybeSingle:vi.fn(async()=>({data:table==="verified_quiz_submissions"?mocks.previous():mocks.releases()[0]??null,error:null})),then:(resolve:(value:unknown)=>void)=>resolve({data:mocks.releases(),error:null})};return query;});
});
describe("published assessment API",()=>{
  it("uses the original versioned course bank when no release is published",async()=>{
    mocks.releases.mockReturnValue([]);const response=await GET(new Request("https://example.test/api/assessments?module=1"));
    expect((await response.json()).assessment).toEqual(baseAssessment(1));
  });
  it("loads the published bank and records a trusted grading receipt using its threshold",async()=>{
    const loaded=await GET(new Request("https://example.test/api/assessments?module=1"));expect((await loaded.json()).assessment).toMatchObject({contentVersion:releaseContentVersion(release.id),passThresholdPercent:90});
    const response=await POST(request({questions:[],passThresholdPercent:70,scorePercent:100,passed:true}));expect(response.status).toBe(200);
    const result=await response.json();expect(result.attempt).toMatchObject({id:attemptId,scorePercent:80,passed:false,correctAnswers:4,passThresholdPercent:90});
    expect(mocks.upsert).toHaveBeenCalledWith(expect.objectContaining({participant_id:"teacher-owner",grading_receipt:result.attempt,passed:false}),{onConflict:"participant_id,attempt_id",ignoreDuplicates:true});
  });
  it("rejects stale and missing published versions without storing client-supplied results",async()=>{
    expect((await POST(request({contentVersion:"stale"}))).status).toBe(409);
    expect((await POST(request({contentVersion:undefined}))).status).toBe(409);expect(mocks.upsert).not.toHaveBeenCalled();
  });
  it("returns the same immutable receipt on retry after a publication change",async()=>{
    const receipt={id:attemptId,answers:{},contentVersion:releaseContentVersion(release.id),scorePercent:80,passThresholdPercent:90,passed:false};mocks.previous.mockReturnValue({quiz_id:"00000000-0000-4000-8000-000000000201",grading_receipt:receipt});mocks.releases.mockReturnValue([]);
    const response=await POST(request({answers:{}}));expect(response.status).toBe(200);expect((await response.json()).attempt).toEqual(receipt);expect(mocks.upsert).not.toHaveBeenCalled();
    expect((await POST(request())).status).toBe(409);
  });
  it("rejects a different receipt committed by another tab during submission",async()=>{
    mocks.upsert.mockImplementationOnce(async row=>{mocks.previous.mockReturnValue({quiz_id:row.quiz_id,grading_receipt:{...row.grading_receipt,answers:{}}});return {error:null};});
    expect((await POST(request())).status).toBe(409);
  });
});
