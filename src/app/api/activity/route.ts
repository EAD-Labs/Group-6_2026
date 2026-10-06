import { failure, json, readBody, RequestError, requireParticipant } from "@/features/platform/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { validateEvents } from "@/features/analytics/events";

export async function POST(request: Request) {
  try {
    const { user } = await requireParticipant();
    const body = await readBody(request, 50_000);
    if (body.participantId !== user.id) throw new RequestError(409, "The signed-in account changed.");
    let events;
    try { events = validateEvents(body.events); } catch (error) { throw new RequestError(400, error instanceof Error ? error.message : "Invalid activity."); }
    const result = await createAdminClient().rpc("record_learning_events", { p_participant: user.id, p_events: events });
    if (result.error?.code === "P0001") throw new RequestError(429, "Activity limit reached. Please try again later.");
    if (result.error) throw new RequestError(503, "Activity saving is temporarily unavailable.");
    return json({ saved: true, inserted: result.data });
  } catch (error) { return failure(error); }
}
