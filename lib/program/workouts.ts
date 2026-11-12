import { getExercise, clampLevel } from "./exercises";
import { getPhase } from "./phases";

export type WorkoutId = "strength-a" | "strength-b" | "light" | "cardio-walk" | "cardio-bike" | "bike-intervals";

export interface ExerciseStep {
  type: "exercise";
  key: string;
  level: number;
  sets: number;
  repMin: number;
  repMax: number;
  restSec: number;
}

export interface TimedStep {
  type: "timed";
  title: string;
  seconds: number;
  lines: string[];
  /** Optional intervals: alternate cue every n seconds */
  intervals?: { work: number; easy: number; workLabel: string; easyLabel: string };
}

export type WorkoutStep = ExerciseStep | TimedStep;

export interface Workout {
  id: WorkoutId;
  title: string;
  subtitle: string;
  kind: "strength" | "walk" | "bike" | "mobility";
  steps: WorkoutStep[];
  estimateMin: number;
}

const WARMUP: TimedStep = {
  type: "timed",
  title: "Uppvärmning",
  seconds: 120,
  lines: ["Sittande eller stående marsch.", "Rulla axlarna bakåt, cirkla med armarna.", "Lugn andning."],
};

const COOLDOWN: TimedStep = {
  type: "timed",
  title: "Varva ner",
  seconds: 60,
  lines: ["Andas långsamt in genom näsan, ut genom munnen.", "Sträck lätt på armar och ben – inget som gör ont."],
};

// Rotationer per fas. Fas 0: ett pass. Fas 1+: A/B.
const ROTATIONS: Record<number, { a: string[]; b: string[] }> = {
  0: {
    a: ["sit_to_stand", "wall_pushup", "band_row", "knee_squeeze", "seated_abduction", "triceps_overhead"],
    b: ["sit_to_stand", "wall_pushup", "band_row", "knee_squeeze", "seated_abduction", "triceps_overhead"],
  },
  1: {
    a: ["sit_to_stand", "wall_pushup", "band_row", "triceps_overhead", "knee_squeeze", "seated_march", "calf_raise"],
    b: ["sumo_stand", "chest_press_band", "band_pull_apart", "biceps_curl", "seated_abduction", "side_lying_adduction", "glute_bridge"],
  },
  2: {
    a: ["sit_to_stand", "wall_pushup", "band_row", "triceps_overhead", "step_up", "calf_raise", "pallof_press"],
    b: ["sumo_stand", "chest_press_band", "band_pull_apart", "biceps_curl", "lateral_raise", "side_lying_adduction", "glute_bridge"],
  },
};
ROTATIONS[3] = ROTATIONS[2];
ROTATIONS[4] = ROTATIONS[2];

export function strengthWorkout(
  which: "a" | "b",
  phaseId: number,
  levels: Record<string, number>,
  opts: { deload?: boolean } = {},
): Workout {
  const phase = getPhase(phaseId);
  const keys = ROTATIONS[Math.min(phaseId, 4)][which];
  const sets = opts.deload ? Math.max(1, Math.ceil(phase.sets / 2)) : phase.sets;
  const steps: WorkoutStep[] = [WARMUP];
  for (const key of keys) {
    const ex = getExercise(key);
    steps.push({
      type: "exercise",
      key,
      level: clampLevel(ex, levels[key] ?? 1),
      sets,
      repMin: phase.repMin,
      repMax: phase.repMax,
      restSec: phase.restSec,
    });
  }
  steps.push(COOLDOWN);
  return {
    id: which === "a" ? "strength-a" : "strength-b",
    title: phaseId === 0 ? "Styrka" : `Styrka ${which.toUpperCase()}`,
    subtitle: opts.deload ? "Lättare vecka – halva mängden" : `${keys.length} övningar · ${sets} set`,
    kind: "strength",
    steps,
    estimateMin: estimateMinutes(steps),
  };
}

