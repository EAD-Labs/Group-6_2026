import { failure, json, readBody, RequestError, requireParticipant,uuidField } from "@/features/platform/server";
import { baseAssessment, resolveCurrentAssessments } from "@/features/content-authoring/server-assessment-releases";
import { releaseIdFromVersion, resolveRelease, type AssessmentRelease } from "@/features/content-authoring/assessment-release";
import { gradeAttempt, canonicalAnswers,AssessmentValidationError } from "@/features/demo/server-assessment";
import { createAdminClient } from "@/lib/supabase/admin";
import { evaluateQuiz } from "@/features/learning/quiz";
import type { QuizAttempt } from "@/features/demo/demo-state";

function courseModule(value: unknown) { const number = Number(value); if (!Number.isInteger(number) || number < 1 || number > 4) throw new RequestError(400, "Choose a course module."); return number; }
export async function GET(request: Request) {
  try {
    const { client } = await requireParticipant(), params = new URL(request.url).searchParams, moduleNumber = courseModule(params.get("module"));
    const version = params.get("version");
    if (version) {
      const id = releaseIdFromVersion(version);
      if (id) {
        const { data, error } = await client.from("assessment_releases").select("id,module_number,title,questions,pass_threshold,version,status").eq("id", id).eq("module_number", moduleNumber).maybeSingle();
        if (error) throw new Error("Historical assessment unavailable");
        if (!data) throw new RequestError(404, "The question text for this earlier result is unavailable.");
        return json({ assessment: resolveRelease(data as AssessmentRelease) });
      }
      const base = baseAssessment(moduleNumber);
      if (version !== base.contentVersion) throw new RequestError(404, "The question text for this earlier result is unavailable. Its recorded score remains saved.");
      return json({ assessment: base });
    }
    const releases = await resolveCurrentAssessments(client);
    return json({ assessment: releases[moduleNumber - 1] });
  } catch (error) { return failure(error); }
}
export async function POST(request: Request) {
  try {
    const { client,user } = await requireParticipant(), body = await readBody(request, 250_000), moduleNumber = courseModule(body.module);
    const id=body.attemptId?uuidField(body.attemptId,"Attempt"):crypto.randomUUID();
    const [previous,currentAssessments]=await Promise.all([
      client.from("verified_quiz_submissions").select("grading_receipt,quiz_id").eq("participant_id",user.id).eq("attempt_id",id).maybeSingle(),
      resolveCurrentAssessments(client),
    ]);
    if(previous.error)throw new Error("Earlier attempt unavailable");
    if(previous.data?.grading_receipt){
      const receipt=previous.data.grading_receipt as QuizAttempt;
      if(previous.data.quiz_id!==`00000000-0000-4000-8000-00000000020${moduleNumber}`||receipt.contentVersion!==body.contentVersion||canonicalAnswers(receipt.answers)!==canonicalAnswers(body.answers as QuizAttempt["answers"]))throw new RequestError(409,"A submitted attempt cannot be changed. Start a new attempt.");
      return json({attempt:receipt,evaluation:null,alreadySubmitted:true});
    }
    if(previous.data)throw new RequestError(409,"This attempt reference is already used. Start a new attempt.");
    const assessment = currentAssessments[moduleNumber - 1];
    if (body.contentVersion !== assessment.contentVersion) throw new RequestError(409, "This knowledge check has changed. Your previous results remain saved. Refresh the check and start again.");
    const attempt = gradeAttempt({ id, contentVersion: String(body.contentVersion), answers: body.answers as QuizAttempt["answers"], attemptedAt: new Date().toISOString(), correctAnswers: 0, scorePercent: 0, passed: false }, assessment.questions, `module-${moduleNumber}`, assessment);
    const saved=await createAdminClient().from("verified_quiz_submissions").upsert({participant_id:user.id,attempt_id:id,quiz_id:`00000000-0000-4000-8000-00000000020${moduleNumber}`,content_version:attempt.contentVersion,answers:attempt.answers,score_percent:attempt.scorePercent,passed:attempt.passed,submitted_at:attempt.attemptedAt,grading_receipt:attempt},{onConflict:"participant_id,attempt_id",ignoreDuplicates:true});
    if(saved.error?.message?.includes("Assessment publication changed"))throw new RequestError(409,"This knowledge check has changed. Your answers are still here; reload the check before starting again.");
    if(saved.error)throw new Error("The result could not be saved");
    // Another tab can submit this ID between the first read and the insert.
    // Return only the committed receipt, never an ignored concurrent payload.
    const committed=await client.from("verified_quiz_submissions").select("grading_receipt,quiz_id").eq("participant_id",user.id).eq("attempt_id",id).maybeSingle();
    const receipt=committed.data?.grading_receipt as QuizAttempt|undefined;
    if(committed.error||!committed.data||!receipt)throw new Error("The saved result could not be confirmed");
    if(committed.data.quiz_id!==`00000000-0000-4000-8000-00000000020${moduleNumber}`||receipt.contentVersion!==attempt.contentVersion||canonicalAnswers(receipt.answers)!==canonicalAnswers(attempt.answers))throw new RequestError(409,"Another tab submitted different answers for this attempt. Your answers remain here; start a new attempt.");
    return json({ attempt:receipt, evaluation: evaluateQuiz(assessment.questions, receipt.answers, receipt.passThresholdPercent) });
  } catch (error) { return failure(error instanceof AssessmentValidationError ? new RequestError(400, error.message) : error); }
}
