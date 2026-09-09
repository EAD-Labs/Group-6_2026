import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { initialDemoState, type DemoState } from "@/features/demo/demo-state";
import { sanitizeDemoState } from "@/features/demo/server-state";
import { hasPublicSupabaseEnvironment } from "@/lib/env";
import { presentationDemoCookie } from "@/lib/supabase/proxy";
import { createClient } from "@/lib/supabase/server";

const moduleOneId = "00000000-0000-4000-8000-000000000001";
const moduleTwoId = "00000000-0000-4000-8000-000000000002";
const moduleOneQuizId = "00000000-0000-4000-8000-000000000201";
const lessonIdBySlug = {
  "meet-generative-ai": "00000000-0000-4000-8000-000000000101",
  "useful-teacher-tasks": "00000000-0000-4000-8000-000000000102",
  "review-before-use": "00000000-0000-4000-8000-000000000103",
} as const;
const slugByLessonId: Record<string, string> = Object.fromEntries(
  Object.entries(lessonIdBySlug).map(([slug, id]) => [id, slug]),
);

async function getMode() {
  const cookieStore = await cookies();
  if (cookieStore.get(presentationDemoCookie)?.value === "active") {
    return "demo" as const;
  }
  if (!hasPublicSupabaseEnvironment()) {
    return "unavailable" as const;
  }
  return "supabase" as const;
}

export async function GET() {
  const mode = await getMode();
  if (mode !== "supabase") {
    return NextResponse.json({ mode });
  }

  const supabase = await createClient();
  const { data: authData } = await supabase.auth.getUser();
  if (!authData.user) {
    return NextResponse.json({ mode: "unauthenticated" }, { status: 401 });
  }

  const participantId = authData.user.id;
  const [profileResult, lessonResult, attemptResult] = await Promise.all([
    supabase
      .from("profiles")
      .select(
        "display_name,institution,primary_subject,teaching_level,years_teaching,ai_familiarity,learning_goals,captions_enabled,larger_text,reduced_motion,safe_use_accepted_at,onboarding_completed_at",
      )
      .eq("id", participantId)
      .maybeSingle(),
    supabase
      .from("lesson_progress")
      .select("lesson_id,completed_at")
      .eq("participant_id", participantId)
      .not("completed_at", "is", null),
    supabase
      .from("quiz_attempts")
      .select("attempt_number,score_percent,passed,submitted_at")
      .eq("participant_id", participantId)
      .eq("quiz_id", moduleOneQuizId)
      .order("attempt_number"),
  ]);

  if (profileResult.error || lessonResult.error || attemptResult.error) {
    return NextResponse.json(
      { error: "Participant progress could not be loaded." },
      { status: 503 },
    );
  }

  const profile = profileResult.data;
  const state: DemoState = sanitizeDemoState({
    ...initialDemoState,
    aiFamiliarity: profile?.ai_familiarity,
    captionsEnabled: profile?.captions_enabled,
    completedLessonSlugs: (lessonResult.data ?? [])
      .map((row) => slugByLessonId[row.lesson_id])
      .filter(Boolean),
    displayName: profile?.display_name,
    goals: profile?.learning_goals,
    institution: profile?.institution,
    largerText: profile?.larger_text,
    onboardingCompleted: Boolean(profile?.onboarding_completed_at),
    primarySubject: profile?.primary_subject,
    quizAttempts: (attemptResult.data ?? []).map((attempt) => ({
      answers: {},
      attemptedAt: attempt.submitted_at,
      correctAnswers: Math.round(attempt.score_percent / 20),
      passed: attempt.passed,
      scorePercent: attempt.score_percent,
    })),
    reducedMotion: profile?.reduced_motion,
    safeUseAccepted: Boolean(profile?.safe_use_accepted_at),
    teachingLevel: profile?.teaching_level,
    yearsTeaching:
      profile?.years_teaching === null || profile?.years_teaching === undefined
        ? undefined
        : String(profile.years_teaching),
  });

  return NextResponse.json({ mode, state });
}

export async function PUT(request: Request) {
  const mode = await getMode();
  if (mode !== "supabase") {
    return NextResponse.json({ mode });
  }

  const body = (await request.json().catch(() => null)) as {
    state?: unknown;
  } | null;
  const state = sanitizeDemoState(body?.state);
  const supabase = await createClient();
  const { data: authData } = await supabase.auth.getUser();
  if (!authData.user) {
    return NextResponse.json({ mode: "unauthenticated" }, { status: 401 });
  }

  const participantId = authData.user.id;
  const now = new Date().toISOString();
  const passed = state.quizAttempts.some((attempt) => attempt.passed);
  const bestScore = state.quizAttempts.reduce(
    (best, attempt) => Math.max(best, attempt.scorePercent),
    0,
  );
  const moduleOneStatus = passed
    ? "passed"
    : state.completedLessonSlugs.length
      ? "in_progress"
      : "available";

  const profileResult = await supabase.from("profiles").upsert(
    {
      id: participantId,
      display_name: state.displayName,
      institution: state.institution || null,
      primary_subject: state.primarySubject,
      teaching_level: state.teachingLevel,
      years_teaching: Number(state.yearsTeaching) || 0,
      ai_familiarity: state.aiFamiliarity,
      learning_goals: state.goals,
      captions_enabled: state.captionsEnabled,
      larger_text: state.largerText,
      reduced_motion: state.reducedMotion,
      safe_use_accepted_at: state.safeUseAccepted ? now : null,
      onboarding_completed_at: state.onboardingCompleted ? now : null,
      updated_at: now,
    },
    { onConflict: "id" },
  );

  const lessonRows = state.completedLessonSlugs.map((slug) => ({
    participant_id: participantId,
    lesson_id: lessonIdBySlug[slug as keyof typeof lessonIdBySlug],
    completed_at: now,
    updated_at: now,
  }));
  const lessonResult = lessonRows.length
    ? await supabase
        .from("lesson_progress")
        .upsert(lessonRows, { onConflict: "participant_id,lesson_id" })
    : { error: null };
  const attemptRows = state.quizAttempts.map((attempt, index) => ({
    participant_id: participantId,
    quiz_id: moduleOneQuizId,
    attempt_number: index + 1,
    score_percent: attempt.scorePercent,
    passed: attempt.passed,
    submitted_at: attempt.attemptedAt,
  }));
  const attemptResult = attemptRows.length
    ? await supabase.from("quiz_attempts").upsert(attemptRows, {
        onConflict: "participant_id,quiz_id,attempt_number",
      })
    : { error: null };
  const progressResult = await supabase.from("module_progress").upsert(
    [
      {
        participant_id: participantId,
        module_id: moduleOneId,
        status: moduleOneStatus,
        best_score_percent: bestScore || null,
        started_at: state.completedLessonSlugs.length ? now : null,
        passed_at: passed ? now : null,
        updated_at: now,
      },
      {
        participant_id: participantId,
        module_id: moduleTwoId,
        status: passed ? "available" : "locked",
        updated_at: now,
      },
    ],
    { onConflict: "participant_id,module_id" },
  );

  if (
    profileResult.error ||
    lessonResult.error ||
    attemptResult.error ||
    progressResult.error
  ) {
    return NextResponse.json(
      { error: "Participant progress could not be saved." },
      { status: 503 },
    );
  }

  return NextResponse.json({ mode, saved: true });
}
