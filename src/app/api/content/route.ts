import { failure,json,requireParticipant,RequestError } from "@/features/platform/server";

export async function GET(request:Request) {
  try {
    const {client}=await requireParticipant();
    const url=new URL(request.url), moduleNumber=Number(url.searchParams.get("module")), slug=url.searchParams.get("lesson");
    if(![1,2,3,4].includes(moduleNumber)||!slug||!/^[a-z0-9-]{3,120}$/.test(slug)) throw new RequestError(400,"Choose a course lesson.");
    const {data,error}=await client.from("content_versions").select("id,title,body,version,published_at").eq("module_number",moduleNumber).eq("lesson_slug",slug).eq("status","published").maybeSingle();
    if(error) throw new Error("Content unavailable");
    return json({content:data});
  }catch(error) {return failure(error);}
}
