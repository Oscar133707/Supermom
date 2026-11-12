// Roterande, varma notistexter. Aldrig skuld, aldrig "du har missat".
const MOVE = [
  { title: "En låt?", body: "Sätt på en låt du gillar och rör dig till den. Det räcker idag." },
  { title: "Dags för dagens rörelse", body: "Lätt eller lite mer – du väljer. Allt räknas." },
  { title: "Två minuter", body: "Res dig, sträck på dig, gå några steg. Två minuter räknas fullt ut." },
  { title: "Din musik väntar", body: "Hörlurar på, en låt, lite rörelse. Det är början på något stort." },
  { title: "Hur känns det idag?", body: "Tryck in din dagsform så får du ett förslag som passar." },
];

const COMEBACK = [
  { title: "Välkommen tillbaka när du vill", body: "En paus raderar ingenting. En enda låt räcker för att komma igång igen." },
  { title: "Allt du gjort finns kvar", body: "Ingen kedja har brutits. Vill du röra dig till en låt idag?" },
];

const NUTRITION = [
  { title: "Lite protein?", body: "En kvarg, ett glas mjölk eller en proteindryck – det gör skillnad för musklerna." },
  { title: "Ett glas vatten", body: "Ta ett glas vatten nu. Kroppen tackar dig." },
  { title: "Protein först", body: "Ät proteinet först på tallriken – då räcker aptiten till det viktigaste." },
];

function pick<T>(arr: T[], seed: number): T {
  return arr[Math.abs(seed) % arr.length];
}

export function moveMessage(seed: number, why: string | null, comeback: boolean) {
  if (comeback) return pick(COMEBACK, seed);
  // ~1 av 4: hennes eget varför
  if (why && seed % 4 === 0) return { title: "Kom ihåg ditt varför", body: why.length > 140 ? why.slice(0, 137) + "…" : why };
  return pick(MOVE, seed);
}

export function nutritionMessage(seed: number) {
  return pick(NUTRITION, seed);
}
