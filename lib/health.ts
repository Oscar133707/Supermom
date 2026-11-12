import type { InjectionSite } from "@/lib/types";

export const DOSES = [2.5, 5, 7.5, 10, 12.5, 15];

export const SITES: InjectionSite[] = ["mage_v", "mage_h", "lar_v", "lar_h", "arm_v", "arm_h"];

export const SITE_LABEL: Record<InjectionSite, string> = {
  mage_v: "Magen, vänster",
  mage_h: "Magen, höger",
  lar_v: "Låret, vänster",
  lar_h: "Låret, höger",
  arm_v: "Armen, vänster",
  arm_h: "Armen, höger",
};

/** Röda flaggor → stoppskärm med 1177/112. */
export const RED_FLAGS = [
  { key: "buksmarta", label: "Svår, ihållande magsmärta (kan stråla mot ryggen)" },
  { key: "krakningar", label: "Kräks och kan inte behålla vätska" },
  { key: "uttorkning", label: "Mycket lite kiss, yrsel, väldigt torr i munnen" },
  { key: "brostsmarta", label: "Bröstsmärta eller tryck över bröstet" },
  { key: "andning", label: "Svårt att andas" },
  { key: "gulsot", label: "Gulfärgad hud eller ögon" },
  { key: "forvirring", label: "Darrningar, förvirring eller ostadighet" },
] as const;

export const SYMPTOM_LABELS = [
  { key: "nausea", label: "Illamående" },
  { key: "vomiting", label: "Kräkning" },
  { key: "diarrhea", label: "Diarré" },
  { key: "constipation", label: "Förstoppning" },
] as const;

export const SEVERITY = ["Inget", "Lite", "Måttligt", "Mycket"];

/**
 * Portionsknappar för protein. Ungefärliga värden från vanliga svenska
 * förpackningar – visa alltid "ungefär" i UI.
 */
export interface Food {
  key: string;
  label: string;
  portion: string;
  protein: number;
  easy?: boolean; // passar dagar med illamående / låg aptit
}

export const FOODS: Food[] = [
  { key: "kvarg", label: "Kvarg", portion: "200 g", protein: 20, easy: true },
  { key: "proteindryck", label: "Proteindryck", portion: "1 st", protein: 20, easy: true },
  { key: "proteinpudding", label: "Proteinpudding", portion: "1 st", protein: 20, easy: true },
  { key: "skyr", label: "Skyr", portion: "150 g", protein: 15, easy: true },
  { key: "keso", label: "Keso", portion: "1 dl", protein: 12, easy: true },
  { key: "agg", label: "Ägg", portion: "2 st", protein: 13 },
  { key: "mjolk", label: "Mjölk/fil", portion: "2 dl", protein: 7, easy: true },
  { key: "kyckling", label: "Kyckling", portion: "100 g", protein: 25 },
  { key: "tonfisk", label: "Tonfisk", portion: "1 burk", protein: 25 },
  { key: "fisk", label: "Lax/fisk", portion: "100 g", protein: 20 },
  { key: "rakor", label: "Räkor", portion: "100 g", protein: 18 },
  { key: "farser", label: "Köttfärs", portion: "100 g", protein: 22 },
  { key: "artsoppa", label: "Ärtsoppa", portion: "3 dl", protein: 15, easy: true },
  { key: "linser", label: "Linser/bönor", portion: "1,5 dl", protein: 10 },
  { key: "grot", label: "Gröt med kvarg", portion: "1 skål", protein: 15, easy: true },
  { key: "ost", label: "Ost", portion: "2 skivor", protein: 7 },
];

export const MEAL_IDEAS = [
  { title: "Frukost", items: ["Kvarg med bär och lite müsli", "Äggröra på en skiva bröd", "Gröt med en klick kvarg"] },
  { title: "Lunch", items: ["Tonfisksallad med ägg", "Ärtsoppa (gärna med en skiva ost)", "Kyckling, grönsaker och lite potatis"] },
  { title: "Middag", items: ["Lax med grönsaker", "Köttfärssås – protein först, pasta sen", "Räkor med sallad och keso"] },
  { title: "Mellanmål", items: ["Proteinpudding", "Skyr", "Ett glas mjölk eller en proteindryck"] },
];

export const LOW_APPETITE_TIPS = [
  "Fem små mål i stället för tre stora – 15–20 g protein i varje.",
  "Ät proteinet först på tallriken.",
  "Drickbart protein går ofta lättare: proteindryck, mjölk, drickyoghurt.",
  "Kallt och milt brukar kännas bäst: kvarg, keso, skyr.",
  "Sluta äta när du känner dig nöjd – det är helt rätt.",
  "Undvik fet och friterad mat de dagar det känns tungt i magen.",
];

export const HYDRATION_TIPS_LITHIUM = [
  "Drick ordentligt varje dag – litium påverkas av vätskebalansen.",
  "Kräks du, har diarré eller äter/dricker mycket lite: kontakta vården samma dag.",
  "Darrningar, ostadighet eller förvirring kan vara tecken på för högt litium – ring 1177.",
];

/** Mål-zoner för proteinringen (docs/research.md). */
export function proteinZone(g: number, goal: number): "low" | "ok" | "goal" {
  if (g >= Math.min(goal, 90) * 0.95) return "goal";
  if (g >= 60) return "ok";
  return "low";
}
