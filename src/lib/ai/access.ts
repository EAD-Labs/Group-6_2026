import { hasPublicSupabaseEnvironment } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function getAiAccess(): Promise<{ mode: "demo" | "unauthenticated" | "consent_required" | "authenticated"; participantId?: string }> {
  if (!hasPublicSupabaseEnvironment()) return { mode: "unauthenticated" };
  const client = await createClient();
  const { data, error } = await client.auth.getUser();
  if (error || !data.user) return { mode: "unauthenticated" };
  const profile = await client.from("profiles").select("safe_use_accepted_at").eq("id", data.user.id).maybeSingle();
  if (profile.error || !profile.data) throw new Error("AI access could not be verified.");
  if (!profile.data.safe_use_accepted_at) return { mode: "consent_required" };
  return { mode: "authenticated", participantId: data.user.id };
}

export async function consumeAiBudget(participantId: string, operation: "craft" | "assistant" | "transform") {
  const { data, error } = await createAdminClient().rpc("consume_ai_rate_limit", {
    p_participant_id: participantId, p_operation: operation, p_limit: operation === "craft" ? 12 : 6,
  });
  if (error) throw new Error("AI request limits are unavailable.");
  return data === true;
}
