-- Immutable course-team lesson packages. Existing lessons, assessment versions,
-- participant evidence and certificate eligibility are deliberately unchanged.
alter table public.content_versions
  add column cohort_id uuid references public.cohorts(id) on delete restrict,
  add column package jsonb not null default '{}'::jsonb;
alter table public.content_versions add constraint lesson_package_is_object check (jsonb_typeof(package)='object' and octet_length(package::text)<=24000);
drop index public.one_published_lesson_addendum;
create unique index one_published_lesson_per_audience on public.content_versions
  (module_number,lesson_slug,coalesce(cohort_id,'00000000-0000-0000-0000-000000000000'::uuid)) where status='published';
create index content_versions_cohort_id_idx on public.content_versions(cohort_id) where cohort_id is not null;

drop policy "published content is readable" on public.content_versions;
create policy "published content follows learning group scope" on public.content_versions
for select to authenticated using (
  public.is_admin()
  or author_id=(select auth.uid())
  or (status='published' and (
    cohort_id is null
    or exists(select 1 from public.cohort_members membership where membership.cohort_id=content_versions.cohort_id and membership.participant_id=(select auth.uid()))
    or exists(select 1 from public.cohorts cohort where cohort.id=content_versions.cohort_id and cohort.facilitator_id=(select auth.uid()))
    or exists(select 1 from public.profiles profile where profile.id=(select auth.uid()) and profile.role::text='content_manager')
  ))
);

-- Even trusted writers cannot alter saved teaching text or move a version to
-- another lesson/audience. Revisions are inserts, not updates. Nulling a deleted
-- author's reference is permitted so account deletion remains functional.
create function public.protect_lesson_version()
returns trigger language plpgsql security invoker set search_path='' as $$
begin
  if tg_op='DELETE' then raise exception 'Saved lesson versions cannot be deleted'; end if;
  if (new.id,new.module_number,new.lesson_slug,new.title,new.body,new.version,new.cohort_id,new.package,new.created_at)
    is distinct from (old.id,old.module_number,old.lesson_slug,old.title,old.body,old.version,old.cohort_id,old.package,old.created_at)
    or (new.author_id is distinct from old.author_id and new.author_id is not null)
    or (old.published_at is not null and new.published_at is distinct from old.published_at)
  then raise exception 'Saved lesson versions are immutable; create a new draft'; end if;
  return new;
end; $$;
revoke all on function public.protect_lesson_version() from public,anon,authenticated;
create trigger protect_saved_lesson_version before update or delete on public.content_versions
for each row execute function public.protect_lesson_version();

-- This invoker RPC is service-only and rechecks the server-verified actor's
-- database role. It adds no public privileged function or browser write grant.
create function public.lesson_package_operation(p_actor uuid,p_action text,p_payload jsonb)
returns jsonb language plpgsql security invoker set search_path='' as $$
declare
  v_role text; v_id uuid; v_version integer; v_cohort uuid;
  v_module smallint; v_slug text; v_package jsonb; v_media jsonb; v_target public.content_versions;
