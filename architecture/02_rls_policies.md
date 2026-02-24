# SOP 02 — Row Level Security Policies

## Principles
- RLS is enabled on ALL public tables
- Mom can only read/write her OWN rows
- Admin can read ALL rows; write to programs, sessions, assignments
- The `is_admin()` helper uses `security definer` to avoid recursive RLS on `profiles`

## is_admin() Function
```sql
create or replace function public.is_admin()
returns boolean language sql security definer stable as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;
```
Called in policies as `public.is_admin()`. Stable = result cached per query.

## Policy Matrix

| Table | Mom can SELECT | Mom can INSERT | Mom can UPDATE | Mom can DELETE | Admin |
|---|---|---|---|---|---|
| `profiles` | Own row | — (trigger only) | Own row (not role) | — | All + update role |
| `workout_programs` | All (view assigned) | — | — | — | Full CRUD |
| `workout_sessions` | All (view sessions) | — | — | — | Full CRUD |
| `program_assignments` | Own rows | — | — | — | Full CRUD |
| `session_completions` | Own rows | Own rows | — | Own rows | Select all |
| `measurements` | Own rows | Own rows | Own rows | Own rows | Select all |
| `chat_messages` | Own rows | Own rows | — (immutable) | — (immutable) | Select all |

## Application-level Guards
Route protection happens in two places:
1. `middleware.ts` — checks auth + role before serving any admin route
2. `app/admin/layout.tsx` — redundant check as defense-in-depth
3. `actions/admin.ts` — `assertAdmin()` function re-checks role in every admin action

Never trust client-only checks. RLS + server actions = two layers of defense.
