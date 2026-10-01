import { beforeEach, describe, expect, it, vi } from "vitest";
const mocks=vi.hoisted(()=>({staff:vi.fn(),rpc:vi.fn(),from:vi.fn()}));
vi.mock("server-only",()=>({}));
vi.mock("@/features/platform/server",async()=>{
  const actual=await vi.importActual<typeof import("@/features/platform/server")>("@/features/platform/server");
  return {...actual,requireStaff:mocks.staff};
});
import { GET,POST } from "./route";
import { gradeAttempt } from "@/features/demo/server-assessment";
import { moduleOneQuizQuestions } from "@/features/learning/catalog";
const adminId="10000000-0000-4000-8000-000000000005",cohortId="20000000-0000-4000-8000-000000000001";
const request=(payload:Record<string,unknown>,action="update_cohort")=>new Request("https://example.test/api/admin",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({action,payload})});
beforeEach(()=>{
  vi.clearAllMocks();
  mocks.staff.mockResolvedValue({admin:{rpc:mocks.rpc,from:mocks.from},user:{id:adminId},role:"admin",name:"Admin"});
  mocks.rpc.mockResolvedValue({data:{id:cohortId},error:null});
});
describe("cohort administration API",()=>{
  it.each([{startsOn:"2026-02-30"},{endsOn:"2026-09-30"},{title:" "},{facilitatorId:"not-a-uuid"}])("rejects invalid cohort details before writing: %j",async invalid=>{
    const response=await POST(request({id:cohortId,title:"October teachers",startsOn:"2026-10-01",endsOn:"2026-10-20",status:"active",...invalid}));
    expect(response.status).toBe(400);expect(mocks.rpc).not.toHaveBeenCalled();
  });
  it("passes validated editable details and the authenticated actor to the database",async()=>{
    const payload={id:cohortId,title:" October teachers ",facilitatorId:"",startsOn:"2026-10-01",endsOn:"2026-10-20",status:"planned"};
    expect((await POST(request(payload))).status).toBe(200);
    expect(mocks.rpc).toHaveBeenCalledWith("staff_operation",{p_actor:adminId,p_action:"update_cohort",p_payload:{...payload,title:"October teachers"}});
  });
  it("blocks facilitator membership mutation before a privileged query",async()=>{
    mocks.staff.mockResolvedValue({admin:{rpc:mocks.rpc},user:{id:adminId},role:"facilitator"});
    expect((await POST(request({cohortId,participantId:adminId},"unenrol"))).status).toBe(403);
    expect(mocks.rpc).not.toHaveBeenCalled();
  });
  it("returns only the minimal scoped roster and aggregate question counts, never individual assessment evidence",async()=>{
    const actor="10000000-0000-4000-8000-000000000003";
    mocks.staff.mockResolvedValue({admin:{rpc:mocks.rpc,from:mocks.from},user:{id:actor},role:"facilitator",name:"Facilitator"});
    const filters:unknown[]=[];
    mocks.from.mockImplementation((table:string)=>{
      const query={select:vi.fn().mockReturnThis(),order:vi.fn().mockReturnThis(),limit:vi.fn().mockReturnThis(),or:vi.fn().mockReturnThis(),eq:vi.fn((...args:unknown[])=>{filters.push([table,...args]);return query;}),then:(resolve:(result:unknown)=>void)=>resolve({data:table==="cohorts"?[{id:cohortId,title:"Assigned",facilitator_id:actor}]:[],error:null})};
      return query;
    });
    const attempt=gradeAttempt({id:"private-attempt",attemptedAt:"2026-10-01",answers:{},scorePercent:0,passed:false,correctAnswers:0},moduleOneQuizQuestions,"quizAttempts");
    mocks.rpc.mockResolvedValue({data:{roster:[{id:"participant-id",display_name:"Teacher",email:"private@example.test"}],progress:[],submissions:[{participant_id:"participant-id",attempt_id:attempt.id,quiz_id:"00000000-0000-4000-8000-000000000201",content_version:attempt.contentVersion,answers:{},verified_at:"2026-10-01T12:00:00Z"}]},error:null});
    const response=await GET();const result=await response.json();
    expect(response.status).toBe(200);
    expect(filters).toContainEqual(["cohorts","facilitator_id",actor]);
    expect(mocks.rpc).toHaveBeenCalledWith("staff_cohort_evidence",{p_actor:actor,p_cohort:cohortId});
    expect(result.cohorts[0].roster).toEqual([{id:"participant-id",display_name:"Teacher"}]);
    expect(result.cohorts[0].questionPatterns[0]).toMatchObject({respondents:1,missed:null});
    expect(JSON.stringify(result)).not.toMatch(/private-attempt|private@example|"answers"|"submissions"|"verified_at"/);
    expect(result.profiles).toEqual([]);
  });
});
