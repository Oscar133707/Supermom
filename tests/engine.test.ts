import { describe, expect, it } from "vitest";
import { addDays, daysBetween, weekStart, weekdayIndex } from "@/lib/dates";
import {
  dayPlan,
  habitStats,
  isComeback,
  isDeloadWeek,
  lastDoseIncrease,
  symptomHeavy,
  type ActivityLite,
} from "@/lib/program/engine";
import { suggestLevelUp } from "@/lib/program/progression";
import { buildWorkout, WORKOUT_IDS } from "@/lib/program/workouts";
import { EXERCISES } from "@/lib/program/exercises";
import { trend, diaryPatterns } from "@/lib/stats";

const TODAY = "2026-11-12"; // torsdag

const act = (date: string, kind: ActivityLite["kind"] = "walk", minutes = 10): ActivityLite => ({
  date,
  kind,
  minutes,
  songs: kind === "min_dose" ? 1 : 0,
  title: null,
});

describe("dates", () => {
  it("räknar veckor från måndag", () => {
    expect(weekStart(TODAY)).toBe("2026-11-09");
    expect(weekdayIndex("2026-11-09")).toBe(0);
    expect(weekdayIndex("2026-11-15")).toBe(6);
  });
  it("hanterar månadsskiften", () => {
    expect(addDays("2026-02-28", 1)).toBe("2026-03-01");
    expect(daysBetween("2026-10-25", "2026-10-26")).toBe(1); // sommartid slutar
  });
});

describe("habitStats & comeback", () => {
  it("räknar unika aktiva dagar och veckodagar", () => {
    const s = habitStats([act("2026-11-09"), act("2026-11-09", "min_dose"), act("2026-11-11"), act("2026-11-01")], TODAY);
    expect(s.totalActiveDays).toBe(3);
    expect(s.weekActiveDates).toEqual(["2026-11-09", "2026-11-11"]);
    expect(s.activeToday).toBe(false);
    expect(s.lastActiveBefore).toBe("2026-11-11");
  });
  it("comeback först efter minst två inaktiva dagar", () => {
    expect(isComeback(habitStats([act("2026-11-10")], TODAY), TODAY)).toBe(false); // en dag emellan
    expect(isComeback(habitStats([act("2026-11-09")], TODAY), TODAY)).toBe(true); // två dagar emellan
    expect(isComeback(habitStats([], TODAY), TODAY)).toBe(false);
  });
});

describe("dayPlan", () => {
  const base = { today: TODAY, state: { phase: 0, phase_started_on: "2026-11-01" }, levels: {}, heavySymptoms: false };

  it("tung dag ger lätt pass", () => {
    const p = dayPlan({ ...base, energy: "low", activities: [] });
    expect(p.mode).toBe("light");
    expect(p.primary.workoutId).toBe("light");
  });

  it("mycket energi ger aldrig mer än en vanlig dag", () => {
    const normal = dayPlan({ ...base, energy: "normal", activities: [] });
    const high = dayPlan({ ...base, energy: "high", activities: [] });
    expect(high.primary.workoutId).toBe(normal.primary.workoutId);
    expect(high.primary.minutes).toBe(normal.primary.minutes);
    expect(high.note).toMatch(/vanliga mängd/);
  });

  it("styrka inte två dagar i rad", () => {
    const p = dayPlan({ ...base, energy: "normal", activities: [act("2026-11-11", "strength", 15)] });
    expect(p.mode).toBe("cardio");
  });

  it("styrka när veckans mål inte nåtts och vila skett", () => {
    const p = dayPlan({ ...base, energy: "normal", activities: [act("2026-11-09", "strength", 15)] });
    expect(p.mode).toBe("strength");
  });

  it("klart för dagen efter styrkepass", () => {
    const p = dayPlan({ ...base, energy: "normal", activities: [act(TODAY, "strength", 15)] });
    expect(p.mode).toBe("done");
  });

  it("biverkningar ger lätt dag", () => {
    const p = dayPlan({ ...base, energy: "normal", activities: [], heavySymptoms: true });
    expect(p.mode).toBe("light");
  });
});

