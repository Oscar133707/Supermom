# SOP 06 — Deployment

## Local Development

```bash
# 1. Install dependencies
npm install

# 2. Copy env template
cp .env.example .env
# Fill in your Supabase credentials

# 3. Set up the database (run once)
cd tools
pip install -r requirements.txt
python3 01_setup_db.py   # Apply schema + RLS
python3 02_seed_db.py    # Create admin user + sample data
python3 03_verify_rls.py # Verify policies
cd ..

# 4. Run dev server
npm run dev
# Open http://localhost:3000
```

## Vercel Deployment

```bash
# 1. Install Vercel CLI
npm install -g vercel

# 2. Link to Vercel project
vercel login
vercel link   # Follow prompts to create/link project

# 3. Set environment variables in Vercel dashboard
# Go to: vercel.com > your project > Settings > Environment Variables
# Add all variables from .env.example (except SUPABASE_DB_URL and ADMIN_EMAIL — local only)
# Update NEXT_PUBLIC_SITE_URL to your production URL

# 4. Deploy
vercel --prod
```

## Supabase Production Configuration

After deploying to Vercel:
1. Go to Supabase Dashboard > Authentication > URL Configuration
2. Set **Site URL** to `https://your-app.vercel.app`
3. Add to **Redirect URLs**: `https://your-app.vercel.app/auth/callback`

## Environment Variables: Local vs Production

| Variable | Local (`.env`) | Vercel Dashboard |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ | ✅ |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅ | ✅ |
| `SUPABASE_SERVICE_ROLE_KEY` | ✅ (tools only) | ✅ (if needed) |
| `SUPABASE_DB_URL` | ✅ (tools only) | ❌ not needed |
| `NEXT_PUBLIC_SITE_URL` | `http://localhost:3000` | `https://your-app.vercel.app` |
| `ADMIN_EMAIL` | ✅ (seed only) | ❌ not needed |
| `OPENAI_API_KEY` | ✅ (Phase 4) | ✅ (Phase 4) |

## Post-Deployment Checklist
- [ ] Magic link auth works in production (check Supabase redirect URLs)
- [ ] Admin can log in and access `/admin`
- [ ] Mom can log in and access `/dashboard` but NOT `/admin`
- [ ] Session persists across page refreshes
- [ ] Vercel logs show no errors (`vercel logs`)
