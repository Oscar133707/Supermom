# Supermom — Kom igång (Supabase + Vercel)

Räkna med ungefär 30 minuter. Gör stegen i ordning.

---

## 1. Supabase-projekt

1. Gå till [supabase.com/dashboard](https://supabase.com/dashboard) → **New project**.
   - Region: **North EU (Stockholm)**, så att hälsodatan stannar i Sverige/EU.
   - Spara databaslösenordet någonstans säkert.
2. Öppna **SQL Editor** → **New query**. Klistra in hela innehållet i `supabase/migrations/0001_init.sql` och tryck **Run**.
   Du ska få "Success. No rows returned".

## 2. Inloggning (Auth)

I **Authentication**:

1. **Sign In / Providers → Email**: låt Email vara på. Stäng av **"Allow new users to sign up"**, så att ingen annan kan skapa konto.
2. **URL Configuration**:
   - Site URL: `https://<din-app>.vercel.app` (fylls i efter steg 4. Det går bra att komma tillbaka hit.)
   - Redirect URLs: `https://<din-app>.vercel.app/auth/callback`
3. **Sessions** (om du ser inställningen): låt "Time-box user sessions" och "Inactivity timeout" vara **av**. Då förblir mamma inloggad.

## 3. Skapa de två kontona

1. **Authentication → Users → Add user → Create new user**
   - Ditt konto: e-post + lösenord, bocka i **Auto Confirm User**.
   - Mammas konto: hennes e-post + ett lösenord hon kan komma ihåg (hon kan byta via "Glömt lösenordet?").
2. Gör dig själv till admin i **SQL Editor**:

   ```sql
   update public.profiles set role = 'admin' where email = 'DIN-EPOST';
   ```

   Mammas konto har redan rollen `mom`.

## 4. Vercel

1. Generera nycklar för notiser, lokalt i terminalen i repot:

   ```bash
   npx web-push generate-vapid-keys
   openssl rand -hex 32   # detta blir CRON_SECRET
   ```

2. [vercel.com/new](https://vercel.com/new) → importera GitHub-repot `Supermom` → Framework: **Next.js**.
3. Lägg in miljövariablerna (se `.env.example`):

   | Variabel | Var hittar jag den? |
   |---|---|
   | `NEXT_PUBLIC_SUPABASE_URL` | Supabase → Project Settings → API → Project URL |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase → Project Settings → API → `anon` / publishable key |
   | `SUPABASE_SERVICE_ROLE_KEY` | Supabase → Project Settings → API → `service_role` / secret key (**hemlig**) |
   | `NEXT_PUBLIC_SITE_URL` | Appens adress, t.ex. `https://supermom.vercel.app` |
   | `NEXT_PUBLIC_VAPID_PUBLIC_KEY` | "Public Key" från steg 1 |
   | `VAPID_PRIVATE_KEY` | "Private Key" från steg 1 (**hemlig**) |
   | `VAPID_SUBJECT` | `mailto:` + din e-post |
   | `CRON_SECRET` | Slumpsträngen från steg 1 (**hemlig**) |

4. **Deploy**. Gå sedan tillbaka till Supabase steg 2.2 och fyll i den riktiga adressen.

> Koden ligger på grenen `claude/practical-gates-1uqcuk`. Slå ihop den till `main` (eller välj grenen som Production Branch i Vercel).

## 5. Påminnelser (schemaläggning)

Webben kan inte schemalägga notiser på själva telefonen. I stället anropar Supabase appen var femte minut.

1. Supabase → **Database → Extensions**: slå på **pg_cron** och **pg_net**.
2. **SQL Editor**: klistra in `supabase/cron.sql`, byt ut `<DIN-APP-URL>` och `<CRON_SECRET>`, och kör.

## 6. På mammas telefon

1. Öppna appens adress i **Chrome** och logga in.
2. Chrome-menyn **⋮ → Lägg till på startskärmen / Installera app**.
3. Öppna Supermom **från hemskärmen** och gå igenom introduktionen.
4. **Mer → Påminnelser → Slå på påminnelser** och tillåt notiser.
5. **Mer → Mina spellistor**: lägg in hennes Spotify-spellistor.
6. Om Samsung stoppar notiserna: gå till Inställningar → Appar → Chrome/Supermom → Batteri → **Obegränsad**.

## 7. Ditt admin-läge

Logga in med ditt konto. Då hamnar du på `/admin`:

- **Översikt**: veckan, dagsform, protein och vatten, sprutor och mage, dagbok och vikttrend.
- **Meddelanden**: skriv pepp som släpps vid comeback, milstolpar eller tunga dagar. Högst 2 per vecka släpps automatiskt.
- **Program**: föreslå nästa fas eller nivå. Inget ändras förrän hon själv säger ja.
- **Övningar**: lägg in en videolänk per övning (sittande/stödda varianter, inga hopp).

## 8. Innan du lämnar över

- [ ] Logga in som mamma och gå igenom introduktionen en gång (eller låt henne göra det).
- [ ] Testa ett pass med ljud och skärmlås på hennes telefon.
- [ ] Testa att en påminnelse kommer fram, genom att sätta tiden några minuter fram.
- [ ] Kontrollera Mind Självmordslinjens öppettider på mind.se (källorna går isär).
- [ ] Ta reda på om hon tar litium. Visa i så fall läkaren listan under **Mer → Att ta upp med vården**.

## Utveckling lokalt

```bash
npm install
cp .env.example .env.local   # fyll i värdena
npm run dev                  # http://localhost:3000
npm test                     # logiktester
```
