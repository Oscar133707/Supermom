// Ren logik (inga sidoeffekter): dagsförslag, vanestatistik, comeback, deload.
import { addDays, daysBetween, weekStart } from "@/lib/dates";
import type { Activity, Energy, Injection, ProgramState, Symptoms } from "@/lib/types";
import { getPhase } from "./phases";
import { buildWorkout, type WorkoutId } from "./workouts";

export const WEEK_GOAL = 4;

export type ActivityLite = Pick<Activity, "date" | "kind" | "minutes" | "songs" | "title">;

export interface HabitStats {
  activeToday: boolean;
  weekActiveDates: string[]; // datum i aktuell vecka med rörelse
  weekStrength: number;
  totalActiveDays: number;
  totalSongs: number;
  totalMinutes: number;
  totalStrength: number;
  lastActiveBefore: string | null; // senaste aktiva dag före idag
  daysSinceStart: number | null; // dagar sedan första loggade rörelsen
}

export interface ActivityTotals {
  active_days: number;
  songs: number;
  minutes: number;
  strength: number;
  first_date: string | null;
}

/** `activities` bör täcka minst de senaste veckorna; `totals` ger livstidssiffror. */
export function habitStats(activities: ActivityLite[], today: string, totals?: ActivityTotals | null): HabitStats {
  const dates = new Set(activities.map((a) => a.date));
  const ws = weekStart(today);
  const weekActiveDates = [...dates].filter((d) => d >= ws && d <= today).sort();
  const before = [...dates].filter((d) => d < today).sort();
  const first = [...dates].sort()[0] ?? null;
  const computed = {
    activeToday: dates.has(today),
    weekActiveDates,
    weekStrength: activities.filter((a) => a.kind === "strength" && a.date >= ws && a.date <= today).length,
    totalActiveDays: dates.size,
    totalSongs: activities.reduce((s, a) => s + (a.songs ?? 0), 0),
    totalMinutes: activities.reduce((s, a) => s + (a.minutes ?? 0), 0),
    totalStrength: activities.filter((a) => a.kind === "strength").length,
    lastActiveBefore: before.length ? before[before.length - 1] : null,
    daysSinceStart: first ? daysBetween(first, today) : null,
  };
  if (!totals) return computed;
  return {
    ...computed,
    totalActiveDays: Math.max(totals.active_days, computed.totalActiveDays),
    totalSongs: Math.max(totals.songs, computed.totalSongs),
    totalMinutes: Math.max(totals.minutes, computed.totalMinutes),
    totalStrength: Math.max(totals.strength, computed.totalStrength),
    daysSinceStart: totals.first_date ? daysBetween(totals.first_date, today) : computed.daysSinceStart,
  };
}

/** ≥2 inaktiva dagar sedan senaste rörelsen → välkommen tillbaka. */
export function isComeback(stats: HabitStats, today: string): boolean {
  if (!stats.lastActiveBefore) return false;
  return daysBetween(stats.lastActiveBefore, today) >= 3;
}

/** Var 6:e vecka i en fas (från fas 1) är en lättare vecka. */
export function isDeloadWeek(state: Pick<ProgramState, "phase" | "phase_started_on">, today: string): boolean {
  if (state.phase < 1) return false;
  const weeks = Math.floor(daysBetween(state.phase_started_on, today) / 7);
  return weeks % 6 === 5;
}

export function weeksInPhase(state: Pick<ProgramState, "phase_started_on">, today: string): number {
  return Math.max(0, Math.floor(daysBetween(state.phase_started_on, today) / 7));
}

/** Biverkningar som gör att dagen bör vara lätt. */
export function symptomHeavy(
  symptoms: Pick<Symptoms, "date" | "nausea" | "vomiting" | "diarrhea" | "red_flags">[],
  injections: Pick<Injection, "date" | "dose_mg">[],
  today: string,
): boolean {
  const recent = symptoms.filter((s) => s.date >= addDays(today, -1));
  if (recent.some((s) => s.red_flags.length > 0 || s.vomiting >= 2 || s.diarrhea >= 2 || s.nausea >= 3)) return true;
  const inc = lastDoseIncrease(injections);
  if (inc && daysBetween(inc, today) <= 3 && recent.some((s) => s.nausea >= 2)) return true;
  return false;
}

