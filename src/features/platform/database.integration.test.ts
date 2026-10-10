// @vitest-environment node
import { PGlite } from "@electric-sql/pglite";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { initialDemoState, type DemoState } from "@/features/demo/demo-state";

const ids = { alice: "10000000-0000-4000-8000-000000000001", bob: "10000000-0000-4000-8000-000000000002", facilitator: "10000000-0000-4000-8000-000000000003", manager: "10000000-0000-4000-8000-000000000004", admin: "10000000-0000-4000-8000-000000000005" };
let db: PGlite;
async function asRole<T>(role: "authenticated" | "service_role" | "anon", id: string, action: () => Promise<T>): Promise<T> {
  await db.exec(`set role ${role}`);
  await db.query("select set_config('request.jwt.claim.sub', $1, false)", [id]);
  try { return await action(); } finally { await db.exec("reset role"); }
}
function progress(passed = false) {
  return Array.from({ length: 4 }, (_, i) => ({ moduleId: `00000000-0000-4000-8000-00000000000${i + 1}`, status: passed ? "passed" : "available", scorePercent: passed ? 100 : 0 }));
}
async function save(id: string, revision: number, state: DemoState = initialDemoState, passed = false) {
  return asRole("service_role", "", () => db.query<{ revision: number }>("select public.save_participant_state($1,$2,$3::jsonb,$4::jsonb,'[]'::jsonb) as revision", [id, revision, JSON.stringify(state), JSON.stringify(progress(passed))]));
}
async function operation(actor: string, action: string, payload: Record<string, unknown>) {
  const result = await asRole("service_role", "", () => db.query<{ value: { id: string } }>("select public.staff_operation($1,$2,$3::jsonb) as value", [actor, action, JSON.stringify(payload)]));
  return result.rows[0].value;
}

beforeAll(async () => {
  db = new PGlite();
  // Supabase supplies these roles, auth schema and pgcrypto digest. The local
  // SHA-256 shim uses PostgreSQL's native hash and supports the migration's only call.
  await db.exec(`
    create role anon nologin;
    create role authenticated nologin;
    create role service_role nologin bypassrls;
    create schema auth;
    create table auth.users(id uuid primary key, email text, created_at timestamptz default now(), last_sign_in_at timestamptz, raw_user_meta_data jsonb default '{}'::jsonb);
    create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid $$;
    grant usage on schema public,auth to anon,authenticated,service_role;
    grant execute on function auth.uid() to anon,authenticated,service_role;
    alter default privileges in schema public grant all on tables to service_role;
    alter default privileges in schema public grant all on sequences to service_role;
    create function public.digest(value text, algorithm text) returns bytea language sql immutable as $$ select sha256(convert_to(value,'UTF8')) $$;
  `);
  const directory = path.join(process.cwd(), "supabase/migrations");
  for (const filename of (await readdir(directory)).filter((name) => name.endsWith(".sql")).sort()) {
    await db.exec(await readFile(path.join(directory, filename), "utf8"));
  }
  for (const [name, id] of Object.entries(ids)) {
    await db.query("insert into auth.users(id,email) values($1,$2)", [id, `${name}@example.test`]);
  }
  for (const [name, role] of [["facilitator", "facilitator"], ["manager", "content_manager"], ["admin", "admin"]] as const) {
    await db.query("update public.profiles set role=$1::public.app_role where id=$2", [role, ids[name]]);
  }
}, 30_000);
afterAll(async () => { await db?.close(); });

