import type { WorkoutExerciseLog } from "@/lib/types";
import { EXERCISE_BY_KEY } from "./exercises";
import { getPhase } from "./phases";

/**
 * Dubbel progression: om alla set nådde övre repintervallet på samma nivå två
 * pass i rad föreslås nästa nivå. Högst ett förslag åt gången (ingen press).
 */
export function suggestLevelUp(input: {
  phase: number;
  levels: Record<string, number>;
  current: WorkoutExerciseLog[];
  previous: WorkoutExerciseLog[][]; // tidigare pass, senaste först
}): { key: string; to: number } | null {
  const ph = getPhase(input.phase);
  for (const log of input.current) {
    const ex = EXERCISE_BY_KEY[log.key];
    if (!ex) continue;
    const stored = input.levels[log.key] ?? 1;
    if (log.level !== stored || stored >= ex.levels.length) continue;
    const topped = (l: WorkoutExerciseLog) => l.sets.length >= ph.sets && l.sets.every((r) => r >= ph.repMax);
    if (!topped(log)) continue;
    const prev = input.previous.map((w) => w.find((l) => l.key === log.key)).find(Boolean);
    if (prev && prev.level === stored && topped(prev)) return { key: log.key, to: stored + 1 };
  }
  return null;
}
