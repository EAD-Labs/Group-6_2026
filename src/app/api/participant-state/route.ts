import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { initialDemoState, type DemoState } from "@/features/demo/demo-state";
import { sanitizeDemoState } from "@/features/demo/server-state";
import { getPathwayStatus } from "@/features/learning/pathway";
import { hasPublicSupabaseEnvironment } from "@/lib/env";
import { presentationDemoCookie } from "@/lib/supabase/proxy";
import { createClient } from "@/lib/supabase/server";

const moduleOneId = "00000000-0000-4000-8000-000000000001";
const moduleTwoId = "00000000-0000-4000-8000-000000000002";
const moduleThreeId = "00000000-0000-4000-8000-000000000003";
const moduleFourId = "00000000-0000-4000-8000-000000000004";
const moduleOneQuizId = "00000000-0000-4000-8000-000000000201";
const moduleTwoQuizId = "00000000-0000-4000-8000-000000000202";
const moduleThreeQuizId = "00000000-0000-4000-8000-000000000203";
const lessonIdBySlug = {
  "meet-generative-ai": "00000000-0000-4000-8000-000000000101",
  "useful-teacher-tasks": "00000000-0000-4000-8000-000000000102",
  "review-before-use": "00000000-0000-4000-8000-000000000103",
  "verify-ai-claims": "00000000-0000-4000-8000-000000000104",
  "choose-the-right-tool": "00000000-0000-4000-8000-000000000105",
  "responsible-use-challenge": "00000000-0000-4000-8000-000000000106",
  "repair-vague-prompt": "00000000-0000-4000-8000-000000000301",
  "context-constraints-examples": "00000000-0000-4000-8000-000000000302",
  "learning-first-planning": "00000000-0000-4000-8000-000000000303",
  "questions-rubrics-feedback": "00000000-0000-4000-8000-000000000304",
  "differentiate-without-lowering": "00000000-0000-4000-8000-000000000305",
  "prompt-laboratory": "00000000-0000-4000-8000-000000000306",
  "teaching-prompt-library": "00000000-0000-4000-8000-000000000307",
  "prompt-versus-assistant": "00000000-0000-4000-8000-000000000401",
  "assistant-passport": "00000000-0000-4000-8000-000000000402",
  "build-assistant": "00000000-0000-4000-8000-000000000403",
  "test-two-contexts": "00000000-0000-4000-8000-000000000404",
  "repair-and-remix": "00000000-0000-4000-8000-000000000405",
  "source-pack-gaps": "00000000-0000-4000-8000-000000000406",
  "classroom-rehearsal": "00000000-0000-4000-8000-000000000407",
  "workflow-handoffs": "00000000-0000-4000-8000-000000000408",
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
  const [profileResult, lessonResult, attemptResult, assistantResult] = await Promise.all([
    supabase
      .from("profiles")
      .select(
        "display_name,institution,primary_subject,teaching_level,years_teaching,ai_familiarity,learning_goals,captions_enabled,larger_text,reduced_motion,safe_use_accepted_at,onboarding_completed_at,craft_practice_count,prompt_library",
      )
      .eq("id", participantId)
      .maybeSingle(),
    supabase
      .from("lesson_progress")
      .select("lesson_id,completed_at,evidence")
      .eq("participant_id", participantId),
    supabase
      .from("quiz_attempts")
      .select("quiz_id,attempt_number,score_percent,passed,submitted_at")
      .eq("participant_id", participantId)
      .in("quiz_id", [moduleOneQuizId, moduleTwoQuizId, moduleThreeQuizId])
      .order("submitted_at"),
    supabase.from("assistant_specs").select("id,spec,updated_at,deleted_at")
      .eq("participant_id", participantId),
  ]);

  if (profileResult.error || lessonResult.error || attemptResult.error || assistantResult.error) {
    return NextResponse.json(
      { error: "Participant progress could not be loaded." },
      { status: 503 },
    );
  }

  const profile = profileResult.data;
  const attemptsFor = (quizId: string) => (attemptResult.data ?? [])
    .filter((attempt) => attempt.quiz_id === quizId)
    .map((attempt) => ({
      answers: {}, attemptedAt: attempt.submitted_at,
      correctAnswers: Math.round(attempt.score_percent / (quizId === moduleThreeQuizId ? 10 : 20)),
      passed: attempt.passed, scorePercent: attempt.score_percent,
    }));
  const completedSlugs = (lessonResult.data ?? []).filter((row) => row.completed_at)
    .map((row) => slugByLessonId[row.lesson_id]).filter(Boolean);
  const lessonEvidence = Object.fromEntries((lessonResult.data ?? [])
    .filter((row) => row.evidence && slugByLessonId[row.lesson_id])
    .map((row) => [slugByLessonId[row.lesson_id], row.evidence]));
  const state: DemoState = sanitizeDemoState({
    ...initialDemoState,
    aiFamiliarity: profile?.ai_familiarity,
    craftPracticeCount: profile?.craft_practice_count,
    promptLibrary: profile?.prompt_library,
    captionsEnabled: profile?.captions_enabled,
    completedLessonSlugs: completedSlugs,
    lessonEvidence,
    moduleTwoCompletedLessonIds: completedSlugs,
    moduleThreeCompletedLessonIds: completedSlugs,
    displayName: profile?.display_name,
    goals: profile?.learning_goals,
    institution: profile?.institution,
    largerText: profile?.larger_text,
    onboardingCompleted: Boolean(profile?.onboarding_completed_at),
    primarySubject: profile?.primary_subject,
    quizAttempts: attemptsFor(moduleOneQuizId),
    moduleTwoQuizAttempts: attemptsFor(moduleTwoQuizId),
    moduleThreeQuizAttempts: attemptsFor(moduleThreeQuizId),
    assistants: (assistantResult.data ?? []).map((row) => ({
      ...row.spec as object, id: row.id, updatedAt: row.updated_at,
      deletedAt: row.deleted_at ?? undefined,
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
  const pathway = getPathwayStatus(state);
  const passed = pathway.onePassed;
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
      craft_practice_count: state.craftPracticeCount,
      prompt_library: state.promptLibrary,
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

  const lessonRows = [...new Set([...state.completedLessonSlugs, ...state.moduleTwoCompletedLessonIds, ...state.moduleThreeCompletedLessonIds, ...Object.keys(state.lessonEvidence)])].map((slug) => ({
    participant_id: participantId,
    lesson_id: lessonIdBySlug[slug as keyof typeof lessonIdBySlug],
    completed_at: [...state.completedLessonSlugs, ...state.moduleTwoCompletedLessonIds, ...state.moduleThreeCompletedLessonIds].includes(slug) ? now : null,
    evidence: state.lessonEvidence[slug] ?? null,
    updated_at: now,
  }));
  const lessonResult = lessonRows.length
    ? await supabase
        .from("lesson_progress")
        .upsert(lessonRows, { onConflict: "participant_id,lesson_id" })
    : { error: null };
  const attemptRows = ([
    [moduleOneQuizId, state.quizAttempts],
    [moduleTwoQuizId, state.moduleTwoQuizAttempts],
    [moduleThreeQuizId, state.moduleThreeQuizAttempts],
  ] as const).flatMap(([quizId, attempts]) => attempts.map((attempt, index) => ({
    participant_id: participantId,
    quiz_id: quizId,
    attempt_number: index + 1,
    score_percent: attempt.scorePercent,
    passed: attempt.passed,
    submitted_at: attempt.attemptedAt,
  })));
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
        status: pathway.twoPassed ? "passed" : passed ? pathway.twoLessons ? "in_progress" : "available" : "locked",
        best_score_percent: state.moduleTwoQuizAttempts.reduce((best, attempt) => Math.max(best, attempt.scorePercent), 0) || null,
        passed_at: pathway.twoPassed ? now : null,
        updated_at: now,
      },
      {
        participant_id: participantId,
        module_id: moduleThreeId,
        status: pathway.threePassed ? "passed" : pathway.twoPassed ? pathway.threeLessons ? "in_progress" : "available" : "locked",
        best_score_percent: state.moduleThreeQuizAttempts.reduce((best, attempt) => Math.max(best, attempt.scorePercent), 0) || null,
        passed_at: pathway.threePassed ? now : null,
        updated_at: now,
      },
      {
        participant_id: participantId,
        module_id: moduleFourId,
        status: pathway.threePassed ? "available" : "locked",
        updated_at: now,
      },
    ],
    { onConflict: "participant_id,module_id" },
  );
  const assistantRows = state.assistants.map((assistant) => ({
    id: assistant.id,
    participant_id: participantId,
    spec: assistant,
    updated_at: assistant.updatedAt,
    deleted_at: assistant.deletedAt ?? null,
  }));
  const assistantSaveResult = assistantRows.length
    ? await supabase.from("assistant_specs").upsert(assistantRows, { onConflict: "id" })
    : { error: null };

  if (
    profileResult.error ||
    lessonResult.error ||
    attemptResult.error ||
    progressResult.error || assistantSaveResult.error
  ) {
    return NextResponse.json(
      { error: "Participant progress could not be saved." },
      { status: 503 },
    );
  }

  return NextResponse.json({ mode, saved: true });
}
