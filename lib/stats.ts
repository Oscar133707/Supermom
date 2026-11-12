import { addDays, daysBetween } from "@/lib/dates";

export interface Point {
  date: string;
  value: number;
}

/** Tidsviktat glidande medelvärde (som Happy Scale/Libra): jämnar ut dagsvariation. */
export function trend(points: Point[]): Point[] {
  const sorted = [...points].sort((a, b) => a.date.localeCompare(b.date));
  const out: Point[] = [];
  let prev: Point | null = null;
  for (const p of sorted) {
    if (!prev) {
      prev = { ...p };
    } else {
      const days = Math.max(1, daysBetween(prev.date, p.date));
      const alpha = 1 - Math.pow(0.9, days);
      prev = { date: p.date, value: prev.value + alpha * (p.value - prev.value) };
    }
    out.push(prev);
  }
  return out;
}

export function bmi(weightKg: number, heightCm: number): number {
  const m = heightCm / 100;
  return weightKg / (m * m);
}

export interface DiaryDay {
  date: string;
  mood: number | null;
  sleep_hours: number | null;
  energy: string | null;
}

/**
 * Mönster som kan vara värda att lägga märke till – utan diagnosspråk.
 * Tröskelvärdena är praktiska förslag (docs/research.md) och bör stämmas av med vården.
 */
export function diaryPatterns(days: DiaryDay[], today: string): { key: string; title: string; body: string }[] {
  const byDate = new Map(days.map((d) => [d.date, d]));
  const last = (n: number) => Array.from({ length: n }, (_, i) => byDate.get(addDays(today, -i))).filter(Boolean) as DiaryDay[];
  const out: { key: string; title: string; body: string }[] = [];

  const recent5 = last(5);
  const shortSleepHighEnergy = recent5.filter(
    (d) => d.sleep_hours !== null && d.sleep_hours < 5 && (d.energy === "high" || (d.mood ?? 0) >= 2),
  ).length;
  if (shortSleepHighEnergy >= 3) {
    out.push({
      key: "sleep_energy",
      title: "Lite sömn och mycket energi flera dagar",
      body: "Det kan vara klokt att ta det lugnt med träningen nu, hålla fast vid dina vanliga tider och följa din egen plan – eller höra av dig till din vårdkontakt.",
    });
  }

  const recent7 = last(7);
  const lowRun = (() => {
    let run = 0;
    for (let i = 0; i < 7; i++) {
      const d = byDate.get(addDays(today, -i));
      if (d && d.mood !== null && d.mood <= -2) run++;
      else if (d && d.mood !== null) break;
    }
    return run;
  })();
  if (lowRun >= 5 || recent7.filter((d) => d.mood !== null && d.mood <= -2).length >= 5) {
    out.push({
      key: "low_mood",
      title: "Flera tunga dagar i rad",
      body: "Du behöver inte bära det ensam. Minsta dosen räcker gott. Prata gärna med någon du litar på eller din vårdkontakt.",
    });
  }
  return out;
}
