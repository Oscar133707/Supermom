# Supermom — Findings & Research

## Supabase + Next.js Auth (SSR)

- Must use `@supabase/ssr` package (not `@supabase/auth-helpers-nextjs` which is deprecated)
- Two clients needed: `lib/supabase/client.ts` (browser) and `lib/supabase/server.ts` (server)
- Session refresh must happen in `middleware.ts` via `supabase.auth.getUser()` — do NOT skip this
- Magic Link sets `emailRedirectTo` to `/auth/callback`, which exchanges the code for a session
- Cookie-based sessions: the `setAll` in `middleware.ts` copies cookies between `request` and `supabaseResponse`

## RLS Patterns

- Always create a `is_admin()` helper function with `security definer` to avoid recursive RLS checks
- Enable RLS on ALL public tables before writing policies
- The `handle_new_user` trigger runs with `security definer` so it can bypass RLS to insert profiles
- Service role key bypasses RLS entirely — only use in server-side `tools/` scripts

## Supabase JSONB

- `exercises` column is JSONB — Supabase returns it as a parsed JS object, not a string
- When inserting from Python tools, pass as a Python list (psycopg2 will serialize it)
- When inserting from Next.js Server Actions, pass as a JS array (Supabase JS client serializes it)

## Next.js App Router

- Server Actions must be in files with `'use server'` directive at the top
- `revalidatePath()` after mutations to bust the cache for affected routes
- `redirect()` after mutations causes the response to throw — cannot try/catch around it
- Dynamic route params are now `Promise<{ param: string }>` in Next.js 14+ — must `await params`
- `searchParams` is also a Promise in Next.js 14+ — must `await searchParams`

## Recharts

- Must be a Client Component (`'use client'`) — does not support SSR
- `ResponsiveContainer` requires a parent with a defined height or width
- `connectNulls` on `Line` handles gaps where a measurement field is null

## Deployment (Vercel)

- Set `NEXT_PUBLIC_SITE_URL` to `https://your-app.vercel.app` in production
- Supabase Dashboard: go to Auth > URL Configuration > Site URL and add Vercel URL
- Also add `https://your-app.vercel.app/auth/callback` to Redirect URLs in Supabase Auth settings
