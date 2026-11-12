# Supermom — Produktbrief

> Sammanställd från frågerundan 2026-11-12. Detta är underlaget för research, plan och bygge.

## Om henne
- Kvinna, 51 år, ca 160 cm, 140 kg. Nästan inaktiv idag.
- Inga underliggande skador — alla besvär kommer av övervikten.
- Tar **Mounjaro (tirzepatid)**, veckospruta. Doseringsdetaljer ej klara än.
- **Bipolär**, sjukskriven, hemma dagarna (handlar med mormor ibland).
- Läkaren är **inte tillfrågad** om träning än → mjuk inkörningsfas + påminnelse att fråga.
- Energin **växlar mycket** över dagen/dagarna.
- Van mobilanvändare (Samsung, Android, Chrome).

## Hennes dröm (hennes "varför")
Att vara så i form att hon kan ta på sig hörlurarna och **gå ut och springa till musik**. Älskar musik.

## Största risk: att det blir "en period"
Hon kör helhjärtat 1–2 veckor och tappar sedan. Orsaker hon har:
- För omständligt
- Ett missat pass = allt är förstört
- Ser inga resultat
- Blir tråkigt
- Glömmer varför hon började / känns som att det inte spelar roll

→ **Appens viktigaste uppgift är att bli en naturlig, långsiktig rutin och en del av hennes identitet.**

## Träningsramar
- **Inga hopp, ingen löpning, ingen hög ledbelastning** (i början). Löpning är ett långsiktigt drömmål, nås via en stegvis "resa".
- Hemma eller ute. Ingen gym.
- Utrustning: upprätt motionscykel, gummiband med handtag, minibands, lätta hantlar, stabil stol, mattor.
- Golvövningar fungerar men belastar → alltid stol/stående alternativ.
- Tid: helt flexibel.
- Zumba (lågbelastande) som framtida möjlighet.
- **Hänghud-prio:** styrketräning för muskelbevarande + riktade zoner (armar, innerlår, säte, mage, rygg) + protein.

## Funktioner
- **Dashboard:** vikt + graf (veckosnitt) + BMI, kroppsmått (armar, lår, midja, höft m.m.).
- **Dagbok:** smidig daglig loggning av mående/energi/känsla.
- **Hälsa:** så mycket som hjälper henne — protein & vatten, mående/biverkningar, steg/promenader, sprutlogg (dos-detaljer senare).
- **Kost:** superenkel rutin — proteinfokus, idéer på bra matalternativ. Ingen kaloriräkning.
- **Inget viktmål.** Fokus på vanor, styrka, mått, "dyka upp".
- **Övningar:** text + illustration, videolänkar, guidat läge med timer, lättare/svårare variant. Aldrig överväldigande.
- **Motivation:** mjuk & förlåtande. "Dyka upp-dagar" — även 2 minuter räknas, aldrig "kedjan bryts". "Tung dag"-läge.
- **Varför:** hennes egna ord, visat på ett positivt sätt + pepp-meddelanden från Oscar.
- **Musik:** hennes egna spellistor i appen.
- **Notiser (web push):** dagens rörelse, protein & vatten. Sprutdag senare.
- **AI-coach:** senare (inte nu).

## Användare & inloggning
- Två konton: mamma + Oscar (admin). Ingen öppen registrering.
- Inloggning: e-post + lösenord, långvarig session, PWA på hemskärmen.
- Admin ser allt (även dagbok) och kan redigera programmet.

## Design
- "Som en ny Apple-produkt" — extremt funktionell, proffsig, aldrig överväldigande.
- Ljust läge primärt (mjukt vitt), dark mode som alternativ.
- Accent: lime/grön energi (se `designinspo/`).
- Namn: **Supermom**. Språk: **svenska**.

## Teknik
- Next.js (bygg om ordentligt, uppgradera), Tailwind, Supabase (Pro), Vercel.
- Endast mobil-webb (PWA). Oscar kopplar Supabase/Vercel.

## Hälsoflaggor att hantera varsamt
- Bipolär: undvik skam, press och streaks; logga mående; uppmärksamma mönster utan att diagnostisera.
- Om litium: uttorkning (illamående/kräkningar från Mounjaro) kan påverka litiumnivåer → vätska viktig, läkarkontakt.
- Snabb viktnedgång + lågt proteinintag → muskelförlust. Styrka + protein är kärnan.