describe("migrated PostgreSQL permissions and transaction behavior", () => {
  it("applies every migration and isolates private state for two participants and staff", async () => {
    await save(ids.alice, 0, { ...initialDemoState, displayName: "Alice private" });
    await save(ids.bob, 0, { ...initialDemoState, displayName: "Bob private" });
    const alice = await asRole("authenticated", ids.alice, () => db.query<{ participant_id: string }>("select participant_id from public.participant_states"));
    expect(alice.rows).toEqual([{ participant_id: ids.alice }]);
    const bob = await asRole("authenticated", ids.bob, () => db.query<{ display_name: string }>("select display_name from public.profiles"));
    expect(bob.rows).toEqual([{ display_name: "Bob private" }]);
    const admin = await asRole("authenticated", ids.admin, () => db.query("select * from public.participant_states"));
    expect(admin.rows).toHaveLength(0);
  });
  it("blocks direct privilege escalation, forged progress and direct trusted RPC execution", async () => {
    await expect(asRole("authenticated", ids.alice, () => db.query("update public.profiles set role='admin' where id=$1", [ids.alice]))).rejects.toThrow(/permission denied/);
    await expect(asRole("authenticated", ids.alice, () => db.query("update public.module_progress set status='passed' where participant_id=$1", [ids.alice]))).rejects.toThrow(/permission denied/);
    await expect(asRole("authenticated", ids.alice, () => db.query("select public.save_participant_state($1,1,'{}','[]','[]')", [ids.alice]))).rejects.toThrow(/permission denied/);
    await expect(asRole("anon", "", () => db.query("select * from public.participant_states"))).rejects.toThrow(/permission denied/);
  });
  it("rolls back all writes when the expected revision conflicts", async () => {
    await expect(save(ids.alice, 0, { ...initialDemoState, displayName: "Must not replace Alice" }, true)).rejects.toThrow(/revision_conflict/);
    const profile = await db.query<{ display_name: string }>("select display_name from public.profiles where id=$1", [ids.alice]);
    const snapshot = await db.query<{ revision: number }>("select revision from public.participant_states where participant_id=$1", [ids.alice]);
    expect(profile.rows[0].display_name).toBe("Alice private"); expect(Number(snapshot.rows[0].revision)).toBe(1);
  });
  it("rolls back the profile and revision when a later assistant write violates ownership", async () => {
    const assistantId = "20000000-0000-4000-8000-000000000001";
    await db.query("insert into public.assistant_specs(id,participant_id,spec) values($1,$2,'{}')", [assistantId, ids.bob]);
    const state = { ...initialDemoState, displayName: "Invalid edit", assistants: [{ id: assistantId } as DemoState["assistants"][number]] };
    await expect(save(ids.alice, 1, state)).rejects.toThrow(/ownership conflict/);
    const profile = await db.query<{ display_name: string }>("select display_name from public.profiles where id=$1", [ids.alice]);
    expect(profile.rows[0].display_name).toBe("Alice private");
  });
  it("retains valid content versions and restricts publication and roles to admins", async () => {
    const draft = await operation(ids.facilitator, "save_content", { module: 1, lessonSlug: "meet-generative-ai", title: "Approved lesson note", body: "A facilitator-authored note with sufficient explanatory detail." });
    await expect(operation(ids.facilitator, "publish_content", { id: draft.id })).rejects.toThrow(/Administrator/);
    await expect(operation(ids.manager, "set_role", { participantId: ids.bob, role: "admin" })).rejects.toThrow(/Administrator/);
    await operation(ids.admin, "publish_content", { id: draft.id });
    const visible = await asRole("authenticated", ids.alice, () => db.query("select id from public.content_versions where status='published'"));
    expect(visible.rows).toEqual([{ id: draft.id }]);
    await expect(operation(ids.alice, "save_content", { module: 1 })).rejects.toThrow(/Staff access required/);
  });
  it("denies certificate issuance for an incomplete or directly forged record", async () => {
    await expect(asRole("service_role", "", () => db.query("select public.issue_completion_certificate($1)", [ids.bob]))).rejects.toThrow(/Complete every module/);
    await expect(asRole("authenticated", ids.bob, () => db.query("select public.issue_completion_certificate($1)", [ids.bob]))).rejects.toThrow(/permission denied/);
  });
  it("issues one certificate per verified course record and preserves audited revocation", async () => {
    await save(ids.alice, 1, { ...initialDemoState, displayName: "Alice Teacher", safeUseAccepted: true, onboardingCompleted: true }, true);
    const issue = () => asRole("service_role", "", () => db.query<{ id: string; revoked_at: string | null }>("select (public.issue_completion_certificate($1)).*", [ids.alice]));
    const first = (await issue()).rows[0]; const second = (await issue()).rows[0];
    expect(first.id).toBe(second.id);
    const audit = await db.query("select * from public.audit_events where action='issue_certificate' and resource_id=$1", [first.id]); expect(audit.rows).toHaveLength(1);
    await operation(ids.admin, "revoke_certificate", { id: first.id, reason: "Participant requested a corrected completion record." });
    expect((await issue()).rows[0].revoked_at).not.toBeNull();
    const other = await asRole("authenticated", ids.bob, () => db.query("select * from public.certificates")); expect(other.rows).toHaveLength(0);
  });
  it("checks saved consent within the certificate transaction", async () => {
    await save(ids.bob, 1, { ...initialDemoState, displayName: "Bob Teacher", safeUseAccepted: false, onboardingCompleted: true }, true);
    await expect(asRole("service_role", "", () => db.query("select public.issue_completion_certificate($1)", [ids.bob]))).rejects.toThrow(/safe-use acknowledgement/);
  });
  it("restricts cohort visibility to enrolled participants and assigned facilitators", async () => {
    const assigned = await operation(ids.admin, "create_cohort", { title: "Assigned pilot", facilitatorId: ids.facilitator });
    const other = await operation(ids.admin, "create_cohort", { title: "Other pilot", facilitatorId: ids.admin });
    await operation(ids.admin, "enrol", { cohortId: assigned.id, participantId: ids.alice });
    await operation(ids.admin, "enrol", { cohortId: other.id, participantId: ids.bob });
    for (const id of [ids.facilitator, ids.alice]) {
      const result = await asRole("authenticated", id, () => db.query("select id from public.cohorts"));
      expect(result.rows).toEqual([{ id: assigned.id }]);
    }
    await expect(operation(ids.admin, "create_cohort", { title: "Invalid manager assignment", facilitatorId: ids.manager })).rejects.toThrow(/facilitator or administrator/);
    await expect(operation(ids.facilitator, "enrol", { cohortId: other.id, participantId: ids.alice })).rejects.toThrow(/Administrator access/);
  });
  it("saves the complete private resource brief, permits owner edits and prevents transfers", async () => {
    const source = "A fictional teacher-owned source about evaporation, condensation and how water moves through a classroom model.";
    const result = await asRole("authenticated", ids.alice, () => db.query<{ id: string; audience: string; objective: string }>(
      "insert into public.teacher_resources(owner_id,title,audience,objective,source_text,output_format,draft,permission) values($1,'Water cycle','Class 6','Explain water movement',$2,'summary','An editable classroom draft','own') returning id,audience,objective", [ids.alice, source]));
    const resource = result.rows[0]; expect(resource.audience).toBe("Class 6"); expect(resource.objective).toBe("Explain water movement");
    const other = await asRole("authenticated", ids.bob, () => db.query("select * from public.teacher_resources")); expect(other.rows).toHaveLength(0);
    const admin = await asRole("authenticated", ids.admin, () => db.query("select * from public.teacher_resources")); expect(admin.rows).toHaveLength(0);
    const changed = await asRole("authenticated", ids.alice, () => db.query<{ audience: string }>("update public.teacher_resources set audience='Class 7',objective='Compare evaporation rates' where id=$1 returning audience", [resource.id]));
    expect(changed.rows[0].audience).toBe("Class 7");
    await expect(asRole("authenticated", ids.alice, () => db.query("update public.teacher_resources set owner_id=$1 where id=$2", [ids.bob, resource.id]))).rejects.toThrow(/permission denied/);
    await expect(asRole("authenticated", ids.alice, () => db.query("update public.teacher_resources set expires_at=now()+interval '365 days' where id=$1", [resource.id]))).rejects.toThrow(/permission denied/);
    await asRole("authenticated", ids.bob, () => db.query("delete from public.teacher_resources where id=$1", [resource.id]));
    expect((await db.query("select id from public.teacher_resources where id=$1", [resource.id])).rows).toHaveLength(1);
    await asRole("authenticated", ids.alice, () => db.query("delete from public.teacher_resources where id=$1", [resource.id]));
    expect((await db.query("select id from public.teacher_resources where id=$1", [resource.id])).rows).toHaveLength(0);
  });
  it("hides expired resources and physically deletes them during cleanup", async () => {
    const source = "A fictional teaching source long enough for retention and privacy testing without containing real learner data.";
    const inserted = await db.query<{ id: string }>("insert into public.teacher_resources(owner_id,title,audience,objective,source_text,output_format,draft,permission,expires_at) values($1,'Expired source','Class 6','Explain the evidence',$2,'summary','Editable practice draft','own',now()-interval '1 minute') returning id", [ids.alice, source]);
    const id = inserted.rows[0].id;
    expect((await asRole("authenticated", ids.alice, () => db.query("select id from public.teacher_resources where id=$1", [id]))).rows).toHaveLength(0);
    await expect(asRole("authenticated", ids.alice, () => db.query("insert into public.teacher_resources(owner_id,title,audience,objective,source_text,output_format,draft,permission,expires_at) values($1,'Too long','Class 6','Explain the evidence',$2,'summary','Draft','own',now()+interval '31 days')", [ids.alice, source]))).rejects.toThrow(/row-level security/);
    await asRole("service_role", "", () => db.query("select public.cleanup_expired_learning_data()"));
    expect((await db.query("select id from public.teacher_resources where id=$1", [id])).rows).toHaveLength(0);
  });
  it("counts shared AI quotas per authenticated participant and denies direct quota bypass", async () => {
    const take = (id: string) => asRole("service_role", "", () => db.query<{ allowed: boolean }>("select public.consume_ai_rate_limit($1,'assistant',6) as allowed", [id]));
    for (let attempt = 0; attempt < 6; attempt++) expect((await take(ids.alice)).rows[0].allowed).toBe(true);
    expect((await take(ids.alice)).rows[0].allowed).toBe(false);
    expect((await take(ids.bob)).rows[0].allowed).toBe(true);
    await expect(asRole("authenticated", ids.alice, () => db.query("select public.consume_ai_rate_limit($1,'assistant',1000)", [ids.alice]))).rejects.toThrow(/permission denied/);
  });
  it("stores checked CRAFT text privately, blocks forged feedback, and cascades account deletion", async () => {
    const participant = "10000000-0000-4000-8000-000000000098";
    await db.query("insert into auth.users(id,email) values($1,'craft-owner@example.test')", [participant]);
    const insert = (owner: string) => db.query<{ id: string }>(
      "insert into public.craft_prompt_attempts(participant_id,scenario_id,task_source,task_fingerprint,prompt_fingerprint,task_text,prompt_text,evaluation,dimension_scores,overall_score,score_percent,evaluation_source,model) values($1,'custom','custom',repeat('a',64),repeat('b',64),'Plan a fictional lesson','Write a lesson plan for Class 6.', '{\"summary\":\"Private feedback\"}', '{}',10,67,'rule-based','checklist') returning id", [owner]);
    const record = (await asRole("service_role", "", () => insert(participant))).rows[0];
    const read = (owner: string) => asRole("authenticated", owner, () => db.query<{ task_text: string; prompt_text: string }>("select task_text,prompt_text from public.craft_prompt_attempts where id=$1", [record.id]));
    expect((await read(participant)).rows).toEqual([{ task_text: "Plan a fictional lesson", prompt_text: "Write a lesson plan for Class 6." }]);
    for (const other of [ids.alice, ids.bob, ids.admin, ids.facilitator]) expect((await read(other)).rows).toHaveLength(0);
    await expect(asRole("authenticated", participant, () => insert(participant))).rejects.toThrow(/permission denied/);
    await expect(asRole("anon", "", () => db.query("select * from public.craft_prompt_attempts"))).rejects.toThrow(/permission denied/);
    await db.query("delete from auth.users where id=$1", [participant]);
    expect((await db.query("select id from public.craft_prompt_attempts where id=$1", [record.id])).rows).toHaveLength(0);
  });
  it("removes owned resources, progress and private snapshots when an account is deleted", async () => {
    const temporary = "10000000-0000-4000-8000-000000000099";
    await db.query("insert into auth.users(id,email) values($1,'temporary@example.test')", [temporary]);
    await save(temporary, 0);
    await db.query("insert into public.teacher_resources(owner_id,title,audience,objective,source_text,output_format,draft,permission) values($1,'Temporary source','Class 6','Explain the source evidence',$2,'summary','Draft','own')", [temporary, "Fictional teacher-owned source material containing no learner information, written only to test account deletion and private data retention."]);
    await db.query("delete from auth.users where id=$1", [temporary]);
    for (const [table, column] of [["profiles", "id"], ["participant_states", "participant_id"], ["module_progress", "participant_id"], ["teacher_resources", "owner_id"]]) {
      expect((await db.query(`select * from public.${table} where ${column}=$1`, [temporary])).rows).toHaveLength(0);
    }
  });
  it("reassigns cohort access atomically and keeps staff roster evidence scoped", async () => {
    const replacement = "10000000-0000-4000-8000-000000000006";
    await db.query("insert into auth.users(id,email) values($1,'replacement@example.test')", [replacement]);
    await db.query("update public.profiles set role='facilitator' where id=$1", [replacement]);
    const cohort = await operation(ids.admin, "create_cohort", { title: "Correctable cohort", facilitatorId: ids.facilitator });
    await operation(ids.admin,"enrol",{cohortId:cohort.id,participantId:ids.alice});
    const evidence = async (actor:string) => (await asRole("service_role","",()=>db.query<{evidence:{roster:{id:string;display_name:string}[];submissions:{participant_id:string}[]}}>("select public.staff_cohort_evidence($1,$2) as evidence",[actor,cohort.id]))).rows[0].evidence;
    await db.query("insert into public.verified_quiz_submissions(participant_id,attempt_id,quiz_id,content_version,answers,score_percent,passed,submitted_at) values($1,'roster-scope','00000000-0000-4000-8000-000000000201','test-version','{}',0,false,now()),($2,'roster-scope','00000000-0000-4000-8000-000000000201','test-version','{}',0,false,now())",[ids.alice,ids.bob]);
    const before=await evidence(ids.facilitator);
    expect(before.roster).toEqual([{id:ids.alice,display_name:"Alice Teacher"}]);
    expect(before.submissions.map(row=>row.participant_id)).toEqual([ids.alice]);
    expect(Object.keys(before.roster[0]).sort()).toEqual(["display_name","id"]);
    await expect(evidence(ids.manager)).rejects.toThrow(/Cohort access denied/);
    await expect(evidence(ids.alice)).rejects.toThrow(/Staff access required/);
    await expect(asRole("authenticated",ids.facilitator,()=>db.query("select public.staff_cohort_evidence($1,$2)",[ids.facilitator,cohort.id]))).rejects.toThrow(/permission denied/);
    expect((await asRole("authenticated",ids.facilitator,()=>db.query("select * from public.verified_quiz_submissions"))).rows).toHaveLength(0);
    const update={id:cohort.id,title:"Reassigned cohort",facilitatorId:replacement,startsOn:"2026-10-02",endsOn:"2026-10-20",status:"planned"};
    await expect(operation(ids.facilitator,"update_cohort",update)).rejects.toThrow(/Administrator access/);
    await expect(operation(ids.admin,"update_cohort",{...update,facilitatorId:ids.manager})).rejects.toThrow(/facilitator or administrator/);
    await expect(operation(ids.admin,"update_cohort",{...update,endsOn:"2026-10-01"})).rejects.toThrow(/check constraint/);
    await expect(operation(ids.admin,"update_cohort",{...update,title:"   "})).rejects.toThrow(/check constraint/);
    expect((await evidence(ids.facilitator)).roster).toHaveLength(1);
    await operation(ids.admin,"update_cohort",update);
    await expect(evidence(ids.facilitator)).rejects.toThrow(/Cohort access denied/);
    expect((await evidence(replacement)).roster).toHaveLength(1);
    const saved=await db.query<{title:string;facilitator_id:string;starts_on:string;ends_on:string;status:string}>("select title,facilitator_id,starts_on::text,ends_on::text,status from public.cohorts where id=$1",[cohort.id]);
    expect(saved.rows[0]).toEqual({title:update.title,facilitator_id:replacement,starts_on:update.startsOn,ends_on:update.endsOn,status:"planned"});
    await expect(operation(replacement,"unenrol",{cohortId:cohort.id,participantId:ids.alice})).rejects.toThrow(/Administrator access/);
    await operation(ids.admin,"unenrol",{cohortId:cohort.id,participantId:ids.alice});
    expect((await evidence(replacement)).roster).toHaveLength(0);
    expect((await evidence(replacement)).submissions).toHaveLength(0);
    expect((await db.query("select participant_id from public.participant_states where participant_id=$1",[ids.alice])).rows).toHaveLength(1);
    const audit=await db.query<{action:string}>("select action from public.audit_events where resource_id=$1 and action in ('update_cohort','unenrol') order by id",[cohort.id]);
    expect(audit.rows.map(row=>row.action)).toEqual(["update_cohort","unenrol"]);
  });

});


