# Supermom

En personlig, mobilanpassad träningsapp/dashboard (PWA) byggd för en användare: lugn, evidensbaserad och gjord för att hålla i månader, inte veckor.

- **Produktbrief:** [`docs/brief.md`](docs/brief.md)
- **Forskningsrapport:** [`docs/research.md`](docs/research.md)
- **Byggplan:** [`docs/plan.md`](docs/plan.md)
- **Kom igång (Supabase + Vercel):** [`docs/setup.md`](docs/setup.md)

## Teknik

Next.js 15 (App Router) · React 19 · TypeScript · Tailwind CSS v4 · Supabase (Auth, Postgres + RLS, pg_cron) · Web Push · Vercel.

## Struktur

```
app/(app)/        Mammas app: Idag, Framsteg, Mer (+ undersidor)
app/(focus)/pass  Guidat passläge (helskärm)
app/valkommen     Introduktion första gången
app/admin         Oscars admin-vy
app/api/push      Utskick av påminnelser (anropas av Supabase cron)
components/       UI (ui/, today/, log/, pass/, progress/, mer/, admin/)
lib/program/      Övningsbibliotek, faser, pass, dagsförslag, progression
lib/              Datum (Europe/Stockholm), hälsodata, statistik, Supabase-klienter
supabase/         SQL-migration (schema + RLS) och cron-mall
tests/            Logiktester (vitest)
```

## Principer i koden

- **Konsekvens före intensitet:** minsta dos (en låt) räknas, veckomål 4/7, inga kedjor som bryts.
- **"Mycket energi" ger aldrig mer** än en vanlig dag. Ökningar sker högst var 14:e dag och bara med hennes ja.
- **Admin kan läsa men aldrig ändra** hennes loggar (RLS). Förslag kräver hennes godkännande.
- **Lättare gäller direkt, svårare kräver ja.**
