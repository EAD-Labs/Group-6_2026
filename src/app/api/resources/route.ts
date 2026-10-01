import { failure,json,readBody,RequestError,requireParticipant,textField,uuidField } from "@/features/platform/server";
import { validateTransformation } from "@/features/learning/transformer";

export async function GET() {
  try {const {client,user}=await requireParticipant();const {data,error}=await client.from("teacher_resources").select("id,title,audience,objective,source_text,output_format,draft,permission,reviewed,created_at,expires_at").eq("owner_id",user.id).gt("expires_at",new Date().toISOString()).order("updated_at",{ascending:false}).limit(50);if(error)throw new Error("Resources unavailable");return json({resources:data});}catch(error){return failure(error);}
}
export async function POST(request:Request) {
  try {
    const {client,user}=await requireParticipant();const body=await readBody(request,200000);
    let input;try{input=validateTransformation(body);}catch(e){throw new RequestError(400,e instanceof Error?e.message:"Check your source.");}
    const draft=textField(body.draft,"Draft",20,24000);
    const values={title:input.title,audience:input.audience,objective:input.objective,source_text:input.source,output_format:input.format,draft,permission:input.permission,reviewed:body.reviewed===true,updated_at:new Date().toISOString()};
    const query=body.id?client.from("teacher_resources").update(values).eq("id",uuidField(body.id)).eq("owner_id",user.id):client.from("teacher_resources").insert({...values,owner_id:user.id});
    const {data,error}=await query.select("id,expires_at").single();if(error)throw new Error("Save failed");return json({resource:data});
  }catch(error){return failure(error);}
}
export async function DELETE(request:Request) {
  try {const {client,user}=await requireParticipant();const body=await readBody(request,1000);const id=uuidField(body.id);const {error}=await client.from("teacher_resources").delete().eq("id",id).eq("owner_id",user.id);if(error)throw new Error("Deletion failed");return json({deleted:true});}catch(error){return failure(error);}
}
