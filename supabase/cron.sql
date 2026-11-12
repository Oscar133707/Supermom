-- ════════════════════════════════════════════════════════════════════════════
-- Påminnelser: Supabase anropar appens push-route var 5:e minut.
-- Kör EN gång i Supabase → SQL Editor efter att appen är deployad på Vercel.
-- Byt ut <DIN-APP-URL> och <CRON_SECRET> (samma värde som i Vercel).
-- ════════════════════════════════════════════════════════════════════════════

create extension if not exists pg_cron;
create extension if not exists pg_net;

select cron.schedule(
  'supermom-push',
  '*/5 * * * *',
  $$
  select net.http_post(
    url     := 'https://<DIN-APP-URL>/api/push/send',
    headers := jsonb_build_object('Authorization', 'Bearer <CRON_SECRET>', 'Content-Type', 'application/json'),
    body    := '{}'::jsonb
  );
  $$
);

-- Ta bort schemat:  select cron.unschedule('supermom-push');
