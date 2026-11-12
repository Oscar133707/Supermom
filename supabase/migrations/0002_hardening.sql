-- ════════════════════════════════════════════════════════════════════════════
-- Supermom — hardening after Supabase Security Advisor (2026-11-12)
-- ════════════════════════════════════════════════════════════════════════════

-- Fixed search_path on trigger functions.
alter function public.messages_release_now() set search_path = public;
alter function public.proposals_guard()      set search_path = public;

-- handle_new_user only runs as a trigger — nobody needs to call it directly.
revoke execute on function public.handle_new_user() from public, anon, authenticated;

-- Signed-out visitors must not call any of these. Signed-in users keep access:
-- is_admin() is used inside RLS policies, the two RPCs are called by the app.
revoke execute on function public.is_admin()                from public, anon;
revoke execute on function public.release_message(text)     from public, anon;
revoke execute on function public.mark_message_read(uuid)   from public, anon;
grant  execute on function public.is_admin()                to authenticated;
grant  execute on function public.release_message(text)     to authenticated;
grant  execute on function public.mark_message_read(uuid)   to authenticated;

-- pg_net belongs in the extensions schema, not public. Its functions live in the
-- `net` schema either way, so the reminder cron job keeps working.
do $$
begin
  if exists (select 1 from pg_extension e join pg_namespace n on n.oid = e.extnamespace
             where e.extname = 'pg_net' and n.nspname = 'public') then
    drop extension pg_net;
    create extension pg_net with schema extensions;
  end if;
end $$;
