import { NextResponse } from "next/server";
import { sanitizeDemoState } from "@/features/demo/server-state";
import { assessParticipantState, assessmentBanks, AssessmentValidationError } from "@/features/demo/server-assessment";
import { getParticipantState } from "@/features/demo/participant-persistence";
import { getPathwayStatus } from "@/features/learning/pathway";
import { hasPublicSupabaseEnvironment } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { hasSameOrigin, readJsonBody, RequestValidationError } from "@/lib/server/request";

const json = (body: unknown, status = 200) => NextResponse.json(body, { status, headers: { "Cache-Control": "private, no-store" } });

async function getMode() {
  return hasPublicSupabaseEnvironment() ? "supabase" : "unavailable";
}

export async function GET() {
  const mode = await getMode();
  if (mode !== "supabase") return json({ mode });
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) return json({ mode: "unauthenticated" }, 401);
  try {
    const record = await getParticipantState(supabase, data.user.id);
    return json({ mode, participantId: data.user.id, ...record });
  } catch {
    return json({ error: "Your saved progress could not be loaded. Retry when the service is available." }, 503);
  }
}

export async function PUT(request: Request) {
  if (!hasSameOrigin(request)) return json({ error: "The request origin is not allowed." }, 403);
  const mode = await getMode();
  if (mode !== "supabase") return json({ mode }, 503);
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) return json({ mode: "unauthenticated" }, 401);
  try {
    const body = await readJsonBody(request, 4_000_000);
    if (body.participantId !== data.user.id) return json({ error: "The signed-in account changed. Your previous account's draft remains separate.", mode: "account_changed" }, 409);
    if (!body.state || typeof body.state !== "object" || Array.isArray(body.state) || !Number.isSafeInteger(body.revision) || Number(body.revision) < 0) {
      return json({ error: "Provide a valid participant state and revision." }, 400);
    }
    const record = await getParticipantState(supabase, data.user.id);
    if (record.revision !== body.revision) return json({ error: "Saved progress changed on another device.", conflict: true, participantId: data.user.id, ...record }, 409);
    const state = assessParticipantState(sanitizeDemoState(body.state), record.state);
    const pathway = getPathwayStatus(state);
    const fields = Object.keys(assessmentBanks) as Array<keyof typeof assessmentBanks>;
    const passes = [pathway.onePassed, pathway.twoPassed, pathway.threePassed, pathway.fourPassed];
    const lessons = [pathway.oneLessons, pathway.twoLessons, pathway.threeLessons, pathway.fourLessons];
    const progress = fields.map((field, index) => ({
      moduleId: `00000000-0000-4000-8000-00000000000${index + 1}`,
      status: passes[index] ? "passed" : lessons[index] || state[field].length ? "in_progress" : "available",
      scorePercent: state[field].reduce((best, attempt) => Math.max(best, attempt.scorePercent), 0),
    }));
    const attempts = fields.flatMap((field, index) => state[field].map((attempt, attemptIndex) => ({
      ...attempt, quizId: `00000000-0000-4000-8000-00000000020${index + 1}`, attemptNumber: attemptIndex + 1,
    })));
    const result = await createAdminClient().rpc("save_participant_state", {
      p_participant_id: data.user.id, p_expected_revision: record.revision,
      p_state: state, p_progress: progress, p_attempts: attempts,
    });
    if (result.error?.code === "40001") return json({ error: "Saved progress changed. Retry to merge your work.", conflict: true }, 409);
    if (result.error) throw new Error("save failed");
    return json({ mode, saved: true, participantId: data.user.id, state, revision: result.data });
  } catch (error) {
    if (error instanceof RequestValidationError) return json({ error: error.message }, error.status);
    if (error instanceof AssessmentValidationError) return json({ error: error.message }, 400);
    return json({ error: "Your changes are saved on this device but could not be synchronized. Please retry." }, 503);
  }
}
