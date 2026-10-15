import type { SupabaseClient } from "@supabase/supabase-js";
import { initialDemoState, type DemoState,type QuizAttempt } from "./demo-state";
import { sanitizeDemoState } from "./server-state";
import { assessParticipantState } from "./server-assessment";
import { appRoles, type AppRole } from "@/features/auth/authorization";
import { assessmentFields } from "@/features/content-authoring/assessment-release";

export type ParticipantRecord = { state: DemoState; revision: number; role: AppRole;needsSync?:boolean };
type GradingReceiptRow={quiz_id:string;grading_receipt:QuizAttempt|null};
async function loadGradingReceipts(supabase:SupabaseClient,participantId:string){
  const rows:GradingReceiptRow[]=[];
  for(let offset=0;;offset+=500){
    const result=await supabase.from("verified_quiz_submissions").select("quiz_id,grading_receipt").eq("participant_id",participantId).not("grading_receipt","is",null).order("verified_at").order("attempt_id").range(offset,offset+499);
    if(result.error)throw new Error("Your verified knowledge checks could not be recovered.");
    rows.push(...result.data as GradingReceiptRow[]??[]);if((result.data?.length??0)<500)break;
  }
  return rows;
}
function mergeGradingReceipts(state:DemoState,rows:GradingReceiptRow[]){
  const recovered={...state};let needsSync=false;
  for(const row of rows){
    const index=[1,2,3,4].findIndex(number=>row.quiz_id===`00000000-0000-4000-8000-00000000020${number}`),receipt=row.grading_receipt;
    if(index<0||!receipt?.id)continue;const field=assessmentFields[index];
    if(!recovered[field].some(attempt=>attempt.id===receipt.id)){recovered[field]=[...recovered[field],receipt];needsSync=true;}
  }
  return {state:recovered,needsSync};
}

export async function getParticipantState(supabase: SupabaseClient, participantId: string): Promise<ParticipantRecord> {
  const [profileResult, snapshotResult,receipts] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", participantId).maybeSingle(),
    supabase.from("participant_states").select("state,revision").eq("participant_id", participantId).maybeSingle(),
    loadGradingReceipts(supabase,participantId),
  ]);
  if (profileResult.error || snapshotResult.error || !profileResult.data) {
    throw new Error("Account progress is unavailable. Check that the current database migrations are applied.");
  }
  const profile = profileResult.data;
  const role: AppRole = appRoles.includes(profile.role) ? profile.role : "participant";
  if (snapshotResult.data) {
    return { ...mergeGradingReceipts(sanitizeDemoState(snapshotResult.data.state),receipts), revision: snapshotResult.data.revision, role };
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
  const trustedProfileSeed = sanitizeDemoState({
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
    safeUseNoticeVersion: profile.safe_use_notice_version ?? null,
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
  });
  const state = assessParticipantState(trustedProfileSeed, { ...initialDemoState, safeUseAccepted: trustedProfileSeed.safeUseAccepted, safeUseNoticeVersion: trustedProfileSeed.safeUseNoticeVersion });
  return { ...mergeGradingReceipts(state,receipts), revision: 0, role };
}
