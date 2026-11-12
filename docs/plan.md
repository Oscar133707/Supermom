# Supermom — Byggplan

> Bygger på `docs/brief.md` (dina svar) och `docs/research.md` (evidensen).
> Princip: **konsekvens före intensitet**. Appen byggs för månad 1–4, inte vecka 1–2.

---

## 1. Vad appen är, i en mening

En lugn, premium mobilapp där mamma varje dag ser **en enda sak att göra** som passar dagsformen, kan logga allt med ett tryck, och där varje liten insats räknas — medan styrka och protein i bakgrunden skyddar hennes muskler.

## 2. Teknik

| Del | Val | Varför |
|---|---|---|
| Ramverk | **Next.js 15 (App Router) + React 19 + TypeScript** | Bygger om från grunden (gamla koden tas bort) |
| Styling | **Tailwind CSS v4** + egna designtokens | Ljust/mörkt tema, lime-accent |
| Animation | Framer Motion (sparsamt) | Apple-känsla i övergångar, bottenark |
| Grafer | Lättviktig egen SVG / Recharts | Trendlinje för vikt, ringar |
| Backend | **Supabase** (Auth, Postgres + RLS, Storage, Edge Functions, pg_cron) | Du har Pro → inga pausade projekt |
| Hosting | **Vercel** | Kopplas till GitHub-repot |
| PWA | Manifest + service worker (Serwist) | Installeras på hemskärmen, offline-skal |
| Push | **Web Push (VAPID)** via Supabase pg_cron → Edge Function | Webben kan inte schemalägga lokala notiser |

**Inloggning:** e-post + lösenord, ingen öppen registrering (konton skapas av dig). Sessionen förnyas automatiskt → hon förblir inloggad.

## 3. Navigering & skärmar

Tre flikar + en loggknapp. Aldrig mer på en skärm än nödvändigt.

```
┌────────────────────────────┐
│  Idag   │  [+]  │ Framsteg │ Mer
└────────────────────────────┘
```

### Idag (hem)
1. Hälsning + datum.
2. **Energikoll** (ett tryck): Tung dag · Vanlig dag · Mycket energi.
3. **Dagens förslag** — ett stort kort med *en* huvudknapp ("Starta 12 min styrka" / "Dansa till 1 låt"). "Mycket energi" ger samma plan som vanlig dag + lugn rad.
4. **Minsta dos-knapp** alltid synlig: "Jag rörde mig (1 låt / 2 min)".
5. Små ringar: Veckomål (x/4 dagar) · Protein (g/90) · Vatten (glas/8).
6. Hennes **"varför"** + dagens om-då-plan, diskret.
7. Ibland: meddelande från Oscar.

### + Logga (bottenark)
Stora knappar, ett tryck, "Sparat · Ångra"-toast:
- **Protein** — portionsknappar (Kvarg 200 g ≈ 20 g, 2 ägg ≈ 12 g, Proteindryck ≈ 20 g …)
- **Vatten** — +1 glas
- **Rörelse** — promenad/cykel/dans/styrka + minuter
- **Dagbok** — humör −3…+3, energi, sömn, valfri anteckning
- **Spruta** — dos, ställe (förifyllt från förra), datum
- **Mående** — illamående/kräkning/diarré/förstoppning 0–3 + "röd flagga"-symtom
- **Vikt / mått**

### Passläge (helskärm)
Guidat steg-för-steg: övningsnamn, enkel illustration, 2–3 korta instruktioner, nedräkning eller repetitioner, vila, nästa. Knapp för **Lättare / Svårare** och alltid en **stolversion**. Skärmen hålls tänd (Wake Lock), timern bygger på tidsstämplar, ljudsignaler via Web Audio. Före passet: "Starta din musik" (öppnar hennes spellista). Efter passet: "Hur mår du nu?" (före/efter-känsla) + ansträngning 0–10.

### Framsteg
- **Räknare som bara växer:** rörelsedagar, låtar, minuter, styrkepass.
- **Veckosammanfattning** ("Du mådde bättre efter 8 av 10 pass").
- **Styrka:** funktionstester (uppresningar på 30 s, gångminuter, cykelminuter) som stigande kurvor.
- **Kropp:** vikt som utjämnad trendlinje (dagliga mätningar som svaga punkter), mått "sedan start".
- **Resan:** fasstege mot målet "springa ute med musik i lurarna".

