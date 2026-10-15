// @vitest-environment node
import { PGlite } from "@electric-sql/pglite";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { authoringLessons } from "./lesson-package";

const ids = { alice: "70000000-0000-4000-8000-000000000001", bob: "70000000-0000-4000-8000-000000000002", facilitator: "70000000-0000-4000-8000-000000000003", manager: "70000000-0000-4000-8000-000000000004", admin: "70000000-0000-4000-8000-000000000005" };
let db: PGlite, ownGroup: string, otherGroup: string;
const payload = (cohortId = "") => ({ module: 1, lessonSlug: authoringLessons[0][0].id, title: "Teacher practice package", body: "Use a fictional classroom example and compare the AI answer with your source before sharing it.", cohortId, package: { schemaVersion: 1, learningGoal: "Check AI claims against a reliable source.", rightsConfirmed: true, media: [{ kind: "video", title: "A captioned worked example", url: "https://example.org/captioned-video", accessibilityNote: "Captions and an equivalent text transcript are available." }], activity: { title: "Check one questionable claim", instructions: "Read the fictional example, check one questionable claim in the source and revise it before sharing with a class.", reflection: "Which claim needed another source check?" } } });
async function role<T>(name: "service_role" | "authenticated" | "anon", user: string, action: () => Promise<T>) {
  await db.exec(`set role ${name}`); await db.query("select set_config('request.jwt.claim.sub',$1,false)", [user]);
  try { return await action(); } finally { await db.exec("reset role"); }
}
async function operation(actor: string, action: string, input: Record<string, unknown>) {
  const result = await role("service_role", "", () => db.query<{ value: { id: string; version: number } }>("select public.staff_operation($1,$2,$3::jsonb) as value", [actor, action, JSON.stringify(input)]));
  return result.rows[0].value;
}
beforeAll(async () => {
  db = new PGlite();
  await db.exec(`create role anon nologin; create role authenticated nologin; create role service_role nologin bypassrls;
    create schema auth; create table auth.users(id uuid primary key,email text,created_at timestamptz default now(),last_sign_in_at timestamptz,raw_user_meta_data jsonb default '{}'::jsonb);
    create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid $$;
    grant usage on schema public,auth to anon,authenticated,service_role; grant execute on function auth.uid() to anon,authenticated,service_role;
    alter default privileges in schema public grant all on tables to service_role; alter default privileges in schema public grant all on sequences to service_role;
    create function public.digest(value text,algorithm text) returns bytea language sql immutable as $$ select sha256(convert_to(value,'UTF8')) $$;`);
  const directory = path.join(process.cwd(), "supabase/migrations");
  for (const filename of (await readdir(directory)).filter(file => file.endsWith(".sql")).sort()) await db.exec(await readFile(path.join(directory, filename), "utf8"));
  for (const [name, id] of Object.entries(ids)) await db.query("insert into auth.users(id,email) values($1,$2)", [id, `${name}@example.test`]);
  for (const [name, grant] of [["facilitator", "facilitator"], ["manager", "content_manager"], ["admin", "admin"]] as const) await db.query("update public.profiles set role=$1::public.app_role where id=$2", [grant, ids[name]]);
  ownGroup = (await operation(ids.admin, "create_cohort", { title: "Assigned teacher group", facilitatorId: ids.facilitator })).id;
  otherGroup = (await operation(ids.admin, "create_cohort", { title: "Another teacher group", facilitatorId: "" })).id;
  await operation(ids.admin, "enrol", { cohortId: ownGroup, participantId: ids.alice });
  await operation(ids.admin, "enrol", { cohortId: otherGroup, participantId: ids.bob });
}, 30000);
afterAll(async () => { await db?.close(); });

