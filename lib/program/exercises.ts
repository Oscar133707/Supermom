// ════════════════════════════════════════════════════════════════════════════
// Övningsbibliotek
// Varje övning har nivåer (1 = lättast). "Lättare/Svårare" i passläget flyttar
// en nivå. Nivå 1 är alltid en sittande/stödd variant. Inga hopp, inget golv i
// fas 0. Urval enligt docs/research.md (stora flerledsrörelser, stöd av stol/vägg,
// extra fokus på armar, innerlår, säte och rygg).
// ════════════════════════════════════════════════════════════════════════════

export type Zone =
  | "armar"
  | "axlar"
  | "rygg"
  | "brost"
  | "bal"
  | "sate"
  | "innerlar"
  | "ben"
  | "vader";

export const ZONE_LABEL: Record<Zone, string> = {
  armar: "Armar",
  axlar: "Axlar",
  rygg: "Rygg",
  brost: "Bröst",
  bal: "Bål",
  sate: "Säte",
  innerlar: "Innerlår",
  ben: "Ben",
  vader: "Vader",
};

export interface ExerciseLevel {
  name: string;
  how: string; // vad som skiljer denna nivå
}

export interface Exercise {
  key: string;
  name: string;
  zones: Zone[];
  mode: "reps" | "hold"; // hold = varje repetition är en hållning i sekunder
  holdSeconds?: number;
  equipment: string[];
  steps: string[]; // 2–4 korta instruktioner
  tip: string; // en känslomässigt lugn påminnelse
  levels: ExerciseLevel[];
  minPhase: number;
}