describe("pilot learning activity boundaries", () => {
  const eventId = "90000000-0000-4000-8000-000000000001";
  const event = { id: eventId, sessionId: "90000000-0000-4000-8000-000000000002", kind: "page_time", path: "/dashboard", activeMs: 2500, occurredAt: new Date().toISOString() };
  it("allows only service writes, deduplicates retries and isolates owner reads", async () => {
    const write = () => asRole("service_role", "", () => db.query<{ n: number }>("select public.record_learning_events($1,$2::jsonb) as n", [ids.alice, JSON.stringify([event])]));
    expect((await write()).rows[0].n).toBe(1); expect((await write()).rows[0].n).toBe(0);
    await expect(asRole("authenticated", ids.alice, () => db.query("select public.record_learning_events($1,$2::jsonb)", [ids.alice, JSON.stringify([event])]))).rejects.toThrow(/permission denied/);
    expect((await asRole("authenticated", ids.alice, () => db.query("select id from public.learning_events"))).rows).toHaveLength(1);
    expect((await asRole("authenticated", ids.bob, () => db.query("select id from public.learning_events"))).rows).toHaveLength(0);
    expect((await asRole("authenticated", ids.admin, () => db.query("select id from public.learning_events"))).rows).toHaveLength(0);
  });
  it("projects every registered user only for administrators, including users without cohort membership", async () => {
    const query = (actor: string) => asRole("service_role", "", () => db.query<{ value: { total: number; people: { email: string; activeMs: number }[] } }>("select public.admin_learning_roster($1,'alice',0) as value", [actor]));
    await expect(query(ids.facilitator)).rejects.toThrow(/Administrator/);
    const report = (await query(ids.admin)).rows[0].value;
    expect(report.total).toBe(1); expect(report.people[0].email).toBe("alice@example.test"); expect(report.people[0].activeMs).toBe(2500);
    expect(JSON.stringify(report)).not.toContain("private");
  });
  it("aggregates wrong checks and active time until first correct, preserving a paginated timeline separately", async () => {
    const sessionId = "90000000-0000-4000-8000-000000000002";
    const base = { sessionId, attemptId: sessionId, module: 1, questionId: "m1-q1", path: "/learn/module-1/quiz", contentVersion: "test-version" };
    const events = [
      { ...base, id: "90000000-0000-4000-8000-000000000003", kind: "question_view", activeMs: 0, occurredAt: "2026-10-06T10:00:00Z" },
      { ...base, id: "90000000-0000-4000-8000-000000000004", kind: "question_answer", correct: false, selectedOptions: ["a"], activeMs: 5000, occurredAt: "2026-10-06T10:00:05Z" },
      { ...base, id: "90000000-0000-4000-8000-000000000005", kind: "question_answer", correct: true, selectedOptions: ["b"], activeMs: 3000, occurredAt: "2026-10-06T10:01:00Z" },
      { ...base, id: "90000000-0000-4000-8000-000000000006", kind: "question_answer", correct: false, selectedOptions: ["a"], activeMs: 2000, occurredAt: "2026-10-06T10:02:00Z" },
    ];
    await asRole("service_role", "", () => db.query("select public.record_learning_events($1,$2::jsonb)", [ids.alice, JSON.stringify(events)]));
    const read = (actor: string) => asRole("service_role", "", () => db.query<{ value: { questions: { wrongChecks: number; checks: number; activeToCorrectMs: number; elapsedToCorrectMs: number }[] } }>("select public.admin_learning_detail($1,$2) as value", [actor, ids.alice]));
    await expect(read(ids.bob)).rejects.toThrow(/Administrator/);
    const detail = (await read(ids.admin)).rows[0].value;
    expect(detail.questions[0]).toMatchObject({ wrongChecks: 1, checks: 3, activeToCorrectMs: 8000, elapsedToCorrectMs: 60000 });
  });
});
