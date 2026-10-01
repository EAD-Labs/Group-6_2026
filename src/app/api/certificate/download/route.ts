import { readFile } from "node:fs/promises";
import path from "node:path";
import { failure,RequestError,requireParticipant } from "@/features/platform/server";
import { buildCertificatePdf, CertificateNameError } from "@/features/platform/certificate-pdf";

export async function GET(request:Request) {
  try {
    const {client,user}=await requireParticipant();
    const {data,error}=await client.from("certificates").select("id,participant_name,issued_at,revoked_at,rule_version").eq("participant_id",user.id).eq("rule_version","2026-09-open-course-v1").maybeSingle();
    if(error) throw new Error("Certificate service unavailable");
    if(!data) throw new RequestError(404,"Request your certificate after completing the course.");
    if(data.revoked_at) throw new RequestError(410,"This completion record has been revoked.");
    const [latin,devanagari]=await Promise.all(["NotoSans-Regular.ttf","NotoSansDevanagari-Regular.ttf"].map(font=>readFile(path.join(process.cwd(),"public","fonts",font))));
    const bytes=await buildCertificatePdf(data,{latin,devanagari},`${new URL(request.url).origin}/verify/${data.id}`);
    return new Response(new Uint8Array(bytes),{headers:{"Content-Type":"application/pdf","Content-Disposition":`attachment; filename="PromptShala-${data.id}.pdf"`,"Cache-Control":"private, no-store","X-Content-Type-Options":"nosniff"}});
  }catch(error){return failure(error instanceof CertificateNameError ? new RequestError(422,error.message) : error);}
}