/** Datum för senaste dosökning (en spruta med högre dos än den före). */
export function lastDoseIncrease(injections: Pick<Injection, "date" | "dose_mg">[]): string | null {
  const sorted = [...injections].sort((a, b) => a.date.localeCompare(b.date));
  let last: string | null = null;
  for (let i = 1; i < sorted.length; i++) {
    if (Number(sorted[i].dose_mg) > Number(sorted[i - 1].dose_mg)) last = sorted[i].date;
  }
  if (sorted.length === 1) last = sorted[0].date; // första sprutan räknas som start
  return last;
}

export interface Suggestion {
  workoutId: WorkoutId;
  title: string;
  subtitle: string;
  minutes: number;
}

export interface DayPlan {
  mode: "light" | "strength" | "cardio" | "done";
  primary: Suggestion;
  alternatives: Suggestion[];
  note: string | null;
}

function suggestion(id: WorkoutId, phase: number, levels: Record<string, number>, deload = false): Suggestion {
  const w = buildWorkout(id, phase, levels, { deload });
  return { workoutId: id, title: w.title, subtitle: w.subtitle, minutes: w.estimateMin };
}

export function dayPlan(input: {
  today: string;
  energy: Energy | null;
  state: Pick<ProgramState, "phase" | "phase_started_on">;
  levels: Record<string, number>;
  activities: ActivityLite[];
  heavySymptoms: boolean;
  comeback?: boolean;
}): DayPlan {
  const { today, energy, state, levels, activities, heavySymptoms, comeback } = input;
  const phase = getPhase(state.phase);
  const deload = isDeloadWeek(state, today);
  const todays = activities.filter((a) => a.date === today);
  const ws = weekStart(today);
  const strengthDates = activities.filter((a) => a.kind === "strength").map((a) => a.date).sort();
  const lastStrength = strengthDates.length ? strengthDates[strengthDates.length - 1] : null;
  const weekStrength = strengthDates.filter((d) => d >= ws && d <= today).length;
  const target = phase.strengthPerWeek(weeksInPhase(state, today));
  const totalStrength = strengthDates.length;
  const nextStrength: WorkoutId = state.phase === 0 || totalStrength % 2 === 0 ? "strength-a" : "strength-b";
  const cardioId: WorkoutId = state.phase >= 1 && weekStrength >= target ? "bike-intervals" : "cardio-bike";

  const light = suggestion("light", state.phase, levels);
  const walk = suggestion("cardio-walk", state.phase, levels);
  const bike = suggestion(cardioId, state.phase, levels);

  if (todays.some((a) => a.kind === "strength") || todays.reduce((s, a) => s + a.minutes, 0) >= 15) {
    return {
      mode: "done",
      primary: walk,
      alternatives: [light],
      note: "Dagens rörelse är gjord. Allt extra är bonus – vila är också träning.",
    };
  }

  if (energy === "low" || heavySymptoms) {
    return {
      mode: "light",
      primary: light,
      alternatives: [walk],
      note: heavySymptoms
        ? "Kroppen har mycket att hantera just nu. Ett lätt pass räknas fullt ut."
        : "Tunga dagar räknas lika mycket. En låt räcker.",
    };
  }

  if (comeback && energy !== "high") {
    return {
      mode: "light",
      primary: light,
      alternatives: [walk, suggestion(nextStrength, state.phase, levels, deload)],
      note: "Första dagen tillbaka: börja lätt. Det viktiga är att du är här.",
    };
  }

  const strengthDue = weekStrength < target && lastStrength !== today && lastStrength !== addDays(today, -1);
  const highNote =
    energy === "high" ? "Mycket energi idag – att hålla din vanliga mängd hjälper dig hålla jämnt." : null;

  if (strengthDue) {
    return {
      mode: "strength",
      primary: suggestion(nextStrength, state.phase, levels, deload),
      alternatives: [bike, walk, light],
      note: highNote ?? (deload ? "Lättare vecka – musklerna bygger sig starkare under vilan." : null),
    };
  }

  return {
    mode: "cardio",
    primary: bike,
    alternatives: [walk, light],
    note: highNote,
  };
}
