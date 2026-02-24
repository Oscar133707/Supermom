# Supermom — Task Plan

## Phase 1: Foundation ✅
- [x] Create project directory and config files
- [x] `package.json`, `tsconfig.json`, `next.config.ts`, `tailwind.config.ts`
- [x] `lib/supabase/client.ts`, `lib/supabase/server.ts`
- [x] `middleware.ts` (route protection + admin guard)
- [x] `app/(auth)/login/page.tsx` + `app/auth/callback/route.ts`
- [x] `lib/types.ts`, `lib/utils.ts`
- [x] All Server Actions: `actions/workouts.ts`, `measurements.ts`, `chat.ts`, `admin.ts`
- [x] All UI components
- [x] All app pages (dashboard, workouts, measurements, chat)
- [x] All admin pages (programs list/detail/new, assign)
- [x] B.L.A.S.T. protocol files: `gemini.md`, `task_plan.md`, `findings.md`, `progress.md`
- [x] Architecture SOPs in `architecture/`
- [x] Python tools in `tools/`
- [x] `.env.example`

## Phase 2: Database Setup (YOU DO THIS)
- [ ] Create a Supabase project at supabase.com (free tier, EU region)
- [ ] Copy credentials to `.env` from `.env.example`
- [ ] Install Python deps: `pip install -r tools/requirements.txt`
- [ ] Run: `python3 tools/01_setup_db.py` — applies schema + RLS
- [ ] Run: `python3 tools/02_seed_db.py` — creates admin account + sample data
- [ ] Run: `python3 tools/03_verify_rls.py` — confirms policies work
- [ ] Run: `npm install` and then `npm run dev`
- [ ] Log in at `http://localhost:3000` — verify admin goes to `/admin`, mom goes to `/dashboard`

## Phase 3: Content (YOU DO THIS)
- [ ] Create workout programs in `/admin/programs`
- [ ] Add sessions with exercises to each program
- [ ] Assign a program to mom's account via `/admin/assign`
- [ ] Send mom her login magic link

## Phase 4: AI Chatbot (FUTURE)
- [ ] Get an OpenAI API key
- [ ] Add `OPENAI_API_KEY` to `.env` (and Vercel env vars)
- [ ] Replace placeholder stub in `actions/chat.ts` with real API call
- [ ] Optionally add streaming support

## Phase 5: Deploy (WHEN READY)
- [ ] `vercel login && vercel link`
- [ ] Set all env vars in Vercel dashboard (same as `.env`)
- [ ] Change `NEXT_PUBLIC_SITE_URL` to production URL
- [ ] `vercel --prod`
- [ ] Test magic link auth in production
- [ ] Send mom the production URL and her magic link
