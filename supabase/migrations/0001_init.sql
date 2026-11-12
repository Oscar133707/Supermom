-- ════════════════════════════════════════════════════════════════════════════
-- Supermom — initial schema
-- Two users: one 'mom' and one 'admin' (Oscar). No public sign-up.
-- Mom reads/writes only her own data. Admin can READ everything and write
-- messages, program proposals and exercise media — but never edit mom's logs.
-- ════════════════════════════════════════════════════════════════════════════

create extension if not exists pgcrypto;

-- ─── Profiles ───────────────────────────────────────────────────────────────
create table public.profiles (
  id                  uuid primary key references auth.users (id) on delete cascade,
  email               text,
  role                text not null default 'mom' check (role in ('mom', 'admin')),
  display_name        text,
  height_cm           numeric(5,1) check (height_cm between 100 and 230),
  start_weight_kg     numeric(5,1) check (start_weight_kg between 30 and 400),
  takes_lithium       text not null default 'unknown' check (takes_lithium in ('yes', 'no', 'unknown')),
  why_text            text,
  anchor_text         text,          -- "När jag druckit förmiddagskaffet, då …"
  heavy_day_text      text,          -- "Om jag är trött, då dansar jag 1 låt sittande"
  protein_goal_g      integer not null default 90 check (protein_goal_g between 30 and 250),
  water_goal_glasses  integer not null default 8 check (water_goal_glasses between 2 and 20),
  theme               text not null default 'system' check (theme in ('system', 'light', 'dark')),
  paused_until        date,          -- pause mode: no reminders / no week goal
  onboarded_at        timestamptz,
  created_at          timestamptz not null default now()
);

-- ─── Helper: is the current user admin? (security definer avoids RLS recursion)
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role = 'admin');
$$;

-- ─── New auth user → profile row
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email) values (new.id, new.email)
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ─── Daily check-in (energy + diary) ────────────────────────────────────────
create table public.daily_checkins (
  user_id      uuid not null references public.profiles (id) on delete cascade,
  date         date not null,
  energy       text check (energy in ('low', 'normal', 'high')),
  mood         smallint check (mood between -3 and 3),
  sleep_hours  numeric(3,1) check (sleep_hours between 0 and 24),
  meds_taken   boolean,
  note         text,
  updated_at   timestamptz not null default now(),
  primary key (user_id, date)
);

-- ─── Activities (every logged movement, incl. guided workouts) ──────────────
create table public.activities (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references public.profiles (id) on delete cascade,
  date         date not null,
  kind         text not null check (kind in ('min_dose', 'walk', 'bike', 'strength', 'dance', 'mobility', 'other')),
  title        text,
  minutes      integer not null default 0 check (minutes between 0 and 600),
  songs        integer not null default 0 check (songs between 0 and 200),
  outdoor      boolean not null default false,
  feel_before  smallint check (feel_before between 1 and 5),
  feel_after   smallint check (feel_after between 1 and 5),
  effort       smallint check (effort between 0 and 10),
  workout      jsonb,               -- guided session detail: [{key, level, sets:[reps…]}]
  created_at   timestamptz not null default now()
);
create index activities_user_date on public.activities (user_id, date desc);

-- ─── Program state & per-exercise level ─────────────────────────────────────
create table public.program_state (
  user_id          uuid primary key references public.profiles (id) on delete cascade,
  phase            smallint not null default 0 check (phase between 0 and 4),
  phase_started_on date not null default current_date,
  last_increase_on date,
  last_deload_on   date,
  updated_at       timestamptz not null default now()
);

create table public.exercise_levels (
  user_id       uuid not null references public.profiles (id) on delete cascade,
  exercise_key  text not null,
  level         smallint not null default 1 check (level between 1 and 10),
  updated_at    timestamptz not null default now(),
  primary key (user_id, exercise_key)
);

