-- Supabase's RLS auto-enabler is a DDL event trigger, never a participant RPC.
-- Keep its event trigger working while removing unnecessary API execution.
-- Local test databases do not supply this platform function.
do $$ begin
  if to_regprocedure('public.rls_auto_enable()') is not null then
    execute 'revoke execute on function public.rls_auto_enable() from public, anon, authenticated';
  end if;
end $$;
