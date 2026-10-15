import { failure,json,readBody,RequestError,requireStaff,textField,uuidField } from "@/features/platform/server";
import { aggregateProgress, aggregateQuestionPatterns, type CohortRosterEntry, type ProgressRecord, type VerifiedSubmission } from "@/features/platform/reporting";
import { validateLessonDraft } from "@/features/content-authoring/lesson-package";
import { validateAssessmentDraft } from "@/features/content-authoring/assessment-release";
import { resolveCurrentAssessments } from "@/features/content-authoring/server-assessment-releases";


function cohortDetails(payload:Record<string,unknown>) {
  const status=String(payload.status??"active");
  if(!["active","planned","completed","archived"].includes(status)) throw new RequestError(400,"Choose a cohort status.");
  const date=(field:string)=>{
    const value=payload[field]??"";
    if(value==="") return "";
    if(typeof value!=="string"||!/^\d{4}-\d{2}-\d{2}$/.test(value)||value.slice(0,4)<"1000"||!Number.isFinite(Date.parse(value))||new Date(value).toISOString().slice(0,10)!==value) throw new RequestError(400,"Use a valid calendar date.");
    return value;
  };
  const startsOn=date("startsOn"),endsOn=date("endsOn");
  if(startsOn&&endsOn&&endsOn<startsOn) throw new RequestError(400,"The end date must follow the start date.");
  return {title:textField(payload.title,"Cohort name",3,120),facilitatorId:payload.facilitatorId?uuidField(payload.facilitatorId):"",startsOn,endsOn,status};
}

export async function GET() {
  try {
    const {admin,client,user,role,name}=await requireStaff();
    let cohortQuery=admin.from("cohorts").select("id,title,facilitator_id,starts_on,ends_on,status").order("created_at",{ascending:false});
    if(role!=="admin") cohortQuery=cohortQuery.eq("facilitator_id",user.id);
    // Staff content reads use their own session: cohort RLS also applies here.
    const contentQuery=client.from("content_versions").select("id,module_number,lesson_slug,title,body,package,cohort_id,version,status,author_id,created_at,published_at").order("created_at",{ascending:false}).limit(100);
    let scopeQuery=admin.from("cohorts").select("id,title,status").order("title");
    if(role==="facilitator") scopeQuery=scopeQuery.eq("facilitator_id",user.id);
    const [cohorts,content,profiles,certificates,audit,modules,contentScopes,assessmentReleases,currentAssessments]=await Promise.all([
      cohortQuery,contentQuery,
      role==="admin"?admin.from("profiles").select("id,display_name,role").order("display_name").limit(500):Promise.resolve({data:[],error:null}),
      role==="admin"?admin.from("certificates").select("id,participant_name,issued_at,revoked_at,rule_version").order("issued_at",{ascending:false}).limit(200):Promise.resolve({data:[],error:null}),
      role==="admin"?admin.from("audit_events").select("id,action,resource_id,created_at,actor_id").order("created_at",{ascending:false}).limit(100):Promise.resolve({data:[],error:null}),
      admin.from("learning_modules").select("id,title,estimated_minutes,position").order("position"),
      scopeQuery,
      client.from("assessment_releases").select("id,module_number,title,questions,pass_threshold,version,status").order("created_at",{ascending:false}).limit(100),
      resolveCurrentAssessments(client),
    ]);
    if([cohorts,content,profiles,certificates,audit,modules,contentScopes,assessmentReleases].some(r=>r.error)) throw new Error("Programme schema unavailable");
    const reportBanks=currentAssessments.map(assessment=>({...assessment,quizId:`00000000-0000-4000-8000-00000000020${assessment.module}`}));
    const reports=await Promise.all((cohorts.data??[]).map(async cohort=>{
      const evidence=await admin.rpc("staff_cohort_evidence",{p_actor:user.id,p_cohort:cohort.id});
      if(evidence.error) throw new Error("Cohort evidence unavailable");
      const {roster:privateRoster,progress,submissions}=evidence.data as {roster:CohortRosterEntry[];progress:ProgressRecord[];submissions:VerifiedSubmission[]};
      const roster=privateRoster.map(person=>({id:person.id,display_name:person.display_name}));
      const members=roster.map(person=>({cohort_id:cohort.id,participant_id:person.id}));
      // Explicit projection: raw selections/progress identities never reach the staff browser.
      return {...cohort,roster,report:aggregateProgress(members,progress),questionPatterns:aggregateQuestionPatterns(members,submissions,reportBanks)};
    }));
    return json({role,name,cohorts:reports,content:content.data,contentScopes:contentScopes.data,assessmentReleases:assessmentReleases.data,profiles:profiles.data,certificates:certificates.data,audit:audit.data,modules:modules.data});
  } catch(error) { return failure(error); }
}

export async function POST(request:Request) {
  try {
    const {admin,user,role}=await requireStaff();
    const body=await readBody(request,500_000);
    const action=textField(body.action,"Action",3,40);
    const payload=(body.payload&&typeof body.payload==="object"&&!Array.isArray(body.payload)?body.payload:{}) as Record<string,unknown>;
    if(!["save_content","save_lesson_package","save_assessment_release"].includes(action)&&role!=="admin") throw new RequestError(403,"Only an administrator can perform this action.");
    let data:Record<string,unknown>;
    switch(action) {
      case "save_content": case "save_lesson_package": {
        try { data=validateLessonDraft(payload,action==="save_lesson_package") as unknown as Record<string,unknown>; }
        catch(error) { throw new RequestError(400,error instanceof Error?error.message:"Check the lesson update."); }
        break;
      }
      case "publish_content": case "archive_content": data={id:uuidField(payload.id)}; break;
      case "save_assessment_release": { try { data=validateAssessmentDraft(payload) as unknown as Record<string,unknown>; } catch(error) { throw new RequestError(400,error instanceof Error?error.message:"Check the knowledge check."); } break; }
      case "publish_assessment_release": case "archive_assessment_release": data={id:uuidField(payload.id)};break;
      case "create_cohort": data=cohortDetails(payload);break;
      case "update_cohort": data={id:uuidField(payload.id),...cohortDetails(payload)};break;
      case "enrol": case "unenrol": data={cohortId:uuidField(payload.cohortId),participantId:uuidField(payload.participantId)};break;
      case "set_role": if(!["participant","facilitator","content_manager","admin"].includes(String(payload.role))) throw new RequestError(400,"Choose a valid role."); if(payload.participantId===user.id) throw new RequestError(400,"You cannot change your own role."); data={participantId:uuidField(payload.participantId),role:payload.role};break;
      case "revoke_certificate": data={id:uuidField(payload.id),reason:textField(payload.reason,"Reason",10,500)};break;
      case "update_module": {const minutes=Number(payload.estimatedMinutes);if(!Number.isInteger(minutes)||minutes<10||minutes>1440) throw new RequestError(400,"Estimated learning time must be 10–1440 minutes.");data={id:uuidField(payload.id),estimatedMinutes:minutes};break;}
      default: throw new RequestError(400,"That operation is not available.");
    }
    const result=await admin.rpc(action.includes("assessment_release")?"assessment_release_operation":"staff_operation",{p_actor:user.id,p_action:action,p_payload:data});
    if(result.error) throw new RequestError(409,"The change could not be saved. Refresh the workspace and check the selected record.");
    return json({saved:true,...result.data});
  }catch(error) {return failure(error);}
}
