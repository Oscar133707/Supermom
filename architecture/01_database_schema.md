# SOP 01 — Database Schema

## Overview
All tables live in the `public` schema of the Supabase (Postgres) project.
The full DDL is embedded in `tools/01_setup_db.py` and must be run once against a fresh project.

## Tables

```
auth.users          (managed by Supabase)
    │
    └── public.profiles         (1:1, trigger-created on signup)
            │
            ├── workout_programs    (admin creates)
            │       │
            │       └── workout_sessions    (admin creates, FK program)
            │               │
            │               └── session_completions  (mom creates, FK session + user)
            │
            ├── program_assignments  (admin creates, links user ↔ program)
            │
            ├── measurements        (mom creates)
            │
            └── chat_messages       (mom creates)
```

## Key Design Decisions

### exercises JSONB column
`workout_sessions.exercises` stores an array of exercise objects:
```json
[
  { "name": "Squat", "sets": 3, "reps": "10-12", "rest_sec": 60, "notes": "Focus on depth" }
]
```
- Avoids a separate `exercises` table — sessions are atomic units
- JSONB is indexed and queryable if needed later
- Validate shape before insert (see `SessionForm.tsx`)

### Upsert patterns
- `session_completions`: upsert on `(user_id, session_id)` — idempotent complete/uncomplete
- `measurements`: upsert on `(user_id, date)` — one entry per day, replace if re-submitted
- `program_assignments`: upsert on `(user_id, program_id)` — but first deactivate any active assignment

### Trigger: handle_new_user
Runs `AFTER INSERT ON auth.users` (security definer).
Creates a `profiles` row with `role = 'mom'`.
Admin role is set manually via `tools/02_seed_db.py`.

## Indexes
```sql
idx_workout_sessions_program    ON workout_sessions(program_id)
idx_assignments_user            ON program_assignments(user_id)
idx_completions_user            ON session_completions(user_id)
idx_measurements_user_date      ON measurements(user_id, date DESC)
idx_chat_user                   ON chat_messages(user_id, created_at DESC)
```
