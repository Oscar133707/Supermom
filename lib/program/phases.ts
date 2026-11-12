// Fasstruktur enligt docs/research.md ("Träningsfaser"). Fasbyte styrs av
// kriterier och kräver alltid hennes ja.

export interface PhaseDef {
  id: number;
  name: string;
  short: string;
  summary: string;
  strengthPerWeek: (weeksInPhase: number) => number;
  sets: number;
  repMin: number;
  repMax: number;
  restSec: number;
  effort: string; // ansträngning i ord
  cardioMinutes: number; // förslag per pass
  cardioEffort: string;
  weeklyMinutesGoal: string;
  criteria: string[]; // kriterier för att gå vidare
}

export const PHASES: PhaseDef[] = [
  {
    id: 0,
    name: "Inkörning",
    short: "Fas 0",
    summary: "Korta, lätta stunder. Kroppen och vanan vänjer sig.",
    strengthPerWeek: () => 2,
    sets: 1,
    repMin: 8,
    repMax: 12,
    restSec: 60,
    effort: "Lätt – du kan prata och sjunga",
    cardioMinutes: 4,
    cardioEffort: "Du kan prata och sjunga",
    weeklyMinutesGoal: "10–20 minuter om dagen, utspritt",
    criteria: [
      "Rört dig de flesta planerade dagarna i två veckor",
      "Ingen ledsmärta som sitter i mer än ett dygn",
      "Träningsvärken går över inom två dygn",
    ],
  },
  {
    id: 1,
    name: "Grund",
    short: "Fas 1",
    summary: "Två set per övning och lite längre rörelsestunder.",
    strengthPerWeek: (w) => (w < 3 ? 2 : 3),
    sets: 2,
    repMin: 10,
    repMax: 15,
    restSec: 75,
    effort: "Medel – det känns, men du kan prata",
    cardioMinutes: 8,
    cardioEffort: "Du kan prata men inte sjunga",
    weeklyMinutesGoal: "Mot 150 minuter i veckan",
    criteria: [
      "15 minuter cykel eller promenad i ett svep",
      "2 × 15 uppresningar från stol (eller tydligt bättre än i början)",
      "Styrka minst två gånger i veckan i fyra veckor",
    ],
  },
  {
    id: 2,
    name: "Uppbyggnad",
    short: "Fas 2",
    summary: "Stående övningar, hantlar och promenader ute.",
    strengthPerWeek: () => 3,
    sets: 3,
    repMin: 8,
    repMax: 12,
    restSec: 75,
    effort: "Ganska jobbigt mot slutet av varje set",
    cardioMinutes: 20,
    cardioEffort: "Du kan prata men inte sjunga",
    weeklyMinutesGoal: "150–200 minuter i veckan",
    criteria: [
      "30 minuters promenad utan smärta",
      "Klarar att ta dig ner på golvet och upp",
      "Uppresning med 5 kg × 12",
      "Armhävning mot bänk × 15",
    ],
  },
  {
    id: 3,
    name: "Styrka & löpförberedelse",
    short: "Fas 3",
    summary: "Enbensövningar, backar och starkare vader – grunden för löpning.",
    strengthPerWeek: () => 3,
    sets: 3,
    repMin: 6,
    repMax: 12,
    restSec: 90,
    effort: "Jobbigt – de sista repetitionerna kräver fokus",
    cardioMinutes: 30,
    cardioEffort: "Rask promenad, gärna backe",
    weeklyMinutesGoal: "200–300 minuter i veckan",
    criteria: [
      "30 min rask promenad utan smärta flera dagar i rad",
      "15 uppresningar på ett ben per sida",
      "20 tåhävningar på ett ben per sida",
      "Ingen aktuell ledsmärta",
    ],
  },
  {
    id: 4,
    name: "Gång-jogg",
    short: "Fas 4",
    summary: "Korta joggsnuttar mellan promenadminuter – med musik i lurarna.",
    strengthPerWeek: () => 3,
    sets: 3,
    repMin: 6,
    repMax: 12,
    restSec: 90,
    effort: "Jobbigt – de sista repetitionerna kräver fokus",
    cardioMinutes: 25,
    cardioEffort: "30 s mycket lätt jogg / 2–3 min gång",
    weeklyMinutesGoal: "Gång-jogg 3 gånger i veckan",
    criteria: ["Sammanhängande joggning är målet för år två"],
  },
];

export function getPhase(id: number): PhaseDef {
  return PHASES[Math.min(Math.max(0, id), PHASES.length - 1)];
}

/** Stegen på "Resan" mot drömmen. */
export const JOURNEY = [
  { phase: 0, title: "Dansa till en låt hemma" },
  { phase: 1, title: "15 minuter i ett svep" },
  { phase: 2, title: "30 minuters promenad ute med musik" },
  { phase: 3, title: "Starka ben för löpning" },
  { phase: 4, title: "Första joggsnutten" },
  { phase: 5, title: "Springa ute med musik i lurarna" },
];
