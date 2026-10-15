import type { SupabaseClient } from "@supabase/supabase-js";
import { describe,expect,it,vi } from "vitest";
import { getParticipantState } from "./participant-persistence";
import { initialDemoState } from "./demo-state";
describe("trusted legacy account migration",()=>{
  it("preserves a genuine historical profile notice without grandfathering unverified legacy quiz scores",async()=>{
    const from=vi.fn((table:string)=>{
      const result={data:table==="profiles"?{id:"teacher",role:"participant",display_name:"Teacher",safe_use_accepted_at:"2026-09-01T00:00:00Z",safe_use_notice_version:"2026-08-genuine-notice"}:table==="participant_states"?null:table==="quiz_attempts"?[{id:"legacy-attempt",quiz_id:"00000000-0000-4000-8000-000000000201",submitted_at:"2026-09-01T00:00:00Z",score_percent:100,passed:true}]:[],error:null};
      const query={select:vi.fn().mockReturnThis(),eq:vi.fn().mockReturnThis(),not:vi.fn().mockReturnThis(),range:vi.fn().mockResolvedValue(result),maybeSingle:vi.fn().mockResolvedValue(result),order:vi.fn().mockReturnThis(),then:(resolve:(value:unknown)=>void)=>resolve(result)};return query;
    });
    const record=await getParticipantState({from} as unknown as SupabaseClient,"teacher");
    expect(record.state.safeUseNoticeVersion).toBe("2026-08-genuine-notice");expect(record.state.safeUseAccepted).toBe(true);
    expect(record.state.quizAttempts[0]).toMatchObject({scorePercent:0,passed:false});expect(record.state.quizAttempts[0].contentVersion).toMatch(/^2026-10-06-pilot-v2:/);
  });
  it("recovers a committed receipt on another device before normal state sync and requests progress reconciliation",async()=>{
    const receipt={id:"server-graded",answers:{},attemptedAt:"2026-10-15T00:00:00Z",correctAnswers:5,scorePercent:100,passed:true,passThresholdPercent:90,contentVersion:"assessment:90000000-0000-4000-8000-000000000001",verifiedAt:"2026-10-15T00:00:00Z"};
    let saved={...initialDemoState};const filters:unknown[][]=[];
    const from=vi.fn((table:string)=>{
      const result={data:table==="profiles"?{id:"teacher",role:"participant"}:table==="participant_states"?{state:saved,revision:7}:[{quiz_id:"00000000-0000-4000-8000-000000000201",grading_receipt:receipt}],error:null};
      const query={select:vi.fn().mockReturnThis(),eq:vi.fn((...args:unknown[])=>{filters.push([table,...args]);return query;}),not:vi.fn().mockReturnThis(),order:vi.fn().mockReturnThis(),range:vi.fn().mockResolvedValue(result),maybeSingle:vi.fn().mockResolvedValue(result)};return query;
    });
    const client={from} as unknown as SupabaseClient,first=await getParticipantState(client,"teacher");
    expect(first.state.quizAttempts).toEqual([receipt]);expect(first.needsSync).toBe(true);expect(first.revision).toBe(7);
    expect(filters).toContainEqual(["verified_quiz_submissions","participant_id","teacher"]);
    saved=first.state;const second=await getParticipantState(client,"teacher");expect(second.state.quizAttempts).toEqual([receipt]);expect(second.needsSync).toBe(false);
  });
});