-- Proposals that make training heavier require mom's "yes".
create table public.program_proposals (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references public.profiles (id) on delete cascade,
  created_by   uuid references public.profiles (id) on delete set null,
  kind         text not null check (kind in ('phase_up', 'level_up', 'level_down', 'phase_down')),
  exercise_key text,
  to_value     smallint not null,
  message      text,
  status       text not null default 'pending' check (status in ('pending', 'accepted', 'declined')),
  created_at   timestamptz not null default now(),
  decided_at   timestamptz
);

-- ─── Nutrition: protein & water ─────────────────────────────────────────────
create table public.intake_logs (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references public.profiles (id) on delete cascade,
  date        date not null,
  kind        text not null check (kind in ('protein', 'water')),
  amount      numeric(6,1) not null check (amount > 0 and amount <= 500), -- grams or glasses
  label       text,
  created_at  timestamptz not null default now()
);
create index intake_user_date on public.intake_logs (user_id, date desc);

-- ─── Mounjaro injections & symptoms ─────────────────────────────────────────
create table public.injections (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references public.profiles (id) on delete cascade,
  date        date not null,
  dose_mg     numeric(4,1) not null check (dose_mg in (2.5, 5, 7.5, 10, 12.5, 15)),
  site        text check (site in ('mage_v', 'mage_h', 'lar_v', 'lar_h', 'arm_v', 'arm_h')),
  note        text,
  created_at  timestamptz not null default now()
);
create index injections_user_date on public.injections (user_id, date desc);

create table public.symptoms (
  user_id       uuid not null references public.profiles (id) on delete cascade,
  date          date not null,
  nausea        smallint not null default 0 check (nausea between 0 and 3),
  vomiting      smallint not null default 0 check (vomiting between 0 and 3),
  diarrhea      smallint not null default 0 check (diarrhea between 0 and 3),
  constipation  smallint not null default 0 check (constipation between 0 and 3),
  red_flags     text[] not null default '{}',
  note          text,
  updated_at    timestamptz not null default now(),
  primary key (user_id, date)
);

-- ─── Body ───────────────────────────────────────────────────────────────────
create table public.body_metrics (
  user_id       uuid not null references public.profiles (id) on delete cascade,
  date          date not null,
  weight_kg     numeric(5,1) check (weight_kg between 30 and 400),
  waist_cm      numeric(5,1) check (waist_cm between 30 and 300),
  hips_cm       numeric(5,1) check (hips_cm between 30 and 300),
  chest_cm      numeric(5,1) check (chest_cm between 30 and 300),
  upper_arm_cm  numeric(5,1) check (upper_arm_cm between 10 and 100),
  thigh_cm      numeric(5,1) check (thigh_cm between 20 and 150),
  calf_cm       numeric(5,1) check (calf_cm between 15 and 100),
  updated_at    timestamptz not null default now(),
  primary key (user_id, date)
);

create table public.function_tests (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references public.profiles (id) on delete cascade,
  date        date not null,
  test_key    text not null check (test_key in ('chair_stand_30s', 'walk_minutes', 'bike_minutes', 'wall_pushups')),
  value       numeric(6,1) not null check (value >= 0),
  created_at  timestamptz not null default now()
);

-- ─── Music ──────────────────────────────────────────────────────────────────
create table public.playlists (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references public.profiles (id) on delete cascade,
  name        text not null check (char_length(name) between 1 and 80),
  url         text not null check (url ~* '^https://'),
  created_at  timestamptz not null default now()
);

-- ─── "Ask the doctor" checklist ─────────────────────────────────────────────
create table public.checklist_items (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references public.profiles (id) on delete cascade,
  key         text,
  text        text not null,
  done_at     timestamptz,
  created_at  timestamptz not null default now(),
  unique (user_id, key)
);

-- ─── Messages from Oscar ────────────────────────────────────────────────────
create table public.messages (
  id           uuid primary key default gen_random_uuid(),
  to_user      uuid not null references public.profiles (id) on delete cascade,
  from_user    uuid references public.profiles (id) on delete set null,
  body         text not null check (char_length(body) between 1 and 600),
  trigger      text not null default 'any' check (trigger in ('now', 'any', 'comeback', 'milestone', 'heavy_day')),
  released_at  timestamptz,
  read_at      timestamptz,
  created_at   timestamptz not null default now()
);

