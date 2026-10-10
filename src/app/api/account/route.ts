import { failure,json,readBody,RequestError,requireParticipant } from "@/features/platform/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getParticipantState } from "@/features/demo/participant-persistence";
import type { SupabaseClient } from "@supabase/supabase-js";

async function exportCraftPrompts(client: SupabaseClient, participantId: string) {
  const attempts: Record<string, unknown>[] = [];
  const pageSize = 1000;
  for (let offset = 0; ; offset += pageSize) {
    const { data, error } = await client.from("craft_prompt_attempts")
      .select("id,task_text,prompt_text,evaluation,dimension_scores,overall_score,score_percent,evaluation_source,model,safety_flags,created_at")
      .eq("participant_id", participantId).order("created_at").order("id")
      .range(offset, offset + pageSize - 1);
    if (error) throw new Error("CRAFT export unavailable");
    attempts.push(...(data ?? []));
    if (!data || data.length < pageSize) return attempts;
  }
}

export async function GET() {
  try {
    const { client, user } = await requireParticipant();
    const [record, resources, certificates, craftPrompts] = await Promise.all([
      getParticipantState(client, user.id),
      client.from("teacher_resources").select("title,audience,objective,source_text,output_format,draft,permission,reviewed,created_at,expires_at").eq("owner_id", user.id),
      client.from("certificates").select("id,participant_name,issued_at,rule_version,revoked_at").eq("participant_id", user.id),
      exportCraftPrompts(client, user.id),
    ]);
    if (resources.error || certificates.error) throw new Error("Export unavailable");
    return new Response(JSON.stringify({ exportedAt: new Date().toISOString(), account: { id: user.id, email: user.email }, learning: record.state, resources: resources.data, certificates: certificates.data, craftPrompts }, null, 2), {
      headers: { "Content-Type": "application/json", "Content-Disposition": "attachment; filename=PromptShala-account-export.json", "Cache-Control": "private, no-store" },
    });
  } catch (error) { return failure(error); }
}
export async function DELETE(request:Request) {
  try{const {user}=await requireParticipant();const body=await readBody(request,1000);if(body.confirmation!=="DELETE MY ACCOUNT")throw new RequestError(400,"Type DELETE MY ACCOUNT to confirm.");const admin=createAdminClient();const profile=await admin.from("profiles").select("role").eq("id",user.id).single();if(profile.error)throw new Error("Profile unavailable");if(profile.data.role==="admin")throw new RequestError(409,"Ask another administrator to change your role before deleting this account.");const {error}=await admin.auth.admin.deleteUser(user.id);if(error)throw new Error("Account deletion unavailable");return json({deleted:true});}catch(error){return failure(error);}
}
