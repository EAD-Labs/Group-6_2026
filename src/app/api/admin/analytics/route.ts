import { failure, json, RequestError, requireStaff, uuidField } from "@/features/platform/server";
import { releaseIdFromVersion, resolveRelease, type AssessmentRelease } from "@/features/content-authoring/assessment-release";
import { baseAssessment } from "@/features/content-authoring/server-assessment-releases";
import type { LearningDetail } from "@/features/analytics/report-types";

export async function GET(request: Request) {
  try {
    const { admin, user, role } = await requireStaff();
    if (role !== "admin") throw new RequestError(403, "Only administrators can view individual learning activity.");
    const params = new URL(request.url).searchParams;
    const participant = params.get("participant");
    if (participant) {
      const id = uuidField(participant, "Participant");
      const page = Number(params.get("eventsPage") ?? 0);
      if (!Number.isSafeInteger(page) || page < 0 || page > 100_000) throw new RequestError(400, "Invalid activity page.");
      const [detail, events] = await Promise.all([
        admin.rpc("admin_learning_detail", { p_actor: user.id, p_participant: id }),
        admin.from("learning_events").select("id,kind,path,target,module_number,question_id,selected_options,correct,active_ms,occurred_at,attempt_id,content_version", { count: "exact" })
          .eq("participant_id", id).order("occurred_at", { ascending: false }).order("id").range(page * 50, page * 50 + 49),
      ]);
      if (detail.error || events.error) throw new RequestError(503, "Learning reports are temporarily unavailable.");
      const payload=detail.data as LearningDetail;
      const ids=[...new Set([...(payload.questions??[]),...(payload.attempts??[])].map(row=>releaseIdFromVersion(row.contentVersion)).filter((id):id is string=>Boolean(id)))];
      const releases=ids.length?await admin.from("assessment_releases").select("id,module_number,title,questions,pass_threshold,version,status").in("id",ids):{data:[],error:null};
      if(releases.error)throw new RequestError(503,"Question versions are temporarily unavailable.");
      const resolved=(releases.data as AssessmentRelease[]??[]).map(resolveRelease);
      const lookup=(version:string|null,moduleNumber:number)=>resolved.find(release=>release.module===moduleNumber&&release.contentVersion===version)??([1,2,3,4].includes(moduleNumber)&&baseAssessment(moduleNumber).contentVersion===version?baseAssessment(moduleNumber):undefined);
      return json({ ...payload,questions:(payload.questions??[]).map(row=>({...row,question:lookup(row.contentVersion,row.module)?.questions.find(question=>question.id===row.questionId)?.prompt??null})),attempts:(payload.attempts??[]).map(row=>({...row,passThresholdPercent:lookup(row.contentVersion,row.module)?.passThresholdPercent??70})), events: events.data, eventsTotal: events.count, eventsPage: page });
    }
    const search = params.get("search")?.trim() ?? "";
    const page = Number(params.get("page") ?? 0);
    if (search.length > 100 || !Number.isSafeInteger(page) || page < 0 || page > 100_000) throw new RequestError(400, "Invalid participant search.");
    const result = await admin.rpc("admin_learning_roster", { p_actor: user.id, p_search: search, p_page: page });
    if (result.error) throw new RequestError(503, "Participant reports are temporarily unavailable.");
    return json(result.data);
  } catch (error) { return failure(error); }
}