### Mer
Mina spellistor · Mitt varför & planer · Påminnelser · Utseende (ljust/mörkt) · Spruta & dos · Övningsbibliotek · Fråga läkaren-lista · **Behöver du stöd nu?** (112, 1177, Självmordslinjen 90101) · Vad Oscar ser · Logga ut.

### Admin (Oscar)
- Översikt: veckan, rörelsedagar, protein/vatten, mående, sprutor, dagbok (med sammanhang, inte bara råa siffror).
- **Meddelandekö:** skriv pepp som släpps vid comeback, milstolpar och tunga dagar (1–2/vecka).
- **Program:** se fas och nivåer, föreslå ändringar. Förslag som gör det *tyngre* kräver hennes ja.
- Hantera övningsbibliotek (videolänkar m.m.).

## 4. Onboarding (första gången, ~3 min)
1. Välkommen + vad appen är (och inte är).
2. **Ditt varför** — hennes egna ord (+ valfritt foto).
3. **Ankarrutiner** — "När jag druckit förmiddagskaffet, då…" + plan för tunga dagar.
4. **Hälsofrågor** — tar du litium? (Ja/Nej/Vet inte) · dosstart Mounjaro · längd/startvikt.
5. **Läkarkontakt** — "Fråga läkaren om träningsplanen" läggs som vänlig uppgift.
6. **Påminnelser** — välj tid → först då frågar vi om notistillstånd.
7. Lägg till en spellista (valfritt).

## 5. Träningsmotorn

- **Faser** enligt researchen (0 Inkörning → 1 Grund → 2 Uppbyggnad → 3 Styrka & löpförberedelse → Gång-jogg). Fasbyte styrs av **kriterier**, inte datum.
- **Dagsplan** genereras av: fas × energikoll × om det är styrkedag × biverkningar senaste dygnen.
  - Tung dag → minsta dos (1 låt / 5 min gång + 3 stolövningar).
  - Vanlig/Mycket energi → fasens pass.
  - Dag 1–3 efter dosökning med kraftiga biverkningar → lätt dag.
- **Dubbel progression** per övning (nivåstege per övning). Ökningsförslag högst var 14:e dag och bara med hennes ja. Automatisk lättare vecka var 5–6:e vecka.
- **Övningsbibliotek** (~25 övningar från start), varje med: steg, fokus-zon (armar, innerlår, säte, rygg, bål, ben, vader), stolversion, lättare/svårare, valfri videolänk (fylls i av dig).
- **Riktade zoner** (din prioritet): extra volym för triceps/biceps/axlar, innerlår (adduktorer), säte och rygg — ärligt motiverat med *muskler och styrka*, inte "strama hud".
- **Stoppregler** syns i passläget (bröstsmärta, yrsel, ovanlig andfåddhet, oregelbunden puls → avbryt + 1177/112).

## 6. Hälsa & säkerhet

- **Protein:** mål 90 g, golv 60 g, 25–30 g/måltid. Läge för låg aptit (5 minimåltider) när illamående loggats. Svensk livsmedelslista med portionsknappar.
- **Vatten:** 8 glas (2 l). +2 glas på träningsdagar. Vid kräkning/diarré: vätskeläge med extra vatten + vätskeersättning.
- **Litium-läge** (bara om "Ja"): tydligare vätskefokus, varningskort vid kräkning/diarré/lågt intag, påminnelse om blodprov vid start och vid varje dosökning.
- **Sprutlogg:** visar "dag X efter sprutan" och "vecka Y på denna dos"; markerar 2 veckor efter dosökning som förväntad biverkningstopp; lär sig hennes eget mönster efter 3–4 sprutor.
- **Röda flaggor** (svår buksmärta, ihållande kräkningar, tecken på uttorkning, bröstsmärta …) → stoppskärm med 1177/112.
- **Mönsterkort** i dagboken (t.ex. flera nätter lite sömn + hög energi) — utan diagnosspråk, hänvisar till hennes egen plan/vårdkontakt.
- **Ton:** aldrig "missat", aldrig rött vid viktuppgång, aldrig "borde/fusk/fetma". Pausläge utan straff.

## 7. Datamodell (Supabase, alla tabeller med RLS)

