import { failure,json,readBody,RequestError,requireStaff,textField,uuidField } from "@/features/platform/server";
import { createHash } from "node:crypto";
import { aggregateProgress, aggregateQuestionPatterns, type CohortRosterEntry, type ProgressRecord, type VerifiedSubmission } from "@/features/platform/reporting";
import { assessmentBanks, assessmentVersion } from "@/features/demo/server-assessment";
import { moduleOneLessons } from "@/features/learning/catalog";
import { moduleTwoLessons } from "@/features/learning/module-two-content";
import { moduleThreeLessons } from "@/features/learning/module-three-content";
import { moduleFourLessons } from "@/features/learning/module-four-content";

const reportBanks=Object.values(assessmentBanks).map((questions,index)=>({
  module:index+1,quizId:`00000000-0000-4000-8000-00000000020${index+1}`,
  // Same immutable content fingerprint used when the server grades an attempt.
  contentVersion:`${assessmentVersion}:${createHash("sha256").update(JSON.stringify(questions)).digest("hex").slice(0,16)}`,
  questions,
}));

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
    const {admin,user,role,name}=await requireStaff();
    let cohortQuery=admin.from("cohorts").select("id,title,facilitator_id,starts_on,ends_on,status").order("created_at",{ascending:false});
    if(role!=="admin") cohortQuery=cohortQuery.eq("facilitator_id",user.id);
    let contentQuery=admin.from("content_versions").select("id,module_number,lesson_slug,title,body,version,status,author_id,created_at,published_at").order("created_at",{ascending:false}).limit(100);
    if(role!=="admin") contentQuery=contentQuery.or(`author_id.eq.${user.id},status.eq.published`);
    const [cohorts,content,profiles,certificates,audit,modules]=await Promise.all([
      cohortQuery,contentQuery,
      role==="admin"?admin.from("profiles").select("id,display_name,role").order("display_name").limit(500):Promise.resolve({data:[],error:null}),
      role==="admin"?admin.from("certificates").select("id,participant_name,issued_at,revoked_at,rule_version").order("issued_at",{ascending:false}).limit(200):Promise.resolve({data:[],error:null}),
      role==="admin"?admin.from("audit_events").select("id,action,resource_id,created_at,actor_id").order("created_at",{ascending:false}).limit(100):Promise.resolve({data:[],error:null}),
      admin.from("learning_modules").select("id,title,estimated_minutes,position").order("position"),
    ]);
    if([cohorts,content,profiles,certificates,audit,modules].some(r=>r.error)) throw new Error("Programme schema unavailable");
    const reports=await Promise.all((cohorts.data??[]).map(async cohort=>{
      const evidence=await admin.rpc("staff_cohort_evidence",{p_actor:user.id,p_cohort:cohort.id});
      if(evidence.error) throw new Error("Cohort evidence unavailable");
      const {roster:privateRoster,progress,submissions}=evidence.data as {roster:CohortRosterEntry[];progress:ProgressRecord[];submissions:VerifiedSubmission[]};
      const roster=privateRoster.map(person=>({id:person.id,display_name:person.display_name}));
      const members=roster.map(person=>({cohort_id:cohort.id,participant_id:person.id}));
      // Explicit projection: raw selections/progress identities never reach the staff browser.
      return {...cohort,roster,report:aggregateProgress(members,progress),questionPatterns:aggregateQuestionPatterns(members,submissions,reportBanks)};
    }));
    return json({role,name,cohorts:reports,content:content.data,profiles:profiles.data,certificates:certificates.data,audit:audit.data,modules:modules.data});
  } catch(error) { return failure(error); }
}

export async function POST(request:Request) {
  try {
    const {admin,user,role}=await requireStaff();
    const body=await readBody(request);
    const action=textField(body.action,"Action",3,40);
    const payload=(body.payload&&typeof body.payload==="object"&&!Array.isArray(body.payload)?body.payload:{}) as Record<string,unknown>;
    if(action!=="save_content"&&role!=="admin") throw new RequestError(403,"Only an administrator can perform this action.");
    let data:Record<string,unknown>;
    switch(action) {
      case "save_content": {
        const moduleNumber=Number(payload.module);
        const lessons=[moduleOneLessons.map(l=>l.slug),moduleTwoLessons.map(l=>l.id),moduleThreeLessons.map(l=>l.id),moduleFourLessons.map(l=>l.id)];
        if(!Number.isInteger(moduleNumber)||!lessons[moduleNumber-1]?.includes(String(payload.lessonSlug))) throw new RequestError(400,"Choose a lesson from the course.");
        data={module:moduleNumber,lessonSlug:payload.lessonSlug,title:textField(payload.title,"Title",3,180),body:textField(payload.body,"Content",30,16000)}; break;
      }
      case "publish_content": case "archive_content": data={id:uuidField(payload.id)}; break;
      case "create_cohort": data=cohortDetails(payload);break;
      case "update_cohort": data={id:uuidField(payload.id),...cohortDetails(payload)};break;
      case "enrol": case "unenrol": data={cohortId:uuidField(payload.cohortId),participantId:uuidField(payload.participantId)};break;
      case "set_role": if(!["participant","facilitator","content_manager","admin"].includes(String(payload.role))) throw new RequestError(400,"Choose a valid role."); if(payload.participantId===user.id) throw new RequestError(400,"You cannot change your own role."); data={participantId:uuidField(payload.participantId),role:payload.role};break;
      case "revoke_certificate": data={id:uuidField(payload.id),reason:textField(payload.reason,"Reason",10,500)};break;
      case "update_module": {const minutes=Number(payload.estimatedMinutes);if(!Number.isInteger(minutes)||minutes<10||minutes>1440) throw new RequestError(400,"Estimated learning time must be 10–1440 minutes.");data={id:uuidField(payload.id),estimatedMinutes:minutes};break;}
      default: throw new RequestError(400,"That operation is not available.");
    }
    const result=await admin.rpc("staff_operation",{p_actor:user.id,p_action:action,p_payload:data});
    if(result.error) throw new RequestError(409,"The change could not be saved. Refresh the workspace and check the selected record.");
    return json({saved:true,...result.data});
  }catch(error) {return failure(error);}
}
