// @vitest-environment node
import { PGlite } from "@electric-sql/pglite";
import { readdir,readFile } from "node:fs/promises";
import path from "node:path";
import { beforeAll,afterAll,describe,expect,it } from "vitest";
import { baseAssessmentBanks,releaseContentVersion } from "./assessment-release";
const ids={alice:"80000000-0000-4000-8000-000000000001",bob:"80000000-0000-4000-8000-000000000002",facilitator:"80000000-0000-4000-8000-000000000003",admin:"80000000-0000-4000-8000-000000000004"};
let db:PGlite;
const draft=(passThresholdPercent=90)=>({module:1,title:"Reviewed classroom questions",passThresholdPercent,questions:baseAssessmentBanks[0].slice(0,5)});
async function role<T>(name:"service_role"|"authenticated"|"anon",id:string,run:()=>Promise<T>){await db.exec(`set role ${name}`);await db.query("select set_config('request.jwt.claim.sub',$1,false)",[id]);try{return await run();}finally{await db.exec("reset role");}}
async function operation(actor:string,action:string,payload:Record<string,unknown>){return(await role("service_role","",()=>db.query<{value:{id:string;version:number}}>("select public.assessment_release_operation($1,$2,$3::jsonb) as value",[actor,action,JSON.stringify(payload)]))).rows[0].value;}
beforeAll(async()=>{
  db=new PGlite();await db.exec(`create role anon nologin;create role authenticated nologin;create role service_role nologin bypassrls;create schema auth;
    create table auth.users(id uuid primary key,email text,created_at timestamptz default now(),last_sign_in_at timestamptz,raw_user_meta_data jsonb default '{}'::jsonb);
    create function auth.uid() returns uuid language sql stable as $$select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid$$;
    grant usage on schema public,auth to anon,authenticated,service_role;grant execute on function auth.uid() to anon,authenticated,service_role;
    alter default privileges in schema public grant all on tables to service_role;alter default privileges in schema public grant all on sequences to service_role;
    create function public.digest(value text,algorithm text) returns bytea language sql immutable as $$select sha256(convert_to(value,'UTF8'))$$;`);
  const directory=path.join(process.cwd(),"supabase/migrations");for(const filename of(await readdir(directory)).filter(file=>file.endsWith(".sql")).sort())await db.exec(await readFile(path.join(directory,filename),"utf8"));
  for(const[name,id]of Object.entries(ids))await db.query("insert into auth.users(id,email) values($1,$2)",[id,`${name}@example.test`]);
  await db.query("update public.profiles set role='admin' where id=$1",[ids.admin]);await db.query("update public.profiles set role='facilitator' where id=$1",[ids.facilitator]);
},30000);
afterAll(async()=>{await db?.close();});
describe("immutable assessment release schema",()=>{
  it("permits staff drafts, denies participant writes, and reserves publication for administrators",async()=>{
    const release=await operation(ids.facilitator,"save_assessment_release",draft());
    await expect(operation(ids.alice,"save_assessment_release",draft())).rejects.toThrow(/Staff/);
    await expect(operation(ids.facilitator,"publish_assessment_release",{id:release.id})).rejects.toThrow(/Administrator/);
    expect((await role("authenticated",ids.alice,()=>db.query("select id from public.assessment_releases"))).rows).toHaveLength(0);
    await expect(role("authenticated",ids.admin,()=>db.query("select public.assessment_release_operation($1,'publish_assessment_release',$2::jsonb)",[ids.admin,JSON.stringify({id:release.id})]))).rejects.toThrow(/permission denied/);
    await operation(ids.admin,"publish_assessment_release",{id:release.id});
    expect((await role("authenticated",ids.alice,()=>db.query("select id from public.assessment_releases"))).rows).toEqual([{id:release.id}]);
    await expect(db.query("update public.assessment_releases set pass_threshold=70 where id=$1",[release.id])).rejects.toThrow(/immutable/);
    await expect(db.query("delete from public.assessment_releases where id=$1",[release.id])).rejects.toThrow(/cannot be deleted/);
  });
  it("captures the actual threshold and immutable bank with each graded attempt and preserves historical access",async()=>{
    const first=await operation(ids.admin,"save_assessment_release",draft());await operation(ids.admin,"publish_assessment_release",{id:first.id});
    await role("service_role","",()=>db.query("insert into public.verified_quiz_submissions(participant_id,attempt_id,quiz_id,content_version,answers,score_percent,passed,submitted_at) values($1,'attempt-under-threshold','00000000-0000-4000-8000-000000000201',$2,'{}',80,true,now())",[ids.alice,releaseContentVersion(first.id)]));
    expect((await db.query("select passed,pass_threshold,assessment_release_id from public.verified_quiz_submissions where attempt_id='attempt-under-threshold'")).rows[0]).toEqual({passed:false,pass_threshold:90,assessment_release_id:first.id});
    const next=await operation(ids.admin,"save_assessment_release",draft(100));await operation(ids.admin,"publish_assessment_release",{id:next.id});
    expect((await role("authenticated",ids.alice,()=>db.query("select id from public.assessment_releases where id=$1",[first.id]))).rows).toHaveLength(1);
    expect((await role("authenticated",ids.bob,()=>db.query("select id from public.assessment_releases where id=$1",[first.id]))).rows).toHaveLength(0);
    await expect(db.exec("update public.verified_quiz_submissions set passed=true where attempt_id='attempt-under-threshold'")).rejects.toThrow(/immutable/);
    await expect(role("authenticated",ids.alice,()=>db.query("update public.verified_quiz_submissions set pass_threshold=70 where participant_id=$1",[ids.alice]))).rejects.toThrow(/permission denied/);
  });
  it("validates thresholds, question structure and lesson membership inside the service transaction",async()=>{
    await expect(operation(ids.admin,"save_assessment_release",draft(69))).rejects.toThrow();
    await expect(operation(ids.admin,"save_assessment_release",{...draft(),questions:[...draft().questions.slice(0,4),draft().questions[0]]})).rejects.toThrow(/Duplicate question/);
    const malformed=structuredClone(draft());malformed.questions[0].correctOptionIds=["unknown"];
    await expect(operation(ids.admin,"save_assessment_release",malformed)).rejects.toThrow(/Correct choice/);
    const unrelated=structuredClone(draft());unrelated.questions[0].lessonSlug="other-module-lesson";
    await expect(operation(ids.admin,"save_assessment_release",unrelated)).rejects.toThrow(/lesson/);
    const reserved=structuredClone(draft());reserved.questions[0].id="constructor";await expect(operation(ids.admin,"save_assessment_release",reserved)).rejects.toThrow(/Invalid question/);
  });
  it("commits a private grading receipt before a release changes and permits later idempotent state persistence",async()=>{
    const release=await operation(ids.admin,"save_assessment_release",draft());await operation(ids.admin,"publish_assessment_release",{id:release.id});
    const answers=Object.fromEntries(draft().questions.map(question=>[question.id,question.correctOptionIds]));
    const receipt={id:"receipt-for-recovery",contentVersion:releaseContentVersion(release.id),answers,passThresholdPercent:90,scorePercent:100,correctAnswers:5,passed:true,attemptedAt:"2026-10-15T00:00:00Z"};
    await role("service_role","",()=>db.query("insert into public.verified_quiz_submissions(participant_id,attempt_id,quiz_id,content_version,answers,score_percent,passed,submitted_at,grading_receipt) values($1,$2,'00000000-0000-4000-8000-000000000201',$3,$4::jsonb,100,true,now(),$5::jsonb)",[ids.bob,receipt.id,receipt.contentVersion,JSON.stringify(answers),JSON.stringify(receipt)]));
    const next=await operation(ids.admin,"save_assessment_release",draft(100));await operation(ids.admin,"publish_assessment_release",{id:next.id});
    await db.query("insert into public.verified_quiz_submissions(participant_id,attempt_id,quiz_id,content_version,answers,score_percent,passed,submitted_at) values($1,$2,'00000000-0000-4000-8000-000000000201',$3,$4::jsonb,100,true,now()) on conflict(participant_id,attempt_id) do nothing",[ids.bob,receipt.id,receipt.contentVersion,JSON.stringify(answers)]);
    expect((await role("authenticated",ids.bob,()=>db.query("select grading_receipt from public.verified_quiz_submissions where attempt_id=$1",[receipt.id]))).rows).toEqual([{grading_receipt:receipt}]);
    expect((await role("authenticated",ids.alice,()=>db.query("select grading_receipt from public.verified_quiz_submissions where attempt_id=$1",[receipt.id]))).rows).toHaveLength(0);
    await expect(db.query("insert into public.verified_quiz_submissions(participant_id,attempt_id,quiz_id,content_version,answers,score_percent,passed,submitted_at,grading_receipt) values($1,'late-receipt','00000000-0000-4000-8000-000000000201',$2,$3::jsonb,100,true,now(),$4::jsonb)",[ids.bob,receipt.contentVersion,JSON.stringify(answers),JSON.stringify({...receipt,id:"late-receipt"})])).rejects.toThrow(/publication changed/);
  });
  it("freezes certificate assessment evidence and leaves the baseline bank usable after archiving",async()=>{
    const release=await operation(ids.admin,"save_assessment_release",draft(90));await operation(ids.admin,"publish_assessment_release",{id:release.id});
    await db.query("insert into public.verified_quiz_submissions(participant_id,attempt_id,quiz_id,content_version,answers,score_percent,passed,submitted_at) values($1,'passing-attempt','00000000-0000-4000-8000-000000000201',$2,'{}',100,true,now())",[ids.alice,releaseContentVersion(release.id)]);
    const certificate=await db.query<{assessment_evidence:unknown}>("insert into public.certificates(participant_id,participant_name) values($1,'Synthetic teacher') returning assessment_evidence",[ids.alice]);
    expect(certificate.rows[0].assessment_evidence).toEqual([{module:1,contentVersion:releaseContentVersion(release.id),passThresholdPercent:90,scorePercent:100}]);
    await expect(db.query("update public.certificates set assessment_evidence='[]'::jsonb where participant_id=$1",[ids.alice])).rejects.toThrow(/immutable/);
    await operation(ids.admin,"archive_assessment_release",{id:release.id});
    expect((await role("authenticated",ids.bob,()=>db.query("select id from public.assessment_releases where status='published'"))).rows).toHaveLength(0);
    expect((await db.query("select assessment_evidence from public.certificates where participant_id=$1",[ids.alice])).rows[0]).toEqual(certificate.rows[0]);
  });
});
