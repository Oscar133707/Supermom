# Supermom — Project Constitution (`gemini.md`)

> **This file is law.** Only update when a schema changes, a rule is added, or architecture is modified.

---

## Purpose
A personal fitness and health tracking web app for one user (mom, Oscar's mother).
Oscar is the sole admin. No other users will be added.

---

## Invariants (NEVER violate these)

1. There is exactly ONE mom user and ONE admin user.
2. Mom can NEVER read or write another user's data. RLS enforces this at the DB level.
3. Admin routes (`/admin/*`) require `role='admin'`. Two guards: `middleware.ts` + `app/admin/layout.tsx`.
4. Measurements use metric units throughout (`kg`, `cm`). No conversion in the DB.
5. `session_completions` has a unique constraint on `(user_id, session_id)`. Always upsert, never duplicate.
6. The `exercises` column in `workout_sessions` is always a valid JSON array. Validate before insert.
7. Chat messages are immutable once created. No UPDATE or DELETE on `chat_messages`.
8. The Supabase service role key is NEVER exposed to the browser. Only used in `tools/` scripts.
9. Only ONE program assignment can be `is_active = true` per user at a time. Enforced in `actions/admin.ts`.
10. `measurements.date` is unique per user — upsert replaces the same day's entry.

---

## Data Schema

### `profiles`
| Column | Type | Notes |
|---|---|---|
| `id` | `uuid` (PK, FK auth.users) | Created by trigger on signup |
| `email` | `text` | |
| `full_name` | `text` | |
| `role` | `user_role` enum: `'mom' \| 'admin'` | Default `'mom'`, elevated manually |
| `avatar_url` | `text` | |
| `created_at` | `timestamptz` | |
| `updated_at` | `timestamptz` | |

### `workout_programs`
| Column | Type | Notes |
|---|---|---|
| `id` | `uuid` (PK) | |
| `name` | `text` | |
| `description` | `text` | Nullable |
| `duration_weeks` | `integer` | > 0 |
| `created_by` | `uuid` (FK profiles) | Always admin |
| `created_at` | `timestamptz` | |
| `updated_at` | `timestamptz` | |

### `workout_sessions`
| Column | Type | Notes |
|---|---|---|
| `id` | `uuid` (PK) | |
| `program_id` | `uuid` (FK workout_programs) | ON DELETE CASCADE |
| `week_number` | `integer` | ≥ 1 |
| `day_number` | `integer` | 1–7 (Mon–Sun) |
| `title` | `text` | |
| `exercises` | `jsonb` | Array of `{ name, sets, reps, rest_sec?, notes? }` |
| `notes` | `text` | Nullable |
| `created_at` | `timestamptz` | |

Unique constraint: `(program_id, week_number, day_number)`

### `program_assignments`
| Column | Type | Notes |
|---|---|---|
| `id` | `uuid` (PK) | |
| `user_id` | `uuid` (FK profiles) | |
| `program_id` | `uuid` (FK workout_programs) | |
| `start_date` | `date` | |
| `assigned_by` | `uuid` (FK profiles) | Always admin |
| `assigned_at` | `timestamptz` | |
| `is_active` | `boolean` | Only one `true` per user at a time |

Unique constraint: `(user_id, program_id)`

### `session_completions`
| Column | Type | Notes |
|---|---|---|
| `id` | `uuid` (PK) | |
| `user_id` | `uuid` (FK profiles) | |
| `session_id` | `uuid` (FK workout_sessions) | ON DELETE CASCADE |
| `completed_at` | `timestamptz` | |

Unique constraint: `(user_id, session_id)`

### `measurements`
| Column | Type | Notes |
|---|---|---|
| `id` | `uuid` (PK) | |
| `user_id` | `uuid` (FK profiles) | |
| `date` | `date` | |
| `weight_kg` | `numeric(5,2)` | Nullable |
| `waist_cm` | `numeric(5,1)` | Nullable |
| `hips_cm` | `numeric(5,1)` | Nullable |
| `chest_cm` | `numeric(5,1)` | Nullable |
| `notes` | `text` | Nullable |
| `created_at` | `timestamptz` | |

Unique constraint: `(user_id, date)` — upsert replaces same-day entry.

### `chat_messages`
| Column | Type | Notes |
|---|---|---|
| `id` | `uuid` (PK) | |
| `user_id` | `uuid` (FK profiles) | |
| `role` | `chat_role` enum: `'user' \| 'assistant'` | |
| `content` | `text` | |
| `created_at` | `timestamptz` | |

---

## Environment Variables

| Variable | Used By | Source |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | app + tools | Supabase Dashboard > Settings > API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | app + tools | Supabase Dashboard > Settings > API |
| `SUPABASE_SERVICE_ROLE_KEY` | tools only | Supabase Dashboard > Settings > API |
| `SUPABASE_DB_URL` | `tools/01_setup_db.py` | Supabase Dashboard > Settings > Database |
| `NEXT_PUBLIC_SITE_URL` | app (auth redirects) | `http://localhost:3000` (dev) / production URL |
| `ADMIN_EMAIL` | `tools/02_seed_db.py` | Oscar's email address |
| `OPENAI_API_KEY` | `actions/chat.ts` (Phase 4) | OpenAI dashboard |

---

## Technology Decisions

| Decision | Choice | Reason |
|---|---|---|
| Framework | Next.js 14+ App Router | Best Vercel/Supabase match, Server Actions |
| Auth | Supabase Magic Link (OTP) | No password for mom to forget |
| Data fetching | Server Components + Server Actions | No REST layer needed |
| Charts | Recharts | Lightweight, works with React |
| Styling | Tailwind CSS only | No heavy component library |
| DB client | `@supabase/ssr` | Proper cookie-based auth for Next.js |

---

## Maintenance Log

| Date | Change |
|---|---|
| 2026-02-19 | Initial project setup. Schema v1.0 defined. |
