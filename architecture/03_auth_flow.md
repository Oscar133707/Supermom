# SOP 03 — Authentication Flow

## Method: Supabase Magic Link (Email OTP)
No passwords. User enters email → receives a link → clicks it → logged in.
Ideal for a single known user who doesn't want to manage a password.

## Flow Diagram

```
User visits /login
    │
    ├── Enters email → form action calls supabase.auth.signInWithOtp()
    │   emailRedirectTo = NEXT_PUBLIC_SITE_URL + /auth/callback
    │
    ↓
Supabase emails magic link to user
    │
    ↓
User clicks link → browser hits /auth/callback?code=XXXX
    │
    └── route.ts calls supabase.auth.exchangeCodeForSession(code)
        │
        └── Session cookie set → redirect to /dashboard
```

## Key Files

| File | Role |
|---|---|
| `app/(auth)/login/page.tsx` | Login form + Server Action that calls signInWithOtp |
| `app/auth/callback/route.ts` | Exchanges code for session, redirects to /dashboard |
| `middleware.ts` | Refreshes session on every request, guards protected routes |
| `lib/supabase/server.ts` | Server-side Supabase client (reads/writes cookies) |
| `lib/supabase/client.ts` | Browser-side Supabase client (for Client Components) |

## Supabase Dashboard Configuration
When deploying to production:
1. Go to Authentication > URL Configuration
2. Set **Site URL** to `https://your-app.vercel.app`
3. Add `https://your-app.vercel.app/auth/callback` to **Redirect URLs**

For local dev, `http://localhost:3000` is allowed by default.

## Session Refresh (CRITICAL)
`middleware.ts` calls `supabase.auth.getUser()` on every request.
This refreshes expired sessions automatically.
**Do NOT remove or skip this call.** Without it, sessions won't renew and users will get logged out unexpectedly.

## Role Assignment
1. User signs up → trigger creates `profiles` row with `role = 'mom'`
2. To promote to admin: run `tools/02_seed_db.py` which calls the Admin API and sets `role = 'admin'`
3. Admin role check happens in: middleware + admin layout + assertAdmin() in server actions