describe("migrated lesson package permissions and version history", () => {
  it("allows assigned facilitator drafts and requires administrator publication", async () => {
    const draft = await operation(ids.facilitator, "save_lesson_package", payload(ownGroup));
    await expect(operation(ids.facilitator, "save_lesson_package", payload(otherGroup))).rejects.toThrow(/Assigned/);
    await expect(operation(ids.alice, "save_lesson_package", payload())).rejects.toThrow(/Staff/);
    await expect(operation(ids.facilitator, "publish_content", { id: draft.id })).rejects.toThrow(/Administrator/);
    await expect(operation(ids.manager, "publish_content", { id: draft.id })).rejects.toThrow(/Administrator/);
    expect((await role("authenticated", ids.alice, () => db.query("select id from public.content_versions"))).rows).toHaveLength(0);
    await operation(ids.admin, "publish_content", { id: draft.id });
    expect((await role("authenticated", ids.alice, () => db.query("select id from public.content_versions where cohort_id=$1", [ownGroup]))).rows).toEqual([{ id: draft.id }]);
    expect((await role("authenticated", ids.bob, () => db.query("select id from public.content_versions where cohort_id=$1", [ownGroup]))).rows).toHaveLength(0);
  });
  it("keeps global and each cohort publication independent while retaining replaced versions", async () => {
    const global = await operation(ids.manager, "save_lesson_package", payload());
    const first = await operation(ids.manager, "save_lesson_package", payload(otherGroup));
    const replacement = await operation(ids.manager, "save_lesson_package", { ...payload(otherGroup), title: "Revised group practice" });
    await operation(ids.admin, "publish_content", { id: global.id }); await operation(ids.admin, "publish_content", { id: first.id });
    await operation(ids.admin, "publish_content", { id: replacement.id });
    expect((await db.query("select status,title from public.content_versions where id=$1", [first.id])).rows[0]).toEqual({ status: "archived", title: "Teacher practice package" });
    const bob = await role("authenticated", ids.bob, () => db.query<{ id: string }>("select id from public.content_versions where status='published'"));
    expect(bob.rows.map(row => row.id).sort()).toEqual([global.id, replacement.id].sort());
    expect((await db.query<{count:number}>("select count(*)::integer as count from public.content_versions where status='published'")).rows[0].count).toBe(3);
    expect((await role("authenticated",ids.facilitator,()=>db.query("select id from public.content_versions where cohort_id=$1",[otherGroup]))).rows).toHaveLength(0);
  });
  it("blocks direct writes, browser execution, content mutation and deletion", async () => {
    const draft = await operation(ids.manager, "save_lesson_package", payload());
    await expect(role("authenticated", ids.manager, () => db.query("update public.content_versions set body='forged contents' where id=$1", [draft.id]))).rejects.toThrow(/permission denied/);
    await expect(role("authenticated", ids.admin, () => db.query("select public.lesson_package_operation($1,'archive_content',$2::jsonb)", [ids.admin, JSON.stringify({ id: draft.id })]))).rejects.toThrow(/permission denied/);
    await expect(role("authenticated", ids.admin, () => db.query("select public.staff_operation_legacy($1,'archive_content',$2::jsonb)", [ids.admin, JSON.stringify({ id: draft.id })]))).rejects.toThrow(/permission denied/);
    await expect(db.query("update public.content_versions set package='{}'::jsonb where id=$1", [draft.id])).rejects.toThrow(/immutable/);
    await expect(db.query("update public.content_versions set cohort_id=$1 where id=$2", [otherGroup, draft.id])).rejects.toThrow(/immutable/);
    await expect(db.query("delete from public.content_versions where id=$1", [draft.id])).rejects.toThrow(/cannot be deleted/);
    await expect(role("anon", "", () => db.query("select * from public.content_versions"))).rejects.toThrow(/permission denied/);
  });
  it("validates package structure in the database and excludes teaching text from audits", async () => {
    await expect(operation(ids.admin, "save_lesson_package", { ...payload(), package: { ...payload().package, schemaVersion: undefined } })).rejects.toThrow(/complete learning/);
    await expect(operation(ids.admin, "save_lesson_package", { ...payload(), package: { ...payload().package, rightsConfirmed: false } })).rejects.toThrow(/permission/);
    await expect(operation(ids.admin, "save_lesson_package", { ...payload(), package: { ...payload().package, media: [{ ...payload().package.media[0], url: "javascript:alert(1)" }] } })).rejects.toThrow(/HTTPS/);
    const draft = await operation(ids.admin, "save_lesson_package", payload());
    const events = await db.query<{ details: Record<string, unknown> }>("select details from public.audit_events where resource_id=$1", [draft.id]);
    expect(events.rows[0].details).toEqual({ version: draft.version, cohortId: null });
    expect(JSON.stringify(events.rows)).not.toMatch(/source|body|package|fictional|instructions/);
  });
  it("unpublishes only the selected audience and allows author-account deletion without losing version text", async () => {
    const draft = await operation(ids.facilitator, "save_lesson_package", payload(ownGroup));
    await operation(ids.admin, "publish_content", { id: draft.id });
    const publishedAt = (await db.query<{ published_at: string }>("select published_at from public.content_versions where id=$1", [draft.id])).rows[0].published_at;
    await operation(ids.admin, "archive_content", { id: draft.id });
    expect((await role("authenticated", ids.alice, () => db.query("select id from public.content_versions where id=$1", [draft.id]))).rows).toHaveLength(0);
    await operation(ids.admin, "publish_content", { id: draft.id });
    expect((await db.query<{published_at:string}>("select published_at from public.content_versions where id=$1", [draft.id])).rows[0].published_at).toEqual(publishedAt);
    await operation(ids.admin,"unenrol",{cohortId:ownGroup,participantId:ids.alice});
    expect((await role("authenticated",ids.alice,()=>db.query("select id from public.content_versions where id=$1",[draft.id]))).rows).toHaveLength(0);
    await db.query("delete from auth.users where id=$1", [ids.facilitator]);
    expect((await db.query("select author_id,title from public.content_versions where id=$1", [draft.id])).rows[0]).toEqual({ author_id: null, title: "Teacher practice package" });
  });
});
