#!/usr/bin/env python3
"""
01_setup_db.py — Apply Supermom database schema and RLS policies.

Run ONCE on a fresh Supabase project. Safe to re-run (uses IF NOT EXISTS guards
and CREATE OR REPLACE for functions).

Usage:
    cd /Users/oscarjohansson/Supermom
    python3 tools/01_setup_db.py

Requires:
    SUPABASE_DB_URL in .env (Direct Postgres connection URL from
    Supabase Dashboard > Settings > Database > Connection string > URI)
"""

import os
import sys
from pathlib import Path

from dotenv import load_dotenv

load_dotenv(Path(__file__).parent.parent / ".env")

try:
    import psycopg2
except ImportError:
    print("ERROR: psycopg2-binary not installed. Run: pip install -r tools/requirements.txt")
    sys.exit(1)

DB_URL = os.getenv("SUPABASE_DB_URL")
if not DB_URL:
    print("ERROR: SUPABASE_DB_URL not set in .env")
    print("  Find it in: Supabase Dashboard > Settings > Database > Connection string > URI")
    sys.exit(1)

SCHEMA_SQL = """
-- ─── ENUMS ────────────────────────────────────────────────────────────────────
DO $$ BEGIN
  CREATE TYPE user_role AS ENUM ('mom', 'admin');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE chat_role AS ENUM ('user', 'assistant');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;


-- ─── PROFILES ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email       TEXT NOT NULL,
  full_name   TEXT,
  role        user_role NOT NULL DEFAULT 'mom',
  avatar_url  TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Trigger: auto-create profile on auth signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


-- ─── WORKOUT PROGRAMS ─────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.workout_programs (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name            TEXT NOT NULL,
  description     TEXT,
  duration_weeks  INTEGER NOT NULL CHECK (duration_weeks > 0),
  created_by      UUID NOT NULL REFERENCES public.profiles(id),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- ─── WORKOUT SESSIONS ─────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.workout_sessions (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  program_id  UUID NOT NULL REFERENCES public.workout_programs(id) ON DELETE CASCADE,
  week_number INTEGER NOT NULL CHECK (week_number >= 1),
  day_number  INTEGER NOT NULL CHECK (day_number BETWEEN 1 AND 7),
  title       TEXT NOT NULL,
  exercises   JSONB NOT NULL DEFAULT '[]'::JSONB,
  notes       TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (program_id, week_number, day_number)
);

CREATE INDEX IF NOT EXISTS idx_workout_sessions_program ON public.workout_sessions(program_id);


-- ─── PROGRAM ASSIGNMENTS ──────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.program_assignments (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  program_id  UUID NOT NULL REFERENCES public.workout_programs(id) ON DELETE CASCADE,
  start_date  DATE NOT NULL DEFAULT CURRENT_DATE,
  assigned_by UUID NOT NULL REFERENCES public.profiles(id),
  assigned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  is_active   BOOLEAN NOT NULL DEFAULT TRUE,
  UNIQUE (user_id, program_id)
);

CREATE INDEX IF NOT EXISTS idx_assignments_user ON public.program_assignments(user_id);


-- ─── SESSION COMPLETIONS ──────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.session_completions (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  session_id   UUID NOT NULL REFERENCES public.workout_sessions(id) ON DELETE CASCADE,
  completed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, session_id)
);

CREATE INDEX IF NOT EXISTS idx_completions_user ON public.session_completions(user_id);


-- ─── MEASUREMENTS ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.measurements (
  id        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id   UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  date      DATE NOT NULL,
  weight_kg NUMERIC(5, 2),
  waist_cm  NUMERIC(5, 1),
  hips_cm   NUMERIC(5, 1),
  chest_cm  NUMERIC(5, 1),
  notes     TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, date)
);

CREATE INDEX IF NOT EXISTS idx_measurements_user_date ON public.measurements(user_id, date DESC);


-- ─── CHAT MESSAGES ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.chat_messages (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  role       chat_role NOT NULL,
  content    TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_chat_user ON public.chat_messages(user_id, created_at DESC);
"""

