import { failure, json, readBody, RequestError, requireParticipant } from "@/features/platform/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requestedReleaseIds, validateEvents } from "@/features/analytics/events";
import { resolveRelease, type AssessmentRelease } from "@/features/content-authoring/assessment-release";

export async function POST(request: Request) {
  try {
    const { user } = await requireParticipant();
    const body = await readBody(request, 50_000);
    if (body.participantId !== user.id) throw new RequestError(409, "The signed-in account changed.");
    let releaseIds;
    try { releaseIds = requestedReleaseIds(body.events); } catch (error) { throw new RequestError(400, error instanceof Error ? error.message : "Invalid activity."); }
    const admin = createAdminClient();
    // Queued events can precede archival without a submitted attempt. Read the
    // original bank through the trusted service, but never a never-published draft.
    const releases = releaseIds.length ? await admin.from("assessment_releases")
      .select("id,module_number,title,questions,pass_threshold,version,status,published_at")
      .in("id", releaseIds).in("status", ["published", "archived"]).not("published_at", "is", null) : { data: [], error: null };
    if (releases.error) throw new RequestError(503, "Activity versions are temporarily unavailable. Please retry later.");
    let events;
    try { events = validateEvents(body.events, Date.now(), (releases.data as AssessmentRelease[] ?? []).map(resolveRelease)); } catch (error) { throw new RequestError(400, error instanceof Error ? error.message : "Invalid activity."); }
    const result = await admin.rpc("record_learning_events", { p_participant: user.id, p_events: events });
    if (result.error?.code === "P0001") throw new RequestError(429, "Activity limit reached. Please try again later.");
    if (result.error) throw new RequestError(503, "Activity saving is temporarily unavailable.");
    return json({ saved: true, inserted: result.data });
  } catch (error) { return failure(error); }
}
