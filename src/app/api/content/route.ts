import { failure,json,requireParticipant,RequestError } from "@/features/platform/server";

export async function GET(request:Request) {
  try {
    const {client}=await requireParticipant();
    const url=new URL(request.url), moduleNumber=Number(url.searchParams.get("module")), slug=url.searchParams.get("lesson");
    if(![1,2,3,4].includes(moduleNumber)||!slug||!/^[a-z0-9-]{3,120}$/.test(slug)) throw new RequestError(400,"Choose a course lesson.");
    // Several applicable updates can coexist: a global update and updates for
    // the learner's own groups. RLS excludes drafts and every other cohort.
    const {data,error}=await client.from("content_versions").select("id,title,body,package,cohort_id,version,published_at").eq("module_number",moduleNumber).eq("lesson_slug",slug).eq("status","published").order("version",{ascending:true});
    if(error) throw new Error("Content unavailable");
    const contents=[...(data??[])].sort((left,right)=>Number(Boolean(left.cohort_id))-Number(Boolean(right.cohort_id))||left.version-right.version);
    return json({content:contents[0]??null,contents});
  }catch(error) {return failure(error);}
}
