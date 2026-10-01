import { failure,json,readBody,RequestError,requireParticipant } from "@/features/platform/server";
import { getParticipantState } from "@/features/demo/participant-persistence";
import { getPathwayStatus } from "@/features/learning/pathway";
import { getLearningPlan } from "@/components/learning-plan";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET() {
  try {
    const {client,user}=await requireParticipant();
    const [{state},record]=await Promise.all([getParticipantState(client,user.id),client.from("certificates").select("id,participant_name,issued_at,revoked_at,rule_version").eq("participant_id",user.id).eq("rule_version","2026-09-open-course-v1").maybeSingle()]);
    if(record.error) throw new Error("Certificate service unavailable");
    return json({eligible:getPathwayStatus(state).courseComplete,certificate:record.data,missing:getLearningPlan(state).flatMap(m=>m.requirements.filter(r=>!r.complete).map(r=>({...r,module:m.position}))) });
  }catch(error){return failure(error);}
}
export async function POST(request:Request) {
  try {
    await readBody(request,1000);
    const {client,user}=await requireParticipant();
    const {state}=await getParticipantState(client,user.id);
    if(!getPathwayStatus(state).courseComplete) throw new RequestError(409,"Complete the remaining lessons, knowledge checks and practice evidence first.");
    if(!state.safeUseAccepted||!state.onboardingCompleted) throw new RequestError(409,"Complete your profile and safe-use acknowledgement first.");
    const admin=createAdminClient();
    const {data,error}=await admin.rpc("issue_completion_certificate",{p_participant:user.id});
    if(error) throw new RequestError(409,"Your saved learning record is not yet eligible. Return to progress, finish syncing and try again.");
    if(data.revoked_at) throw new RequestError(409,"This completion record has been revoked. Please contact your facilitator.");
    return json({certificate:data});
  }catch(error){return failure(error);}
}
