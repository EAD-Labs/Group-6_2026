import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/admin";
import { uuidPattern } from "@/features/platform/server";
import { Brand } from "@/components/ui/brand";
export const dynamic="force-dynamic";
export default async function VerifyPage({params}:{params:Promise<{id:string}>}) {
  const {id}=await params;
  let record:{id:string;issued_at:string;revoked_at:string|null;rule_version:string}|null=null;let unavailable=false;
  if(uuidPattern.test(id)){try{const {data,error}=await createAdminClient().from("certificates").select("id,issued_at,revoked_at,rule_version").eq("id",id).maybeSingle();if(error)unavailable=true;else record=data;}catch{unavailable=true;}}
  return <main className="public-document" id="main-content"><Brand/><span className="eyebrow">Completion record verification</span><h1>{unavailable?"Verification is temporarily unavailable":!record?"We couldn’t find that record":record.revoked_at?"This record has been revoked":"A valid PromptShala completion record"}</h1><p>{unavailable?"Please try again later. We cannot confirm this record while the certificate service is unavailable.":!record?"Check the full verification address printed on the certificate.":record.revoked_at?"This certificate is no longer valid. Contact the programme facilitator for help.":"This record was issued after the account completed all four learning modules, knowledge checks and required practice evidence."}</p>{record?<dl className="record-details"><dt>Record</dt><dd>{record.id}</dd><dt>Issued</dt><dd>{new Date(record.issued_at).toLocaleDateString("en-GB")}</dd><dt>Course rule</dt><dd>{record.rule_version}</dd></dl>:null}<p className="platform-fineprint">Public verification does not reveal the participant’s private learning records. Completion is not accreditation.</p><Link className="button button-primary" href="/">Explore PromptShala</Link></main>;
}
