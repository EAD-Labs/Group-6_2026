import type { SupabaseClient } from "@supabase/supabase-js";
import { initialDemoState, type DemoState } from "./demo-state";
import { sanitizeDemoState } from "./server-state";
import { assessParticipantState } from "./server-assessment";
import { appRoles, type AppRole } from "@/features/auth/authorization";

export type ParticipantRecord = { state: DemoState; revision: number; role: AppRole };

export async function getParticipantState(supabase: SupabaseClient, participantId: string): Promise<ParticipantRecord> {
  const [profileResult, snapshotResult] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", participantId).maybeSingle(),
    supabase.from("participant_states").select("state,revision").eq("participant_id", participantId).maybeSingle(),
  ]);
  if (profileResult.error || snapshotResult.error || !profileResult.data) {
    throw new Error("Account progress is unavailable. Check that the current database migrations are applied.");
  }
  const profile = profileResult.data;
  const role: AppRole = appRoles.includes(profile.role) ? profile.role : "participant";
  if (snapshotResult.data) {
    return { state: sanitizeDemoState(snapshotResult.data.state), revision: snapshotResult.data.revision, role };
  }
  const [lessons, assistants, attempts] = await Promise.all([
    supabase.from("lesson_progress").select("completed_at,evidence,lessons(slug)").eq("participant_id", participantId),
    supabase.from("assistant_specs").select("id,spec,deleted_at,updated_at").eq("participant_id", participantId),
    supabase.from("quiz_attempts").select("id,quiz_id,submitted_at").eq("participant_id", participantId).order("submitted_at"),
  ]);
  if (lessons.error || assistants.error || attempts.error) throw new Error("Legacy progress could not be loaded.");
  const lessonRows = (lessons.data ?? []).map((row) => ({ ...row, slug: (row.lessons as unknown as { slug: string })?.slug }));
  const completed = lessonRows.filter((row) => row.completed_at && row.slug).map((row) => row.slug);
  const legacyAttempts = (module: number) => (attempts.data ?? []).filter((row) => row.quiz_id === `00000000-0000-4000-8000-00000000020${module}`)
    .map((row) => ({ id: `legacy:${row.id}`, answers: {}, attemptedAt: row.submitted_at }));
  // Migrate safe profile fields. Legacy score-only assessments cannot establish a verified pass.
  const state = assessParticipantState(sanitizeDemoState({
    ...initialDemoState,
    displayName: profile.display_name,
    institution: profile.institution,
    primarySubject: profile.primary_subject,
    teachingLevel: profile.teaching_level,
    yearsTeaching: String(profile.years_teaching ?? 0),
    aiFamiliarity: profile.ai_familiarity,
    aiToolsUsed: profile.ai_tools_used,
    aiToolOther: profile.ai_tool_other,
    currentAiUse: profile.current_ai_use,
    aiUseFrequency: profile.ai_use_frequency,
    goals: profile.learning_goals,
    captionsEnabled: profile.captions_enabled,
    largerText: profile.larger_text,
    reducedMotion: profile.reduced_motion,
    safeUseAccepted: Boolean(profile.safe_use_accepted_at),
    onboardingCompleted: Boolean(profile.onboarding_completed_at),
    craftPracticeCount: profile.craft_practice_count,
    promptLibrary: profile.prompt_library,
    sourcePortfolio: profile.source_portfolio,
    completedLessonSlugs: completed,
    moduleTwoCompletedLessonIds: completed,
    moduleThreeCompletedLessonIds: completed,
    moduleFourCompletedLessonIds: completed,
    lessonEvidence: Object.fromEntries(lessonRows.filter((row) => row.evidence && row.slug).map((row) => [row.slug, row.evidence])),
    assistants: (assistants.data ?? []).map((row) => ({ ...row.spec, id: row.id, deletedAt: row.deleted_at, updatedAt: row.updated_at })),
    quizAttempts: legacyAttempts(1), moduleTwoQuizAttempts: legacyAttempts(2), moduleThreeQuizAttempts: legacyAttempts(3), moduleFourQuizAttempts: legacyAttempts(4),
  }));
  return { state, revision: 0, role };
}