begin
  select role::text into v_role from public.profiles where id=p_actor;
  if v_role is null or v_role not in ('admin','facilitator','content_manager') then raise exception 'Staff access required' using errcode='42501'; end if;
  if p_action in ('save_content','save_lesson_package') then
    v_module := (p_payload->>'module')::smallint;
    v_slug := p_payload->>'lessonSlug';
    v_cohort := nullif(p_payload->>'cohortId','')::uuid;
    if v_cohort is not null and not exists(select 1 from public.cohorts where id=v_cohort and status<>'archived') then raise exception 'Choose an active or planned learning group'; end if;
    if v_cohort is not null and v_role='facilitator' and not exists(select 1 from public.cohorts where id=v_cohort and facilitator_id=p_actor) then raise exception 'Assigned learning group required' using errcode='42501'; end if;
    if p_action='save_lesson_package' then
      v_package := p_payload->'package';
      if v_package is null or jsonb_typeof(v_package)<>'object' or v_package->>'schemaVersion' is distinct from '1'
        or v_package->'rightsConfirmed' is distinct from 'true'::jsonb
        or coalesce(char_length(trim(v_package->>'learningGoal')),0) not between 10 and 500
        or jsonb_typeof(v_package->'activity') is distinct from 'object'
        or coalesce(char_length(trim(v_package->'activity'->>'title')),0) not between 3 and 160
        or coalesce(char_length(trim(v_package->'activity'->>'instructions')),0) not between 30 and 4000
        or coalesce(char_length(trim(v_package->'activity'->>'reflection')),0) not between 10 and 500
        or jsonb_typeof(v_package->'media') is distinct from 'array'
      then raise exception 'A complete learning goal, practice activity and sharing permission are required'; end if;
      if jsonb_array_length(v_package->'media')>6 then raise exception 'At most six media links are allowed'; end if;
      for v_media in select value from jsonb_array_elements(v_package->'media') loop
        if jsonb_typeof(v_media)<>'object' or coalesce(v_media->>'kind','') not in ('video','reading')
          or coalesce(char_length(trim(v_media->>'title')),0) not between 3 and 160
          or coalesce(char_length(trim(v_media->>'accessibilityNote')),0) not between 10 and 500
          or coalesce(v_media->>'url','') !~ '^https://[^[:space:]@/]+\.[^[:space:]@/]+([/?#][^[:space:]]*)?$'
          or char_length(v_media->>'url')>1500
        then raise exception 'Use safe HTTPS links and an accessible alternative for each resource'; end if;
      end loop;
    else v_package := '{}'::jsonb; end if;
    perform pg_advisory_xact_lock(hashtext(v_module::text || ':' || v_slug));
    select coalesce(max(version),0)+1 into v_version from public.content_versions where module_number=v_module and lesson_slug=v_slug;
    insert into public.content_versions(module_number,lesson_slug,title,body,version,cohort_id,package,author_id)
      values(v_module,v_slug,p_payload->>'title',p_payload->>'body',v_version,v_cohort,v_package,p_actor) returning id into v_id;
  elsif p_action in ('publish_content','archive_content') then
    if v_role<>'admin' then raise exception 'Administrator approval required' using errcode='42501'; end if;
    v_id := (p_payload->>'id')::uuid;
    select * into v_target from public.content_versions where id=v_id;
    if not found then raise exception 'Content version not found'; end if;
    perform pg_advisory_xact_lock(hashtext(v_target.module_number::text || ':' || v_target.lesson_slug));
    select * into v_target from public.content_versions where id=v_id for update;
    v_cohort := v_target.cohort_id; v_version := v_target.version;
    if p_action='publish_content' then
      if v_cohort is not null and not exists(select 1 from public.cohorts where id=v_cohort and status<>'archived') then raise exception 'Cannot publish to an archived learning group'; end if;
      update public.content_versions set status='archived' where status='published' and id<>v_id
        and module_number=v_target.module_number and lesson_slug=v_target.lesson_slug and cohort_id is not distinct from v_cohort;
      update public.content_versions set status='published',published_at=coalesce(published_at,now()),published_by=p_actor where id=v_id;
    else update public.content_versions set status='archived' where id=v_id; end if;
  else raise exception 'Unknown content action'; end if;
  insert into public.audit_events(actor_id,action,resource_id,details)
    values(p_actor,p_action,v_id::text,jsonb_build_object('version',v_version,'cohortId',v_cohort));
  return jsonb_build_object('id',v_id,'version',v_version);
end; $$;
revoke all on function public.lesson_package_operation(uuid,text,jsonb) from public,anon,authenticated;
grant execute on function public.lesson_package_operation(uuid,text,jsonb) to service_role;

-- Preserve all existing staff operations while routing both old addenda and
-- new packages through the same audience-aware publication transaction.
alter function public.staff_operation(uuid,text,jsonb) rename to staff_operation_legacy;
revoke all on function public.staff_operation_legacy(uuid,text,jsonb) from public,anon,authenticated;
create function public.staff_operation(p_actor uuid,p_action text,p_payload jsonb)
returns jsonb language plpgsql security invoker set search_path='' as $$
begin
  if p_action in ('save_content','save_lesson_package','publish_content','archive_content') then
    return public.lesson_package_operation(p_actor,p_action,p_payload);
  end if;
  return public.staff_operation_legacy(p_actor,p_action,p_payload);
end; $$;
revoke all on function public.staff_operation(uuid,text,jsonb) from public,anon,authenticated;
grant execute on function public.staff_operation(uuid,text,jsonb) to service_role;