RLS_SQL = """
-- ─── ENABLE RLS ───────────────────────────────────────────────────────────────
ALTER TABLE public.profiles            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workout_programs    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workout_sessions    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.program_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.session_completions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.measurements        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages       ENABLE ROW LEVEL SECURITY;


-- ─── is_admin() HELPER ────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN LANGUAGE SQL SECURITY DEFINER STABLE AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$;


-- ─── PROFILES POLICIES ────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "profiles_select"        ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_own"    ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_admin"  ON public.profiles;

CREATE POLICY "profiles_select" ON public.profiles
  FOR SELECT USING (id = auth.uid() OR public.is_admin());

CREATE POLICY "profiles_update_own" ON public.profiles
  FOR UPDATE USING (id = auth.uid())
  WITH CHECK (
    id = auth.uid()
    AND role = (SELECT role FROM public.profiles WHERE id = auth.uid())
  );

CREATE POLICY "profiles_update_admin" ON public.profiles
  FOR UPDATE USING (public.is_admin());


-- ─── WORKOUT PROGRAMS POLICIES ────────────────────────────────────────────────
DROP POLICY IF EXISTS "programs_select"  ON public.workout_programs;
DROP POLICY IF EXISTS "programs_insert"  ON public.workout_programs;
DROP POLICY IF EXISTS "programs_update"  ON public.workout_programs;
DROP POLICY IF EXISTS "programs_delete"  ON public.workout_programs;

CREATE POLICY "programs_select" ON public.workout_programs
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "programs_insert" ON public.workout_programs
  FOR INSERT WITH CHECK (public.is_admin());

CREATE POLICY "programs_update" ON public.workout_programs
  FOR UPDATE USING (public.is_admin());

CREATE POLICY "programs_delete" ON public.workout_programs
  FOR DELETE USING (public.is_admin());


-- ─── WORKOUT SESSIONS POLICIES ────────────────────────────────────────────────
DROP POLICY IF EXISTS "sessions_select"  ON public.workout_sessions;
DROP POLICY IF EXISTS "sessions_insert"  ON public.workout_sessions;
DROP POLICY IF EXISTS "sessions_update"  ON public.workout_sessions;
DROP POLICY IF EXISTS "sessions_delete"  ON public.workout_sessions;

CREATE POLICY "sessions_select" ON public.workout_sessions
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "sessions_insert" ON public.workout_sessions
  FOR INSERT WITH CHECK (public.is_admin());

CREATE POLICY "sessions_update" ON public.workout_sessions
  FOR UPDATE USING (public.is_admin());

CREATE POLICY "sessions_delete" ON public.workout_sessions
  FOR DELETE USING (public.is_admin());


-- ─── PROGRAM ASSIGNMENTS POLICIES ────────────────────────────────────────────
DROP POLICY IF EXISTS "assignments_select"  ON public.program_assignments;
DROP POLICY IF EXISTS "assignments_insert"  ON public.program_assignments;
DROP POLICY IF EXISTS "assignments_update"  ON public.program_assignments;
DROP POLICY IF EXISTS "assignments_delete"  ON public.program_assignments;

CREATE POLICY "assignments_select" ON public.program_assignments
  FOR SELECT USING (user_id = auth.uid() OR public.is_admin());

CREATE POLICY "assignments_insert" ON public.program_assignments
  FOR INSERT WITH CHECK (public.is_admin());

CREATE POLICY "assignments_update" ON public.program_assignments
  FOR UPDATE USING (public.is_admin());

CREATE POLICY "assignments_delete" ON public.program_assignments
  FOR DELETE USING (public.is_admin());


-- ─── SESSION COMPLETIONS POLICIES ────────────────────────────────────────────
DROP POLICY IF EXISTS "completions_select"  ON public.session_completions;
DROP POLICY IF EXISTS "completions_insert"  ON public.session_completions;
DROP POLICY IF EXISTS "completions_delete"  ON public.session_completions;

CREATE POLICY "completions_select" ON public.session_completions
  FOR SELECT USING (user_id = auth.uid() OR public.is_admin());

CREATE POLICY "completions_insert" ON public.session_completions
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "completions_delete" ON public.session_completions
  FOR DELETE USING (user_id = auth.uid() OR public.is_admin());


-- ─── MEASUREMENTS POLICIES ────────────────────────────────────────────────────
DROP POLICY IF EXISTS "measurements_select"  ON public.measurements;
DROP POLICY IF EXISTS "measurements_insert"  ON public.measurements;
DROP POLICY IF EXISTS "measurements_update"  ON public.measurements;
DROP POLICY IF EXISTS "measurements_delete"  ON public.measurements;

CREATE POLICY "measurements_select" ON public.measurements
  FOR SELECT USING (user_id = auth.uid() OR public.is_admin());

CREATE POLICY "measurements_insert" ON public.measurements
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "measurements_update" ON public.measurements
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "measurements_delete" ON public.measurements
  FOR DELETE USING (user_id = auth.uid() OR public.is_admin());


-- ─── CHAT MESSAGES POLICIES ──────────────────────────────────────────────────
DROP POLICY IF EXISTS "chat_select"  ON public.chat_messages;
DROP POLICY IF EXISTS "chat_insert"  ON public.chat_messages;

CREATE POLICY "chat_select" ON public.chat_messages
  FOR SELECT USING (user_id = auth.uid() OR public.is_admin());

CREATE POLICY "chat_insert" ON public.chat_messages
  FOR INSERT WITH CHECK (user_id = auth.uid());
"""


def main() -> None:
    print("=" * 60)
    print("Supermom — Database Setup")
    print("=" * 60)
    print()

    print("Connecting to Supabase Postgres...")
    try:
        conn = psycopg2.connect(DB_URL)
        conn.autocommit = True
        cur = conn.cursor()
        print("Connected ✓")
    except Exception as e:
        print(f"ERROR: Could not connect: {e}")
        print("Check your SUPABASE_DB_URL in .env")
        sys.exit(1)

    print()
    print("Applying schema...")
    try:
        cur.execute(SCHEMA_SQL)
        print("Schema applied ✓")
    except Exception as e:
        print(f"ERROR applying schema: {e}")
        conn.close()
        sys.exit(1)

    print()
    print("Applying RLS policies...")
    try:
        cur.execute(RLS_SQL)
        print("RLS policies applied ✓")
    except Exception as e:
        print(f"ERROR applying RLS: {e}")
        conn.close()
        sys.exit(1)

    cur.close()
    conn.close()

    print()
    print("=" * 60)
    print("Database setup complete!")
    print()
    print("Next step: run tools/02_seed_db.py to create your admin account.")
    print("=" * 60)


if __name__ == "__main__":
    main()
