import { requireMom } from "@/lib/data";
import { SubHeader } from "@/components/mer/sub-header";
import { MEAL_IDEAS, LOW_APPETITE_TIPS } from "@/lib/health";

const CARDS: { title: string; body: string[] }[] = [
  {
    title: "Varför styrketräning är kärnan",
    body: [
      "När man går ner i vikt – även med Mounjaro – kommer ungefär en fjärdedel av det man tappar från muskler och annan fettfri vävnad om man inte gör något åt det.",
      "Styrketräning och tillräckligt med protein hjälper kroppen att behålla musklerna. Det gör dig starkare, ger ork i vardagen och bygger grunden för att en dag kunna springa.",
    ],
  },
  {
    title: "Ärligt om lös hud",
    body: [
      "Efter en stor viktnedgång får de flesta lite lös hud, ofta på magen, överarmarna och innerlåren. Det är ett tecken på hur mycket kroppen har förändrats – inte på att du gjort något fel.",
      "Ingen träning, kräm, kollagen eller långsam takt har visats kunna förhindra det. Det som styr mest är hur mycket man går ner, ålder och gener.",
      "Det du kan påverka: starka muskler under huden (armar, lår, säte), att inte röka, att skydda huden mot sol och att ta hand om hudveck så de inte skaver.",
      "Om huden besvärar dig när vikten varit stabil en tid kan du prata med vården om vilka möjligheter som finns. Regler skiljer sig mellan regioner.",
    ],
  },
  {
    title: "Små steg är inte för lite",
    body: [
      "En ny vana tar ofta 2–4 månader att sätta sig – vecka 2–3 är ofta tyngst. Det är normalt.",
      "En missad dag påverkar inte vanan. Det viktiga är att komma tillbaka – därför räknas även en enda låt.",
    ],
  },
  {
    title: "Mounjaro och magen",
    body: [
      "Illamående, diarré eller förstoppning är vanligast de första veckorna efter en ny dos och brukar lätta.",
      "Ät små mål, sluta när du är nöjd, drick ordentligt och undvik fet mat de tyngsta dagarna.",
      "Kontakta vården vid svår magsmärta, kräkningar som inte går över eller tecken på uttorkning.",
    ],
  },
  {
    title: "Vägen mot löpning",
    body: [
      "Varje kilo du går ner minskar belastningen på knäna i varje steg. Samtidigt blir benen starkare av styrketräningen.",
      "Första joggsnuttarna kommer när benen är redo – inte efter ett visst datum. Appen hjälper dig se när.",
    ],
  },
];

export default async function KnowledgePage() {
  await requireMom();
  return (
    <main className="flex flex-col gap-4 px-4 pt-4">
      <SubHeader title="Bra att veta" />
      {CARDS.map((c) => (
        <details key={c.title} className="group rounded-[1.5rem] bg-surface shadow-card">
          <summary className="flex min-h-16 cursor-pointer list-none items-center justify-between px-5 font-semibold">
            {c.title}
            <span className="text-ink-3 transition-transform group-open:rotate-45">+</span>
          </summary>
          <div className="space-y-3 px-5 pb-5 text-ink-2">
            {c.body.map((p) => (
              <p key={p}>{p}</p>
            ))}
          </div>
        </details>
      ))}
      <details className="group rounded-[1.5rem] bg-surface shadow-card">
        <summary className="flex min-h-16 cursor-pointer list-none items-center justify-between px-5 font-semibold">
          Matidéer med mycket protein
          <span className="text-ink-3 transition-transform group-open:rotate-45">+</span>
        </summary>
        <div className="space-y-4 px-5 pb-5">
          {MEAL_IDEAS.map((m) => (
            <div key={m.title}>
              <p className="text-sm font-semibold">{m.title}</p>
              <ul className="mt-1 space-y-1 text-ink-2">
                {m.items.map((i) => (
                  <li key={i}>• {i}</li>
                ))}
              </ul>
            </div>
          ))}
          <div>
            <p className="text-sm font-semibold">När aptiten är låg</p>
            <ul className="mt-1 space-y-1 text-ink-2">
              {LOW_APPETITE_TIPS.map((i) => (
                <li key={i}>• {i}</li>
              ))}
            </ul>
          </div>
        </div>
      </details>
      <p className="px-1 pt-2 text-xs text-ink-3">
        Informationen bygger på aktuell forskning men ersätter inte råd från din vårdkontakt.
      </p>
    </main>
  );
}