-- ─── Exercise media (video links set by admin) ──────────────────────────────
create table public.exercise_media (
  exercise_key text primary key,
  video_url    text check (video_url ~* '^https://'),
  updated_at   timestamptz not null default now()
);

-- ─── Push ───────────────────────────────────────────────────────────────────
create table public.push_subscriptions (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references public.profiles (id) on delete cascade,
  endpoint    text not null unique,
  p256dh      text not null,
  auth        text not null,
  created_at  timestamptz not null default now()
);

create table public.reminders (
  user_id       uuid not null references public.profiles (id) on delete cascade,
  kind          text not null check (kind in ('move', 'nutrition')),
  time_local    time not null,
  enabled       boolean not null default true,
  last_sent_on  date,
  primary key (user_id, kind)
);

-- ─── Lifetime activity totals (avoids the 1000-row API limit) ───────────────
-- security_invoker → RLS on activities applies to whoever queries the view.
create view public.activity_summary with (security_invoker = true) as
  select user_id,
         count(distinct date)::int                          as active_days,
         coalesce(sum(songs), 0)::int                       as songs,
         coalesce(sum(minutes), 0)::int                     as minutes,
         (count(*) filter (where kind = 'strength'))::int   as strength,
         min(date)                                          as first_date
    from public.activities
   group by user_id;

-- ════════════════════════════════════════════════════════════════════════════
-- Row Level Security
-- ════════════════════════════════════════════════════════════════════════════

alter table public.profiles           enable row level security;
alter table public.daily_checkins     enable row level security;
alter table public.activities         enable row level security;
alter table public.program_state      enable row level security;
alter table public.exercise_levels    enable row level security;
alter table public.program_proposals  enable row level security;
alter table public.intake_logs        enable row level security;
alter table public.injections         enable row level security;
alter table public.symptoms           enable row level security;
alter table public.body_metrics       enable row level security;
alter table public.function_tests     enable row level security;
alter table public.playlists          enable row level security;
alter table public.checklist_items    enable row level security;
alter table public.messages           enable row level security;
alter table public.exercise_media     enable row level security;
alter table public.push_subscriptions enable row level security;
alter table public.reminders          enable row level security;

-- Profiles: own row, admin reads all. Users may update only safe columns.
create policy profiles_select on public.profiles for select to authenticated
  using (id = auth.uid() or public.is_admin());
create policy profiles_update on public.profiles for update to authenticated
  using (id = auth.uid()) with check (id = auth.uid());

revoke update on public.profiles from authenticated;
grant update (display_name, height_cm, start_weight_kg, takes_lithium, why_text, anchor_text,
              heavy_day_text, protein_goal_g, water_goal_glasses, theme, paused_until, onboarded_at)
  on public.profiles to authenticated;