describe("symptoms & injections", () => {
  it("hittar senaste dosökning", () => {
    expect(
      lastDoseIncrease([
        { date: "2026-10-01", dose_mg: 2.5 },
        { date: "2026-10-29", dose_mg: 5 },
        { date: "2026-11-05", dose_mg: 5 },
      ]),
    ).toBe("2026-10-29");
  });
  it("kräkning gör dagen tung", () => {
    expect(
      symptomHeavy([{ date: TODAY, nausea: 0, vomiting: 2, diarrhea: 0, red_flags: [] }], [], TODAY),
    ).toBe(true);
    expect(symptomHeavy([{ date: TODAY, nausea: 1, vomiting: 0, diarrhea: 0, red_flags: [] }], [], TODAY)).toBe(false);
  });
  it("illamående strax efter dosökning gör dagen tung", () => {
    const inj = [
      { date: "2026-10-12", dose_mg: 2.5 },
      { date: "2026-11-10", dose_mg: 5 },
    ];
    expect(symptomHeavy([{ date: TODAY, nausea: 2, vomiting: 0, diarrhea: 0, red_flags: [] }], inj, TODAY)).toBe(true);
  });
});

describe("deload", () => {
  it("var sjätte vecka i fas 1+ är lättare", () => {
    expect(isDeloadWeek({ phase: 1, phase_started_on: "2026-10-01" }, addDays("2026-10-01", 35))).toBe(true);
    expect(isDeloadWeek({ phase: 1, phase_started_on: "2026-10-01" }, addDays("2026-10-01", 20))).toBe(false);
    expect(isDeloadWeek({ phase: 0, phase_started_on: "2026-10-01" }, addDays("2026-10-01", 35))).toBe(false);
  });
});

describe("workouts", () => {
  it("alla pass går att bygga i alla faser", () => {
    for (const id of WORKOUT_IDS)
      for (let ph = 0; ph <= 4; ph++) {
        const w = buildWorkout(id, ph, {});
        expect(w.steps.length).toBeGreaterThan(0);
        expect(w.estimateMin).toBeGreaterThan(0);
      }
  });
  it("fas 0 innehåller bara övningar från fas 0", () => {
    const w = buildWorkout("strength-a", 0, {});
    for (const s of w.steps) if (s.type === "exercise") expect(EXERCISES.find((e) => e.key === s.key)!.minPhase).toBe(0);
  });
  it("deload halverar set", () => {
    const w = buildWorkout("strength-a", 2, {}, { deload: true });
    const s = w.steps.find((x) => x.type === "exercise");
    expect(s && s.type === "exercise" && s.sets).toBe(2);
  });
  it("varje övning har nivå 1 och instruktioner", () => {
    for (const e of EXERCISES) {
      expect(e.levels.length).toBeGreaterThanOrEqual(3);
      expect(e.steps.length).toBeGreaterThanOrEqual(2);
    }
  });
});

describe("progression", () => {
  it("föreslår nästa nivå efter två toppade pass", () => {
    const log = { key: "sit_to_stand", level: 1, sets: [12] };
    expect(suggestLevelUp({ phase: 0, levels: { sit_to_stand: 1 }, current: [log], previous: [[log]] })).toEqual({
      key: "sit_to_stand",
      to: 2,
    });
  });
  it("föreslår inget efter ett pass", () => {
    const log = { key: "sit_to_stand", level: 1, sets: [12] };
    expect(suggestLevelUp({ phase: 0, levels: {}, current: [log], previous: [] })).toBeNull();
  });
  it("föreslår inget om något set inte nådde målet", () => {
    const ok = { key: "sit_to_stand", level: 1, sets: [15, 15] };
    const short = { key: "sit_to_stand", level: 1, sets: [15, 11] };
    expect(suggestLevelUp({ phase: 1, levels: {}, current: [short], previous: [[ok]] })).toBeNull();
  });
});

describe("stats", () => {
  it("trendlinjen jämnar ut en enstaka hög mätning", () => {
    const t = trend([
      { date: "2026-11-01", value: 140 },
      { date: "2026-11-02", value: 139.6 },
      { date: "2026-11-03", value: 141.5 },
    ]);
    expect(t[2].value).toBeLessThan(140.2);
  });
  it("mönster: lite sömn + mycket energi", () => {
    const days = [0, 1, 2].map((i) => ({ date: addDays(TODAY, -i), mood: 2, sleep_hours: 4, energy: "high" }));
    expect(diaryPatterns(days, TODAY).map((p) => p.key)).toContain("sleep_energy");
  });
  it("inga mönster för vanliga dagar", () => {
    const days = [0, 1, 2, 3, 4].map((i) => ({ date: addDays(TODAY, -i), mood: 0, sleep_hours: 7, energy: "normal" }));
    expect(diaryPatterns(days, TODAY)).toEqual([]);
  });
});
