# Supermom — kontext för Claude Code

Personlig träningsapp/dashboard (PWA, svenska) för **en** användare: Oscars mamma (51 år, ca 160 cm, 140 kg, tar Mounjaro, bipolär, sjukskriven). Oscar är admin. Appen används bara i hennes Samsung-mobil (Chrome, installerad på hemskärmen).

Läs vid behov:
- `docs/brief.md` – alla krav från Oscar (vad hon vill, vad hon inte får göra)
- `docs/research.md` – evidensen bakom besluten (vanor, träning vid fetma, tirzepatid, lös hud, bipolär, PWA)
- `docs/plan.md` – byggplanen
- `docs/setup.md` – Supabase/Vercel-uppsättning

## Kommandon

```bash
npm install
npm run dev      # http://localhost:3000 (kräver .env.local, se .env.example)
npm test         # vitest – logiktester i tests/
npm run lint
npm run build
```

Kör `npx tsc --noEmit`, `npm test` och `npm run lint` efter ändringar.

## Stack

Next.js 15 (App Router, Server Actions) · React 19 · TypeScript · Tailwind CSS v4 (tokens i `app/globals.css`) · Supabase (`@supabase/ssr`, Postgres + RLS, pg_cron) · `motion` · `lucide-react` · `web-push` · Vercel.

## Struktur

- `app/(app)/` – mammans app (Idag `/`, `/framsteg`, `/mer/*`). `actions.ts` = alla hennes server actions.
- `app/(focus)/pass/[id]` – guidat passläge (helskärm, `components/pass/player.tsx`).
- `app/valkommen` – onboarding. `app/(auth)` – login/lösenord. `app/admin` – Oscars vy (+ `actions.ts`).
- `app/api/push/send` – push-utskick, anropas av Supabase pg_cron (`supabase/cron.sql`) med `CRON_SECRET`.
- `lib/program/` – övningsbibliotek, faser, pass, dagsförslag (`engine.ts`), progression. Ren logik, testas i `tests/`.
- `lib/data.ts` – `requireMom()` / `requireAdmin()` / `loadDashboard()`. `lib/dates.ts` – alla datum i Europe/Stockholm.
- `supabase/migrations/0001_init.sql` – schema + RLS (enda källan till sanning för databasen).

## Produktprinciper (bryt inte mot dessa)

- **Konsekvens före intensitet.** Minsta dos (1 låt / 2 min) räknas alltid som en rörelsedag. Veckomål 4/7.
- **Inga kedjor/streaks som bryts**, inget rött "missat", ingen skuld. Comeback efter ≥2 inaktiva dagar är det som firas mest.
- **"Mycket energi" ger aldrig mer** än en vanlig dag (bipolär hänsyn). Ökningar högst var 14:e dag.
- **Lättare gäller direkt, svårare kräver hennes ja** – även när Oscar föreslår (via `program_proposals`).
- **Inga hopp, ingen löpning** tidigt. Löpning nås via faser med styrkekriterier (fas 4).
- **Ärlighet om lös hud**: träning säljs på styrka/muskler, aldrig som "stramar upp huden".
- Ingen kaloriräkning, inga dagliga vägningar, BMI bara diskret. Undvik ord som "fetma", "fusk", "borde".
- Notiser: högst 2/dag, aldrig 21–09, aldrig om hon redan rört sig.
- Röda flaggor → stoppskärm med 1177/112. Litium-läge ger extra vätskefokus.

## Design

"Som en ny Apple-produkt": lugn, en sak i fokus per skärm. Ljust tema primärt (`--canvas` mjukt vitt), mörkt via `data-theme` / systemet. Lime (`bg-lime`) endast som fyllnad – text på lime är mörk (`text-lime-ink`). Brödtext 17 px, tryckytor ≥ 48 px. Använd tokens (`bg-surface`, `text-ink-2`, `bg-hero` …), inte hårdkodade färger. Testa i 360 px bredd (Samsung S20) i både ljust och mörkt läge.

## Fallgropar (redan lösta – återinför inte)

- Filer med `"use server"` får bara exportera async-funktioner (konstanter ligger i `lib/health.ts`).
- `page.tsx` får bara exportera default + Next-fält – lägg vyer i `components/`.
- `web-push` v4 saknar default-export: `import * as webpush from "web-push"`.
- Supabase API ger max 1000 rader – livstidssiffror kommer från vyn `activity_summary`, inte genom att hämta alla aktiviteter.
- Timrar i passläget bygger på tidsstämplar (inte räknare) och Wake Lock återtas vid `visibilitychange`.
- Undvik `typeof window`/`navigator` i render (hydreringsfel) – läs i `useEffect`.
- Webben kan inte schemalägga lokala notiser – påminnelser skickas från servern.
- Admin kan läsa men aldrig skriva mammas loggar (RLS). Testa RLS-ändringar noga.
- **Prestanda:** använd `getAuth()`/`getClaims()` (lokal JWT-kontroll, ES256), aldrig `auth.getUser()` per request – det är ett extra nätverksanrop på varje sida och action. Kör profilkontroll och datafrågor parallellt (`Promise.all`).
- **Direkt respons:** uppdatera lokal state *före* `start(...)` (eller använd `useOptimistic`) – state som sätts inuti en async transition syns först när servern svarat. Lås inte knappar under sparning om upprepade tryck är rimliga; rulla tillbaka och visa ett vänligt fel om sparningen misslyckas.
- Nya sidor ska ha en `loading.tsx` (se `components/ui/skeleton.tsx`) så att tryck alltid ger omedelbar respons.

## Git

Arbetsgren: `claude/practical-gates-1uqcuk` (ännu inte sammanslagen till `main`). Commit-meddelanden på engelska.