export const EXERCISES: Exercise[] = [
  {
    key: "sit_to_stand",
    name: "Uppresning från stol",
    zones: ["ben", "sate"],
    mode: "reps",
    equipment: ["Stabil stol"],
    steps: [
      "Sitt längst fram på stolen, fötterna höftbrett.",
      "Luta dig lätt framåt, tryck genom hälarna och res dig.",
      "Sätt dig långsamt – räkna till tre på vägen ner.",
    ],
    tip: "Andas ut när du reser dig.",
    levels: [
      { name: "Med armstöd", how: "Ta hjälp av händerna på armstöden eller låren." },
      { name: "Händer på låren", how: "Låt händerna vila på låren och tryck lätt." },
      { name: "Utan händer", how: "Korsa armarna över bröstet." },
      { name: "Långsam nedfart", how: "Utan händer, fem sekunder ner." },
      { name: "Med hantel", how: "Håll en hantel mot bröstet." },
      { name: "Delad fotställning", how: "Ena foten lite framför den andra. Byt sida varannat set." },
    ],
    minPhase: 0,
  },
  {
    key: "wall_pushup",
    name: "Armhävning mot vägg",
    zones: ["brost", "armar", "axlar"],
    mode: "reps",
    equipment: ["Vägg"],
    steps: [
      "Stå en armlängd från väggen, händerna i axelhöjd.",
      "Böj armarna och för bröstet mot väggen.",
      "Tryck tillbaka tills armarna är raka.",
    ],
    tip: "Håll kroppen rak som en planka.",
    levels: [
      { name: "Nära väggen", how: "Stå bara ett litet steg från väggen." },
      { name: "En armlängd", how: "Stå en armlängd från väggen." },
      { name: "Längre ut", how: "Ta ett halvt steg längre bak." },
      { name: "Mot köksbänk", how: "Händerna på en stabil köksbänk." },
      { name: "Mot bord", how: "Händerna på ett stabilt, tungt bord." },
    ],
    minPhase: 0,
  },
  {
    key: "band_row",
    name: "Roddrag med band",
    zones: ["rygg", "armar"],
    mode: "reps",
    equipment: ["Gummiband med handtag"],
    steps: [
      "Sitt rakt, bandet runt fötterna eller fäst i dörren.",
      "Dra handtagen mot midjan, armbågarna nära kroppen.",
      "Kläm ihop skulderbladen en sekund, släpp långsamt.",
    ],
    tip: "Tänk ”stolt bröst”.",
    levels: [
      { name: "Lätt band, sittande", how: "Lättaste bandet." },
      { name: "Mellanband, sittande", how: "Ett styvare band." },
      { name: "Stående", how: "Bandet fäst i dörren, stå stadigt." },
      { name: "Tungt band, stående", how: "Det styvaste bandet." },
      { name: "Enarmsrodd med hantel", how: "Stöd ena handen på stolen, dra hanteln mot höften." },
    ],
    minPhase: 0,
  },
  {
    key: "triceps_overhead",
    name: "Triceps över huvudet",
    zones: ["armar"],
    mode: "reps",
    equipment: ["Hantel eller band"],
    steps: [
      "Sitt rakt. Håll vikten med båda händerna bakom huvudet.",
      "Sträck armarna rakt upp mot taket.",
      "Sänk långsamt bakom huvudet igen – armbågarna pekar framåt.",
    ],
    tip: "Det här är baksidan av armen – den som du vill stärka.",
    levels: [
      { name: "Lätt band", how: "Kort rörelse med ett lätt band." },
      { name: "1 kg", how: "En lätt hantel i båda händerna." },
      { name: "2 kg", how: "" },
      { name: "3 kg", how: "" },
      { name: "4–5 kg", how: "" },
    ],
    minPhase: 0,
  },
  {
    key: "biceps_curl",
    name: "Bicepscurl",
    zones: ["armar"],
    mode: "reps",
    equipment: ["Hantlar eller band"],
    steps: [
      "Sitt eller stå med armarna längs sidorna.",
      "Böj armbågarna och lyft vikten mot axlarna.",
      "Sänk långsamt – armbågarna stilla vid kroppen.",
    ],
    tip: "Långsamt ner ger mest.",
    levels: [
      { name: "Lätt band", how: "Stå på bandet eller sitt på det." },
      { name: "1–2 kg", how: "" },
      { name: "2–3 kg", how: "" },
      { name: "3–4 kg", how: "" },
      { name: "4–5 kg", how: "" },
    ],
    minPhase: 0,
  },
  {
    key: "knee_squeeze",
    name: "Knäpress mot kudde",
    zones: ["innerlar"],
    mode: "hold",
    holdSeconds: 5,
    equipment: ["Kudde eller boll", "Stol"],
    steps: [
      "Sitt med en kudde mellan knäna.",
      "Pressa ihop knäna mot kudden och håll.",
      "Släpp långsamt och andas.",
    ],
    tip: "Innerlåren jobbar – andas lugnt hela tiden.",
    levels: [
      { name: "Mjukt tryck", how: "Pressa lagom hårt, 5 sekunder." },
      { name: "Fast tryck", how: "Pressa ordentligt, 5 sekunder." },
      { name: "Längre håll", how: "Pressa ordentligt, 8 sekunder." },
      { name: "Med pulser", how: "Håll pressen och gör små extra tryck." },
    ],
    minPhase: 0,
  },
  {
    key: "seated_abduction",
    name: "Knän isär med miniband",
    zones: ["sate"],
    mode: "reps",
    equipment: ["Miniband", "Stol"],
    steps: [
      "Sitt med minibandet runt låren, strax ovanför knäna.",
      "För isär knäna mot bandet.",
      "För tillbaka långsamt.",
    ],
    tip: "Det ska bränna lite på utsidan av sätet – det är bra.",
    levels: [
      { name: "Utan band", how: "Tryck händerna mot knänas utsidor i stället." },
      { name: "Lätt miniband", how: "" },
      { name: "Mellanband", how: "" },
      { name: "Stående sidsteg", how: "Stå med bandet och ta små steg åt sidan, 5 åt varje håll = 1 rep." },
    ],
    minPhase: 0,
  },
  {
    key: "band_pull_apart",
    name: "Bandisärdrag",
    zones: ["rygg", "axlar"],
    mode: "reps",
    equipment: ["Gummiband"],
    steps: [
      "Håll bandet framför dig i axelhöjd, armarna nästan raka.",
      "Dra isär bandet så att skulderbladen närmar sig varandra.",
      "Släpp tillbaka långsamt.",
    ],
    tip: "Bra för hållningen – axlarna bort från öronen.",
    levels: [
      { name: "Lätt band, brett grepp", how: "" },
      { name: "Lätt band, smalare grepp", how: "" },
      { name: "Mellanband", how: "" },
      { name: "Tungt band", how: "" },
    ],
    minPhase: 0,
  },
  {
    key: "seated_march",
    name: "Sittande marsch",
    zones: ["bal", "ben"],
    mode: "reps",
    equipment: ["Stol"],
    steps: [
      "Sitt rakt, håll i stolens kanter.",
      "Spänn magen lätt och lyft ett knä i taget.",
      "Ett lyft per ben = 1 repetition.",
    ],
    tip: "Rak rygg, lugn andning.",
    levels: [
      { name: "Små lyft", how: "Lyft foten bara några centimeter." },
      { name: "Höga lyft", how: "Lyft knät så högt det går." },
      { name: "Utan händer", how: "Armarna i kors över bröstet." },
      { name: "Stående marsch", how: "Stå med stöd av stolsryggen." },
    ],
    minPhase: 0,
  },
  {
    key: "calf_raise",
    name: "Tåhävning",
    zones: ["vader"],
    mode: "reps",
    equipment: ["Stol som stöd"],
    steps: [
      "Stå bakom stolen och håll i ryggstödet.",
      "Gå upp på tå så högt det går.",
      "Sänk långsamt ner hälarna.",
    ],
    tip: "Vaderna är dina framtida löparmuskler.",
    levels: [
      { name: "Sittande", how: "Sitt och lyft hälarna, gärna med hantlar på knäna." },
      { name: "Stående med stöd", how: "" },
      { name: "Långsam nedfart", how: "Tre sekunder ner." },
      { name: "Ett ben i taget", how: "Med stöd, byt ben varannat set." },
    ],
    minPhase: 0,
  },
  {
    key: "lateral_raise",
    name: "Sidolyft",
    zones: ["axlar", "armar"],
    mode: "reps",
    equipment: ["Lätta hantlar"],
    steps: [
      "Sitt eller stå, en vikt i varje hand.",
      "Lyft armarna ut åt sidorna till axelhöjd.",
      "Sänk långsamt.",
    ],
    tip: "Lätt vikt räcker – kontroll är viktigare än tyngd.",
    levels: [
      { name: "Utan vikt", how: "" },
      { name: "0,5–1 kg", how: "" },
      { name: "1–2 kg", how: "" },
      { name: "2–3 kg", how: "" },
    ],
    minPhase: 1,
  },
  {
    key: "chest_press_band",
    name: "Bröstpress med band",
    zones: ["brost", "armar"],
    mode: "reps",
    equipment: ["Gummiband med handtag", "Stol"],
    steps: [
      "Lägg bandet bakom ryggen/stolsryggen, ett handtag i varje hand.",
      "Tryck händerna rakt fram.",
      "För tillbaka långsamt.",
    ],
    tip: "Andas ut när du trycker.",
    levels: [
      { name: "Lätt band", how: "" },
      { name: "Mellanband", how: "" },
      { name: "Tungt band", how: "" },
      { name: "Stående i delad fotställning", how: "" },
    ],
    minPhase: 1,
  },
  {
    key: "sumo_stand",
    name: "Bred uppresning",
    zones: ["innerlar", "sate", "ben"],
    mode: "reps",
    equipment: ["Stabil stol"],
    steps: [
      "Sitt med fötterna brett isär, tårna lätt utåt.",
      "Res dig med knäna i linje med tårna.",
      "Sätt dig långsamt.",
    ],
    tip: "Den breda ställningen ger innerlåren extra jobb.",
    levels: [
      { name: "Med händer", how: "" },
      { name: "Utan händer", how: "" },
      { name: "Med hantel", how: "Håll en hantel mellan benen." },
      { name: "Paus ovanför stolen", how: "Stanna en sekund strax innan du sätter dig." },
    ],
    minPhase: 1,
  },
  {
    key: "side_lying_adduction",
    name: "Sidliggande innerlårslyft",
    zones: ["innerlar"],
    mode: "reps",
    equipment: ["Säng eller matta"],
    steps: [
      "Ligg på sidan i sängen. Böj det övre benet och ställ foten framför det undre.",
      "Lyft det undre, raka benet några centimeter.",
      "Sänk långsamt. Byt sida varannat set.",
    ],
    tip: "Små rörelser räcker – det är innerlåret som jobbar.",
    levels: [
      { name: "I sängen", how: "" },
      { name: "På mattan", how: "" },
      { name: "Med paus uppe", how: "Håll en sekund högst upp." },
      { name: "Med miniband runt anklarna", how: "" },
    ],
    minPhase: 1,
  },
  {
    key: "glute_bridge",
    name: "Höftlyft",
    zones: ["sate", "bal"],
    mode: "reps",
    equipment: ["Säng eller matta"],
    steps: [
      "Ligg på rygg med böjda knän, fötterna i underlaget.",
      "Tryck genom hälarna och lyft höften.",
      "Sänk långsamt.",
    ],
    tip: "Kläm ihop sätet högst upp.",
    levels: [
      { name: "I sängen", how: "" },
      { name: "På mattan", how: "" },
      { name: "Med miniband", how: "Bandet ovanför knäna, tryck lätt utåt." },
      { name: "Med paus", how: "Håll två sekunder högst upp." },
    ],
    minPhase: 1,
  },
  {
    key: "pallof_press",
    name: "Pallof-press",
    zones: ["bal"],
    mode: "reps",
    equipment: ["Gummiband fäst i dörr"],
    steps: [
      "Stå med sidan mot dörren, bandet i båda händerna vid bröstet.",
      "Tryck händerna rakt fram – låt inte bandet vrida dig.",
      "För tillbaka långsamt. Byt sida varannat set.",
    ],
    tip: "Magen jobbar genom att stå emot.",
    levels: [
      { name: "Sittande, lätt band", how: "" },
      { name: "Stående, lätt band", how: "" },
      { name: "Stående, mellanband", how: "" },
      { name: "Med 2 s paus", how: "" },
    ],
    minPhase: 2,
  },
  {
    key: "step_up",
    name: "Uppsteg",
    zones: ["ben", "sate"],
    mode: "reps",
    equipment: ["Nedersta trappsteget", "Ledstång"],
    steps: [
      "Håll i ledstången. Kliv upp på trappsteget med ena foten.",
      "Tryck dig upp och ställ den andra foten bredvid.",
      "Kliv ner kontrollerat. Byt ledben varannat set.",
    ],
    tip: "Håll alltid i något.",
    levels: [
      { name: "Lågt steg, två händer", how: "" },
      { name: "Lågt steg, en hand", how: "" },
      { name: "Långsam nedfart", how: "" },
      { name: "Med hantel", how: "" },
    ],
    minPhase: 2,
  },
];

export const EXERCISE_BY_KEY: Record<string, Exercise> = Object.fromEntries(
  EXERCISES.map((e) => [e.key, e]),
);

export function getExercise(key: string): Exercise {
  const e = EXERCISE_BY_KEY[key];
  if (!e) throw new Error(`Unknown exercise ${key}`);
  return e;
}

export function clampLevel(ex: Exercise, level: number): number {
  return Math.min(Math.max(1, level), ex.levels.length);
}
