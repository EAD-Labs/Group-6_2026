create function public.admin_learning_detail(p_actor uuid,p_participant uuid)
returns jsonb language plpgsql security definer set search_path='' as $$
declare result jsonb;
begin
  if not exists(select 1 from public.profiles where id=p_actor and role::text='admin') then raise exception 'Administrator access required' using errcode='42501'; end if;
  if not exists(select 1 from public.profiles where id=p_participant) then raise exception 'Account not found'; end if;
  with questions as (
    select module_number,question_id,content_version,
      min(occurred_at) filter(where kind='question_view') as first_view,
      min(occurred_at) filter(where kind='question_answer' and correct) as first_correct
    from public.learning_events where participant_id=p_participant and question_id is not null
    group by module_number,question_id,content_version
  )
  select jsonb_build_object(
    'person',(select jsonb_build_object('id',p.id,'name',p.display_name,'role',p.role,'email',u.email,'createdAt',u.created_at,'lastSignInAt',u.last_sign_in_at) from public.profiles p join auth.users u on u.id=p.id where p.id=p_participant),
    'completedLessons',(select jsonb_build_object('1',coalesce(state->'completedLessonSlugs','[]'::jsonb),'2',coalesce(state->'moduleTwoCompletedLessonIds','[]'::jsonb),'3',coalesce(state->'moduleThreeCompletedLessonIds','[]'::jsonb),'4',coalesce(state->'moduleFourCompletedLessonIds','[]'::jsonb)) from public.participant_states where participant_id=p_participant),
    'modules',coalesce((select jsonb_agg(jsonb_build_object('module',m.position,'status',mp.status,'bestScore',mp.best_score_percent) order by m.position) from public.module_progress mp join public.learning_modules m on m.id=mp.module_id where mp.participant_id=p_participant),'[]'::jsonb),
    'pages',coalesce((select jsonb_agg(row_to_json(t) order by t."activeMs" desc) from (select path,count(*) filter(where kind='page_view') as visits,coalesce(sum(active_ms) filter(where kind='page_time'),0) as "activeMs",count(*) filter(where kind='click') as clicks,max(occurred_at) as "lastSeenAt" from public.learning_events where participant_id=p_participant group by path) t),'[]'::jsonb),
    'questions',coalesce((select jsonb_agg(jsonb_build_object('module',q.module_number,'questionId',q.question_id,'contentVersion',q.content_version,'firstViewedAt',q.first_view,'firstCorrectAt',q.first_correct,
      'wrongChecks',(select count(*) from public.learning_events e where e.participant_id=p_participant and e.question_id=q.question_id and e.content_version=q.content_version and e.kind='question_answer' and not e.correct and (q.first_correct is null or e.occurred_at<=q.first_correct)),
      'checks',(select count(*) from public.learning_events e where e.participant_id=p_participant and e.question_id=q.question_id and e.content_version=q.content_version and e.kind='question_answer'),
      'activeToCorrectMs',(select coalesce(sum(e.active_ms),0) from public.learning_events e where e.participant_id=p_participant and e.question_id=q.question_id and e.content_version=q.content_version and e.kind='question_answer' and (q.first_correct is null or e.occurred_at<=q.first_correct)),
      'elapsedToCorrectMs',case when q.first_correct>=q.first_view then extract(epoch from q.first_correct-q.first_view)*1000 else null end
    ) order by q.module_number,q.question_id) from questions q),'[]'::jsonb),
    'attempts',coalesce((select jsonb_agg(row_to_json(t) order by t."submittedAt" desc) from (select a.id,m.position as module,a.attempt_number as number,a.score_percent as score,a.passed,a.submitted_at as "submittedAt",s.content_version as "contentVersion" from public.quiz_attempts a join public.quizzes z on z.id=a.quiz_id join public.learning_modules m on m.id=z.module_id left join lateral (select content_version from public.verified_quiz_submissions v where v.participant_id=a.participant_id and v.quiz_id=a.quiz_id and v.submitted_at=a.submitted_at order by v.verified_at desc limit 1) s on true where a.participant_id=p_participant) t),'[]'::jsonb)
  ) into result;
  return result;
end; $$;
revoke all on function public.admin_learning_detail(uuid,uuid) from public,anon,authenticated;
grant execute on function public.admin_learning_detail(uuid,uuid) to service_role;