/** Tung dag: minsta dos plus tre stolövningar – alltid räknas. */
export function lightWorkout(levels: Record<string, number>): Workout {
  const keys = ["sit_to_stand", "seated_march", "knee_squeeze"];
  const steps: WorkoutStep[] = [
    {
      type: "timed",
      title: "Rör dig till en låt",
      seconds: 180,
      lines: ["Sätt på en låt du tycker om.", "Sitt eller stå – rör armar och ben i takt.", "Allt räknas."],
    },
  ];
  for (const key of keys) {
    const ex = getExercise(key);
    steps.push({
      type: "exercise",
      key,
      level: Math.max(1, clampLevel(ex, (levels[key] ?? 1) - 1)),
      sets: 1,
      repMin: 6,
      repMax: 8,
      restSec: 45,
    });
  }
  return {
    id: "light",
    title: "Lätt pass",
    subtitle: "En låt + tre stolövningar",
    kind: "mobility",
    steps,
    estimateMin: estimateMinutes(steps),
  };
}

export function cardioWorkout(kind: "walk" | "bike", phaseId: number): Workout {
  const phase = getPhase(phaseId);
  const minutes = phase.cardioMinutes;
  const lines =
    kind === "bike"
      ? ["Sadeln så högt att knät är nästan rakt längst ner.", "Lätt motstånd – trampa lugnt.", phase.cardioEffort + "."]
      : ["Gå i lugnt tempo, inne eller ute.", phase.cardioEffort + ".", "Gå gärna i takt med musiken."];
  return {
    id: kind === "bike" ? "cardio-bike" : "cardio-walk",
    title: kind === "bike" ? "Cykel" : "Promenad",
    subtitle: `${minutes} min · ${phase.cardioEffort.toLowerCase()}`,
    kind,
    steps: [{ type: "timed", title: kind === "bike" ? "Cykla" : "Gå", seconds: minutes * 60, lines }],
    estimateMin: minutes,
  };
}

export function bikeIntervals(phaseId: number): Workout {
  const rounds = phaseId >= 2 ? 6 : 4;
  const work = 60;
  const easy = 120;
  return {
    id: "bike-intervals",
    title: "Cykelintervaller",
    subtitle: `${rounds} × (1 min lite tyngre / 2 min lätt)`,
    kind: "bike",
    steps: [
      { type: "timed", title: "Trampa igång", seconds: 120, lines: ["Lätt motstånd, lugnt tempo."] },
      {
        type: "timed",
        title: "Intervaller",
        seconds: rounds * (work + easy),
        lines: ["Lite tyngre: du kan säga korta meningar.", "Lätt: du kan prata och sjunga."],
        intervals: { work, easy, workLabel: "Lite tyngre", easyLabel: "Lätt" },
      },
      { type: "timed", title: "Trampa ner", seconds: 120, lines: ["Lätt motstånd, andas lugnt."] },
    ],
    estimateMin: Math.round((240 + rounds * (work + easy)) / 60),
  };
}

function estimateMinutes(steps: WorkoutStep[]): number {
  let sec = 0;
  for (const s of steps) {
    if (s.type === "timed") sec += s.seconds;
    else {
      const ex = getExercise(s.key);
      const perRep = ex.mode === "hold" ? (ex.holdSeconds ?? 5) + 2 : 4;
      sec += s.sets * (s.repMax * perRep) + (s.sets - 1) * s.restSec + 30;
    }
  }
  return Math.max(1, Math.round(sec / 60));
}

export function buildWorkout(
  id: WorkoutId,
  phaseId: number,
  levels: Record<string, number>,
  opts: { deload?: boolean } = {},
): Workout {
  switch (id) {
    case "strength-a":
      return strengthWorkout("a", phaseId, levels, opts);
    case "strength-b":
      return strengthWorkout("b", phaseId, levels, opts);
    case "light":
      return lightWorkout(levels);
    case "cardio-walk":
      return cardioWorkout("walk", phaseId);
    case "cardio-bike":
      return cardioWorkout("bike", phaseId);
    case "bike-intervals":
      return bikeIntervals(phaseId);
  }
}

export const WORKOUT_IDS: WorkoutId[] = ["strength-a", "strength-b", "light", "cardio-walk", "cardio-bike", "bike-intervals"];