-- Generic "own data; admin may read" tables.
do $$
declare t text;
begin
  foreach t in array array[
    'daily_checkins', 'activities', 'exercise_levels', 'intake_logs', 'injections',
    'symptoms', 'body_metrics', 'function_tests', 'playlists', 'checklist_items',
    'program_state', 'reminders'
  ] loop
    execute format('create policy %1$s_select on public.%1$s for select to authenticated
                      using (user_id = auth.uid() or public.is_admin())', t);
    execute format('create policy %1$s_insert on public.%1$s for insert to authenticated
                      with check (user_id = auth.uid())', t);
    execute format('create policy %1$s_update on public.%1$s for update to authenticated
                      using (user_id = auth.uid()) with check (user_id = auth.uid())', t);
    execute format('create policy %1$s_delete on public.%1$s for delete to authenticated
                      using (user_id = auth.uid())', t);
  end loop;
end $$;

-- Push subscriptions: strictly own (admin has no need to read endpoints).
create policy push_select on public.push_subscriptions for select to authenticated using (user_id = auth.uid());
create policy push_insert on public.push_subscriptions for insert to authenticated with check (user_id = auth.uid());
create policy push_delete on public.push_subscriptions for delete to authenticated using (user_id = auth.uid());

-- Program proposals: admin creates/deletes; mom reads hers and decides.
create policy proposals_select on public.program_proposals for select to authenticated
  using (user_id = auth.uid() or public.is_admin());
create policy proposals_insert on public.program_proposals for insert to authenticated
  with check (public.is_admin() or user_id = auth.uid());
create policy proposals_update on public.program_proposals for update to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy proposals_delete on public.program_proposals for delete to authenticated
  using (public.is_admin());

-- Messages: admin writes; recipient reads released messages (admin reads all).
create policy messages_select on public.messages for select to authenticated
  using (public.is_admin() or (to_user = auth.uid() and released_at is not null));
create policy messages_insert on public.messages for insert to authenticated
  with check (public.is_admin() and from_user = auth.uid());
create policy messages_update on public.messages for update to authenticated
  using (public.is_admin()) with check (public.is_admin());
create policy messages_delete on public.messages for delete to authenticated
  using (public.is_admin());

-- Exercise media: everyone signed in reads; admin writes.
create policy media_select on public.exercise_media for select to authenticated using (true);
create policy media_write on public.exercise_media for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- ─── RPCs for mom-side state changes that must not allow arbitrary edits ────

-- Release one queued message for a given trigger (called by the app on comeback,
-- milestone, heavy day). Returns the released message or nothing.
create or replace function public.release_message(p_trigger text)
returns setof public.messages
language plpgsql
security definer
set search_path = public
as $$
declare m public.messages;
begin
  if p_trigger not in ('any', 'comeback', 'milestone', 'heavy_day') then
    raise exception 'invalid trigger';
  end if;
  -- At most 2 released per rolling 7 days (research: 1–2/week).
  if (select count(*) from public.messages
       where to_user = auth.uid() and released_at > now() - interval '7 days' and trigger <> 'now') >= 2 then
    return;
  end if;
  select * into m from public.messages
   where to_user = auth.uid() and released_at is null
     and (trigger = p_trigger or trigger = 'any')
   order by (trigger = p_trigger) desc, created_at asc
   limit 1
   for update skip locked;
  if not found then return; end if;
  update public.messages set released_at = now() where id = m.id returning * into m;
  return next m;
end;
$$;

create or replace function public.mark_message_read(p_id uuid)
returns void
language sql
security definer
set search_path = public
as $$
  update public.messages set read_at = coalesce(read_at, now())
   where id = p_id and to_user = auth.uid() and released_at is not null;
$$;

-- "now" messages are released immediately on insert.
create or replace function public.messages_release_now()
returns trigger
language plpgsql
as $$
begin
  if new.trigger = 'now' and new.released_at is null then
    new.released_at := now();
  end if;
  return new;
end;
$$;
create trigger messages_release_now before insert on public.messages
  for each row execute function public.messages_release_now();

-- Mom may only change a proposal's status (not what it proposes).
create or replace function public.proposals_guard()
returns trigger
language plpgsql
as $$
begin
  if not public.is_admin() then
    if new.kind is distinct from old.kind or new.exercise_key is distinct from old.exercise_key
       or new.to_value is distinct from old.to_value or new.message is distinct from old.message
       or new.created_by is distinct from old.created_by then
      raise exception 'only status may change';
    end if;
  end if;
  return new;
end;
$$;
create trigger proposals_guard before update on public.program_proposals
  for each row execute function public.proposals_guard();

grant execute on function public.release_message(text) to authenticated;
grant execute on function public.mark_message_read(uuid) to authenticated;
revoke execute on function public.release_message(text) from anon;
revoke execute on function public.mark_message_read(uuid) from anon;
