import { failure, json, requireParticipant } from "@/features/platform/server";

export async function GET() {
  try {
    const { client, user } = await requireParticipant();
    const { data, error } = await client.from("craft_prompt_attempts")
      .select("id,task_text,prompt_text,evaluation,score_percent,created_at")
      .eq("participant_id", user.id).not("prompt_text", "is", null)
      .order("created_at", { ascending: false }).limit(20);
    if (error) throw new Error("Saved prompts unavailable.");
    return json({ attempts: data ?? [] });
  } catch (error) { return failure(error); }
}