| Tabell | Innehåll |
|---|---|
| `profiles` | roll (mom/admin), namn, längd, startvikt, litium, varför, ankarrutiner, tidszon, inställningar |
| `daily_checkins` | datum, energi, humör, sömn, medicin, anteckning |
| `activities` | datum, typ, minuter, låtar, känsla före/efter, ansträngning, kopplat pass |
| `workout_logs` | genomförda pass: övningar, set, reps, nivå, ansträngning |
| `exercises` | övningsbiblioteket (seedas) |
| `exercise_levels` | hennes aktuella nivå per övning |
| `program_state` | fas, fasstart, senaste ökningsförslag, deload-datum |
| `program_proposals` | ökningsförslag (system/Oscar) + status (väntar/ja/nej) |
| `intake_logs` | protein/vatten-poster |
| `injections` | datum, dos, ställe |
| `symptoms` | datum, illamående/kräkning/diarré/förstoppning 0–3, röd flagga |
| `body_metrics` | datum, vikt, midja, höft, bröst, överarm, lår, vad |
| `function_tests` | datum, test, värde |
| `playlists` | namn, URL, typ |
| `messages` | Oscars pepp, utlösare, släppt/läst |
| `push_subscriptions`, `reminders` | push-endpoints, tider (Europe/Stockholm) |

Mamma kan bara läsa/skriva sin egen data. Admin kan läsa hennes data och skriva meddelanden/förslag — men **inte ändra hennes loggar**.

## 8. Design

- **Ljust tema primärt** (mjukt vitt `#FAFAF7`-ish), mörkt som alternativ; följer systemet om inget valt.
- **Lime** som energi-accent i ringar, fyllda knappar och stora ytor. Text på/nära lime alltid mörk (kontrast).
- Typsnitt: Inter eller Geist; brödtext 17–18 px, hjältesiffror 40–56 px, timer ≥72 px.
- Tryckytor ≥48 px, huvudknappar 56–64 px. Mjuka hörn, luft, en sak i fokus per skärm.
- Ingen bekräftelsedialog — "Sparat · Ångra" i stället.

## 9. Byggordning

| Steg | Innehåll | Resultat |
|---|---|---|
| **1. Grund** | Rensa gamla koden, Next 15, designsystem, Supabase-schema + RLS + seed, inloggning, PWA-skal | Du kan logga in på Vercel och se ett tomt, snyggt skal |
| **2. Idag-kärnan** | Onboarding, energikoll, dagsförslag, minsta dos, veckoring, varför | Det viktigaste vanebeteendet fungerar |
| **3. Passläge** | Övningsbibliotek, fas 0–1-program, guidat läge med timer, före/efter-känsla | Hon kan träna guidat |
| **4. Loggning** | Bottenark: protein, vatten, dagbok, spruta, mående, vikt/mått, röda flaggor, krisstöd, litium-läge | All hälsodata på plats |
| **5. Framsteg** | Räknare, veckosammanfattning, trendgraf, funktionstester | Hon ser resultat utöver vågen |
| **6. Admin** | Din översikt, meddelandekö, programförslag | Du kan stötta |
| **7. Notiser** | VAPID, Edge Function, pg_cron, påminnelseinställningar | Mjuka påminnelser |
| **8. Vanemotor** | Välkommen tillbaka, dag 10–14-förstärkning, progressionsförslag, deload, musikflöde | Det som bär henne förbi vecka 2 |
| **Senare** | Löpresan, kunskapskort (hud m.m.), export till vården, krisplan, Zumba-pass, AI-coach | |

Efter varje steg: commit + push, och du kan testa på Vercel.

## 10. Det du behöver göra

1. Skapa (eller använd) ett Supabase-projekt i EU-region. Ge mig URL + anon key, och kör SQL-migrationerna jag skriver (eller ge mig databas-URL så kör jag dem).
2. Koppla repot till Vercel och lägg in miljövariablerna.
3. Skapa två konton i Supabase Auth (ditt + mammas) — jag skriver exakt hur.
4. Ta reda på om hon tar litium, och be hennes läkare titta på träningsplanen.
5. Testa på hennes Samsung: installera på hemskärmen, notiser, Spotify-länk.

## 11. Ärliga begränsningar
- Illustrationerna blir enkla, egna (SVG) — inte foton/filmer. Videolänkar kan du lägga in per övning.
- Svensk talsyntes på Android är opålitlig → passläget använder ljudsignaler + stor text, röst bara om telefonen har svensk röst.
- Flera siffror i researchen kommer från sammanfattningar och kontrolleras innan de visas (proteinhalter, självmordslinjens öppettider m.m.).
- Appen är ett stöd, inte vård. Den ersätter inte läkare eller psykiatrin.
