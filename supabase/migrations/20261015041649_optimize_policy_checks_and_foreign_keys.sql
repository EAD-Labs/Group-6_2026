-- Preserve the existing owner/cohort predicates and grants. Cache only the
-- statement-stable current-user lookup instead of evaluating it for every row.
-- Existing SELECT-wrapped policies are deliberately unchanged.
set local lock_timeout = '3s';
set local statement_timeout = '30s';
set local search_path = public, pg_catalog;

alter policy "participants create own assistants" on "public"."assistant_specs"
  with check ((participant_id = (select auth.uid())));
alter policy "participants read own assistants" on "public"."assistant_specs"
  using ((participant_id = (select auth.uid())));
alter policy "participants update own assistants" on "public"."assistant_specs"
  using ((participant_id = (select auth.uid())))
  with check ((participant_id = (select auth.uid())));
alter policy "certificate owner reads record" on "public"."certificates"
  using ((participant_id = (select auth.uid())));
alter policy "participant reads own membership" on "public"."cohort_members"
  using (((participant_id = (select auth.uid())) OR is_admin()));
alter policy "cohort participant or assigned facilitator reads" on "public"."cohorts"
  using (((facilitator_id = (select auth.uid())) OR is_admin() OR (EXISTS ( SELECT 1
   FROM cohort_members m
  WHERE ((m.cohort_id = cohorts.id) AND (m.participant_id = (select auth.uid())))))));
alter policy "participants read own craft attempts" on "public"."craft_prompt_attempts"
  using ((participant_id = (select auth.uid())));
alter policy "learning_events_owner_read" on "public"."learning_events"
  using ((participant_id = (select auth.uid())));
alter policy "participants create own lesson progress" on "public"."lesson_progress"
  with check ((participant_id = (select auth.uid())));
alter policy "participants read own lesson progress" on "public"."lesson_progress"
  using ((participant_id = (select auth.uid())));
alter policy "participants update own lesson progress" on "public"."lesson_progress"
  using ((participant_id = (select auth.uid())))
  with check ((participant_id = (select auth.uid())));
alter policy "participants create own module progress" on "public"."module_progress"
  with check ((participant_id = (select auth.uid())));
alter policy "participants read own module progress" on "public"."module_progress"
  using (((participant_id = (select auth.uid())) OR is_admin()));
alter policy "participants update own module progress" on "public"."module_progress"
  using ((participant_id = (select auth.uid())))
  with check ((participant_id = (select auth.uid())));
alter policy "owners read state" on "public"."participant_states"
  using ((participant_id = (select auth.uid())));
alter policy "participants create own profile" on "public"."profiles"
  with check ((id = (select auth.uid())));
alter policy "participants read own profile" on "public"."profiles"
  using ((id = (select auth.uid())));
alter policy "participants update own profile" on "public"."profiles"
  using ((((select auth.uid()) IS NOT NULL) AND (id = (select auth.uid()))))
  with check ((((select auth.uid()) IS NOT NULL) AND (id = (select auth.uid()))));
alter policy "participants create own attempts" on "public"."quiz_attempts"
  with check ((participant_id = (select auth.uid())));
alter policy "participants read own attempts" on "public"."quiz_attempts"
  using (((participant_id = (select auth.uid())) OR is_admin()));
alter policy "participants update own attempts" on "public"."quiz_attempts"
  using ((participant_id = (select auth.uid())))
  with check ((participant_id = (select auth.uid())));
alter policy "participants read own responses" on "public"."quiz_responses"
  using ((EXISTS ( SELECT 1
   FROM quiz_attempts
  WHERE ((quiz_attempts.id = quiz_responses.attempt_id) AND (quiz_attempts.participant_id = (select auth.uid()))))));
alter policy "source owner creates bounded resources" on "public"."teacher_resources"
  with check (((owner_id = (select auth.uid())) AND (expires_at <= (now() + '30 days'::interval))));
alter policy "source owner deletes resources" on "public"."teacher_resources"
  using ((owner_id = (select auth.uid())));
alter policy "source owner reads unexpired resources" on "public"."teacher_resources"
  using (((owner_id = (select auth.uid())) AND (expires_at > now())));
alter policy "source owner updates unexpired resources" on "public"."teacher_resources"
  using (((owner_id = (select auth.uid())) AND (expires_at > now())))
  with check (((owner_id = (select auth.uid())) AND (expires_at <= (now() + '30 days'::interval))));
alter policy "owners read verified assessments" on "public"."verified_quiz_submissions"
  using ((participant_id = (select auth.uid())));

-- Cover previously unindexed relationship columns used by cohort joins,
-- reporting and account deletion. Indexes add no read/write permissions.
create index audit_events_actor_id_fk_idx on public.audit_events(actor_id);
create index cohort_members_participant_id_fk_idx on public.cohort_members(participant_id);
create index cohorts_facilitator_id_fk_idx on public.cohorts(facilitator_id);
create index content_versions_author_id_fk_idx on public.content_versions(author_id);
create index content_versions_published_by_fk_idx on public.content_versions(published_by);
create index lesson_progress_lesson_id_fk_idx on public.lesson_progress(lesson_id);
create index module_progress_module_id_fk_idx on public.module_progress(module_id);
create index quiz_attempts_quiz_id_fk_idx on public.quiz_attempts(quiz_id);
create index quiz_responses_question_id_fk_idx on public.quiz_responses(question_id);
create index teacher_resources_owner_id_fk_idx on public.teacher_resources(owner_id);
create index verified_quiz_submissions_quiz_id_fk_idx on public.verified_quiz_submissions(quiz_id);
