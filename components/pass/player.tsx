"use client";

import { AnimatePresence, motion } from "motion/react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState, useTransition } from "react";
import { ChevronDown, ChevronUp, Music, Pause, Play, SkipForward, Video, Volume2, VolumeX, X } from "lucide-react";
import { Button, buttonClass } from "@/components/ui/button";
import { Sheet } from "@/components/ui/sheet";
import { RedFlagScreen } from "@/components/app/red-flag";
import { useCelebrate } from "@/components/app/celebration";
import { Stepper } from "@/components/log/stepper";
import { cn } from "@/lib/cn";
import { getExercise, ZONE_LABEL } from "@/lib/program/exercises";
import type { ExerciseStep, TimedStep, Workout } from "@/lib/program/workouts";
import { logActivity, setLevelEasier } from "@/app/(app)/actions";
import type { ActivityKind, WorkoutExerciseLog } from "@/lib/types";
import { BodyMap } from "./body-map";
import { beep, chime, hasSwedishVoice, speak, tick, unlockAudio } from "./audio";
import { useWakeLock } from "./use-wake-lock";

type Stage = "intro" | "run" | "finish";

function useNow(active: boolean, ms = 250) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (!active) return;
    const id = setInterval(() => setNow(Date.now()), ms);
    return () => clearInterval(id);
  }, [active, ms]);
  return now;
}

function mmss(sec: number) {
  const s = Math.max(0, Math.ceil(sec));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}

const FEEL = [
  { v: 1, label: "Tungt" },
  { v: 2, label: "Sådär" },
  { v: 3, label: "Okej" },
  { v: 4, label: "Bra" },
  { v: 5, label: "Toppen" },
];

const EFFORT = [
  { v: 2, label: "Lätt", sub: "Kunde prata och sjunga" },
  { v: 4, label: "Lagom", sub: "Kunde prata" },
  { v: 6, label: "Jobbigt", sub: "Korta meningar" },
  { v: 8, label: "Mycket jobbigt", sub: "Svårt att prata" },
];

export function Player({
  workout,
  playlists,
  media,
}: {
  workout: Workout;
  playlists: { id: string; name: string; url: string }[];
  media: Record<string, string>;
}) {
  const router = useRouter();
  const celebrate = useCelebrate();
  const [saving, startSave] = useTransition();
  const [stage, setStage] = useState<Stage>("intro");
  const [stepIdx, setStepIdx] = useState(0);
  const [setIdx, setSetIdx] = useState(0);
  const [restEndAt, setRestEndAt] = useState<number | null>(null);
  const [endAt, setEndAt] = useState<number | null>(null); // timed step / hold
  const [pausedLeft, setPausedLeft] = useState<number | null>(null);
  const [holdEndAt, setHoldEndAt] = useState<number | null>(null);
  const [reps, setReps] = useState(0);
  const [levels, setLevels] = useState<Record<string, number>>(() =>
    Object.fromEntries(workout.steps.filter((s): s is ExerciseStep => s.type === "exercise").map((s) => [s.key, s.level])),
  );
  const [logs, setLogs] = useState<Record<string, WorkoutExerciseLog>>({});
  const [startedAt, setStartedAt] = useState<number>(0);
  const [feelBefore, setFeelBefore] = useState<number | null>(null);
  const [feelAfter, setFeelAfter] = useState<number | null>(null);
  const [effort, setEffort] = useState<number | null>(null);
  const [stopOpen, setStopOpen] = useState(false);
  const [redFlag, setRedFlag] = useState(false);
  const [voice, setVoice] = useState(false);
  const [voiceAvailable, setVoiceAvailable] = useState(false);
  const [showHow, setShowHow] = useState(true);
  const [elapsedMin, setElapsedMin] = useState(0);

  const running = stage === "run";
  const wakeSupported = useWakeLock(running);
  const now = useNow(running && (restEndAt !== null || (endAt !== null && pausedLeft === null) || holdEndAt !== null));
  const step = workout.steps[stepIdx];
  const lastBeep = useRef<number>(-1);
  const segRef = useRef<number>(-1);

  useEffect(() => {
    const check = () => setVoiceAvailable(hasSwedishVoice());
    check();
    if ("speechSynthesis" in window) window.speechSynthesis.onvoiceschanged = check;
  }, []);

  const say = useCallback((t: string) => voice && speak(t), [voice]);

  // ─── Step entry ───────────────────────────────────────────────────────────
  const enterStep = useCallback(
    (idx: number) => {
      const s = workout.steps[idx];
      setStepIdx(idx);
      setSetIdx(0);
      setRestEndAt(null);
      setHoldEndAt(null);
      setPausedLeft(null);
      lastBeep.current = -1;
      segRef.current = -1;
      if (!s) return;
      if (s.type === "timed") {
        setEndAt(Date.now() + s.seconds * 1000);
        say(s.title);
      } else {
        setEndAt(null);
        const ex = getExercise(s.key);
        setReps(ex.mode === "hold" ? 0 : Math.round((s.repMin + s.repMax) / 2));
        say(ex.name);
      }
    },
    [workout.steps, say],
  );

  const finish = useCallback(() => {
    setElapsedMin(Math.max(1, Math.round((Date.now() - startedAt) / 60000)));
    setStage("finish");
    setEndAt(null);
    setRestEndAt(null);
    chime();
  }, [startedAt]);

  const nextStep = useCallback(() => {
    if (stepIdx + 1 >= workout.steps.length) finish();
    else enterStep(stepIdx + 1);
  }, [stepIdx, workout.steps.length, enterStep, finish]);

  const start = () => {
    unlockAudio();
    beep(880, 80, 0.12);
    setStartedAt(Date.now());
    setStage("run");
    enterStep(0);
  };

  // ─── Timers (timestamp based – robust when the screen sleeps) ────────────
  useEffect(() => {
    if (!running) return;
    // Rest
    if (restEndAt !== null) {
      const left = (restEndAt - now) / 1000;
      const sec = Math.ceil(left);
      if (sec <= 3 && sec > 0 && lastBeep.current !== sec) {
        lastBeep.current = sec;
        tick();
      }
      if (left <= 0) {
        lastBeep.current = -1;
        setRestEndAt(null);
        chime();
        if (step?.type === "exercise" && setIdx + 1 < step.sets) {
          setSetIdx((i) => i + 1);
          const ex = getExercise(step.key);
          if (ex.mode === "hold") setReps(0);
        } else nextStep();
      }
      return;
    }
    // Hold helper
    if (holdEndAt !== null) {
      const left = (holdEndAt - now) / 1000;
      const sec = Math.ceil(left);
      if (sec <= 3 && sec > 0 && lastBeep.current !== sec) {
        lastBeep.current = sec;
        beep(600, 70, 0.1);
      }
      if (left <= 0) {
        lastBeep.current = -1;
        setHoldEndAt(null);
        setReps((r) => r + 1);
        chime();
      }
      return;
    }
    // Timed step
    if (step?.type === "timed" && endAt !== null && pausedLeft === null) {
      const total = step.seconds;
      const left = (endAt - now) / 1000;
      if (step.intervals) {
        const elapsed = total - left;
        const cycle = step.intervals.work + step.intervals.easy;
        const seg = Math.floor(elapsed / cycle) * 2 + (elapsed % cycle < step.intervals.work ? 0 : 1);
        if (seg !== segRef.current && elapsed > 0.5) {
          if (segRef.current !== -1) chime();
          segRef.current = seg;
          say(seg % 2 === 0 ? step.intervals.workLabel : step.intervals.easyLabel);
        }
      }
      const sec = Math.ceil(left);
      if (sec <= 3 && sec > 0 && lastBeep.current !== sec) {
        lastBeep.current = sec;
        tick();
      }
      if (left <= 0) {
        chime();
        nextStep();
      }
    }
  }, [now, running, restEndAt, holdEndAt, endAt, pausedLeft, step, setIdx, nextStep, say]);

  // ─── Exercise actions ─────────────────────────────────────────────────────
  const completeSet = () => {
    if (step?.type !== "exercise") return;
    const level = levels[step.key] ?? step.level;
    setLogs((l) => {
      const prev = l[step.key];
      const sets = prev && prev.level === level ? [...prev.sets, reps] : [reps];
      return { ...l, [step.key]: { key: step.key, level, sets } };
    });
    navigator.vibrate?.(15);
    const lastSet = setIdx + 1 >= step.sets;
    const nextIsExercise = workout.steps[stepIdx + 1]?.type === "exercise";
    if (!lastSet || nextIsExercise) {
      lastBeep.current = -1;
      setRestEndAt(Date.now() + (lastSet ? Math.min(step.restSec, 60) : step.restSec) * 1000);
      if (lastSet) say("Vila. Nästa övning snart.");
    } else nextStep();
  };

  const changeLevel = (delta: number) => {
    if (step?.type !== "exercise") return;
    const ex = getExercise(step.key);
    const cur = levels[step.key] ?? step.level;
    const next = Math.min(ex.levels.length, Math.max(1, cur + delta));
    if (next === cur) return;
    setLevels((l) => ({ ...l, [step.key]: next }));
    // Lättare gäller direkt framåt; svårare bara i detta pass (förslag kommer senare).
    if (delta < 0) void setLevelEasier(step.key, next);
  };

  const togglePause = () => {
    if (step?.type !== "timed" || endAt === null) return;
    if (pausedLeft === null) setPausedLeft(Math.max(0, endAt - Date.now()));
    else {
      setEndAt(Date.now() + pausedLeft);
      setPausedLeft(null);
    }
  };

  // ─── Save ─────────────────────────────────────────────────────────────────
  const kind: ActivityKind = useMemo(
    () => ({ strength: "strength", walk: "walk", bike: "bike", mobility: "mobility" })[workout.kind] as ActivityKind,
    [workout.kind],
  );

  const save = (partial = false) =>
    startSave(async () => {
      const minutes = partial ? Math.max(1, Math.round((Date.now() - startedAt) / 60000)) : elapsedMin;
      const { celebration } = await logActivity({
        kind,
        title: workout.title,
        minutes,
        songs: workout.id === "light" ? 1 : 0,
        feel_before: feelBefore,
        feel_after: feelAfter,
        effort,
        workout: Object.values(logs).length ? Object.values(logs) : null,
      });
      router.replace("/");
      celebrate(celebration);
    });

  // ─── Render ───────────────────────────────────────────────────────────────
  if (redFlag) return <RedFlagScreen onClose={() => setRedFlag(false)} />;

  if (stage === "intro") {
    return (
      <main className="safe-top safe-bottom mx-auto flex min-h-dvh max-w-lg flex-col px-5 pb-6 pt-4">
        <TopBar onClose={() => router.back()} />
        <p className="mt-2 text-sm font-semibold text-accent">ca {workout.estimateMin} min</p>
        <h1 className="mt-1 text-4xl font-semibold tracking-tight">{workout.title}</h1>
        <p className="mt-2 text-ink-2">{workout.subtitle}</p>

        <ol className="mt-6 flex flex-col gap-2">
          {workout.steps.map((s, i) => (
            <li key={i} className="flex min-h-14 items-center gap-3 rounded-2xl bg-surface px-4 py-3 shadow-card">
              <span className="tabular flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-surface-2 text-sm font-semibold">
                {i + 1}
              </span>
              <span className="flex-1">
                <span className="block font-semibold">{s.type === "timed" ? s.title : getExercise(s.key).name}</span>
                <span className="text-sm text-ink-2">
                  {s.type === "timed"
                    ? mmss(s.seconds) + " min"
                    : `${s.sets} × ${s.repMin}–${s.repMax}${getExercise(s.key).mode === "hold" ? ` (håll ${getExercise(s.key).holdSeconds} s)` : ""} · ${getExercise(s.key).levels[s.level - 1]?.name}`}
                </span>
              </span>
            </li>
          ))}
        </ol>

        {playlists.length > 0 && (
          <div className="mt-6">
            <p className="mb-2 px-1 text-sm font-medium text-ink-2">Starta musiken först – kom sedan tillbaka hit</p>
            <div className="no-scrollbar -mx-5 flex gap-2 overflow-x-auto px-5">
              {playlists.map((p) => (
                <a
                  key={p.id}
                  href={p.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-12 shrink-0 items-center gap-2 rounded-full bg-surface px-4 text-sm font-semibold shadow-card"
                >
                  <Music size={18} className="text-accent" /> {p.name}
                </a>
              ))}
            </div>
          </div>
        )}

        <div className="mt-6">
          <p className="mb-2 px-1 text-sm font-medium text-ink-2">Hur mår du just nu? (valfritt)</p>
          <div className="grid grid-cols-5 gap-1.5">
            {FEEL.map((f) => (
              <button
                key={f.v}
                type="button"
                onClick={() => setFeelBefore(f.v)}
                aria-pressed={feelBefore === f.v}
                className={cn(
                  "h-12 rounded-xl text-xs font-semibold",
                  feelBefore === f.v ? "bg-ink text-canvas" : "bg-surface shadow-card",
                )}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-auto pt-8">
          {voiceAvailable && (
            <button
              type="button"
              onClick={() => setVoice((v) => !v)}
              className="mb-3 flex h-11 w-full items-center justify-center gap-2 text-sm font-medium text-ink-2"
            >
              {voice ? <Volume2 size={18} /> : <VolumeX size={18} />} Röst: {voice ? "på" : "av"}
            </button>
          )}
          <Button size="lg" className="w-full" onClick={start}>
            <Play size={20} fill="currentColor" /> Starta
          </Button>
          <p className="mt-3 text-center text-xs text-ink-3">
            {wakeSupported ? "Skärmen hålls tänd under passet." : "Tips: håll skärmen tänd under passet."}
          </p>
        </div>
      </main>
    );
  }

  if (stage === "finish") {
    return (
      <main className="safe-top safe-bottom mx-auto flex min-h-dvh max-w-lg flex-col px-5 pb-6 pt-14">
        <motion.div
          initial={{ scale: 0.7, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-lime text-4xl"
          aria-hidden="true"
        >
          ✓
        </motion.div>
        <h1 className="mt-6 text-center text-3xl font-semibold tracking-tight">Bra jobbat!</h1>
        <p className="mt-2 text-center text-ink-2">
          {elapsedMin} min {workout.title.toLowerCase()} – det räknas.
        </p>

        <p className="mb-2 mt-8 px-1 font-semibold">Hur mår du nu?</p>
        <div className="grid grid-cols-5 gap-1.5">
          {FEEL.map((f) => (
            <button
              key={f.v}
              type="button"
              onClick={() => setFeelAfter(f.v)}
              aria-pressed={feelAfter === f.v}
              className={cn("h-12 rounded-xl text-xs font-semibold", feelAfter === f.v ? "bg-ink text-canvas" : "bg-surface shadow-card")}
            >
              {f.label}
            </button>
          ))}
        </div>

        <p className="mb-2 mt-6 px-1 font-semibold">Hur jobbigt var det?</p>
        <div className="grid grid-cols-2 gap-2">
          {EFFORT.map((e) => (
            <button
              key={e.v}
              type="button"
              onClick={() => setEffort(e.v)}
              aria-pressed={effort === e.v}
              className={cn(
                "flex min-h-16 flex-col items-start justify-center rounded-2xl px-4 py-2 text-left",
                effort === e.v ? "bg-ink text-canvas" : "bg-surface shadow-card",
              )}
            >
              <span className="font-semibold">{e.label}</span>
              <span className={cn("text-xs", effort === e.v ? "text-canvas/70" : "text-ink-2")}>{e.sub}</span>
            </button>
          ))}
        </div>
        {effort === 8 && (
          <p className="mt-3 rounded-2xl bg-surface-2 p-3 text-sm text-ink-2">
            Tack för att du säger det. Nästa gång kan du trycka på ”Lättare” – det är lika mycket värt.
          </p>
        )}

        <div className="mt-auto pt-8">
          <Button size="lg" className="w-full" onClick={() => save(false)} disabled={saving}>
            {saving ? "Sparar…" : "Spara"}
          </Button>
        </div>
      </main>
    );
  }

  // ─── Running ──────────────────────────────────────────────────────────────
  const progress = (stepIdx + (step?.type === "exercise" ? setIdx / step.sets : 0)) / workout.steps.length;

  return (
    <main className="safe-top safe-bottom mx-auto flex min-h-dvh max-w-lg flex-col px-5 pb-6 pt-4">
      <TopBar onClose={() => setStopOpen(true)} closeLabel="Avsluta" />
      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-surface-3" aria-hidden="true">
        <motion.div className="h-full rounded-full bg-ink" animate={{ width: `${progress * 100}%` }} />
      </div>

      <AnimatePresence mode="wait">
        {restEndAt !== null ? (
          <motion.section
            key="rest"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-1 flex-col items-center justify-center text-center"
          >
            <p className="text-lg font-semibold text-ink-2">Vila</p>
            <p className="tabular mt-2 text-[5.5rem] font-semibold leading-none tracking-tight">{mmss((restEndAt - now) / 1000)}</p>
            <p className="mt-6 text-ink-2">
              Nästa:{" "}
              <span className="font-semibold text-ink">
                {step?.type === "exercise" && setIdx + 1 < step.sets
                  ? `Set ${setIdx + 2} av ${step.sets}`
                  : (() => {
                      const n = workout.steps[stepIdx + 1];
                      return n ? (n.type === "timed" ? n.title : getExercise(n.key).name) : "Klart!";
                    })()}
              </span>
            </p>
            <p className="mt-2 text-sm text-ink-3">Drick lite vatten om du vill.</p>
            <Button variant="secondary" className="mt-10" onClick={() => setRestEndAt(Date.now())}>
              <SkipForward size={18} /> Hoppa över vilan
            </Button>
          </motion.section>
        ) : step?.type === "timed" ? (
          <TimedView
            key={`t${stepIdx}`}
            step={step}
            left={pausedLeft !== null ? pausedLeft / 1000 : endAt ? (endAt - now) / 1000 : step.seconds}
            paused={pausedLeft !== null}
            onPause={togglePause}
            onSkip={nextStep}
          />
        ) : step?.type === "exercise" ? (
          <motion.section
            key={`e${stepIdx}`}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="flex flex-1 flex-col"
          >
            <ExerciseView
              step={step}
              level={levels[step.key] ?? step.level}
              setIdx={setIdx}
              reps={reps}
              setReps={setReps}
              holdLeft={holdEndAt ? (holdEndAt - now) / 1000 : null}
              onHold={() => {
                unlockAudio();
                const ex = getExercise(step.key);
                const extra = (levels[step.key] ?? step.level) >= 3 && ex.key === "knee_squeeze" ? 3 : 0;
                lastBeep.current = -1;
                setHoldEndAt(Date.now() + ((ex.holdSeconds ?? 5) + extra) * 1000);
              }}
              onEasier={() => changeLevel(-1)}
              onHarder={() => changeLevel(1)}
              onDone={completeSet}
              onSkip={nextStep}
              videoUrl={media[step.key]}
              showHow={showHow}
              setShowHow={setShowHow}
            />
          </motion.section>
        ) : null}
      </AnimatePresence>

      <Sheet open={stopOpen} onClose={() => setStopOpen(false)} title="Avsluta passet?">
        <p className="mb-5 text-ink-2">Det du har gjort räknas – oavsett hur länge du höll på.</p>
        <div className="flex flex-col gap-3">
          <Button size="lg" onClick={() => save(true)} disabled={saving}>
            Spara det jag gjort
          </Button>
          <Button variant="secondary" size="lg" onClick={() => setStopOpen(false)}>
            Fortsätt passet
          </Button>
          <button
            type="button"
            onClick={() => {
              setStopOpen(false);
              setRedFlag(true);
            }}
            className={buttonClass("ghost", "md", "text-danger")}
          >
            Jag mår inte bra
          </button>
        </div>
      </Sheet>
    </main>
  );
}

function TopBar({ onClose, closeLabel = "Stäng" }: { onClose: () => void; closeLabel?: string }) {
  return (
    <div className="flex h-12 items-center justify-between">
      <button
        type="button"
        onClick={onClose}
        aria-label={closeLabel}
        className="-ml-2 flex h-11 w-11 items-center justify-center rounded-full text-ink-2 hover:bg-surface-2"
      >
        <X size={24} />
      </button>
    </div>
  );
}

function TimedView({
  step,
  left,
  paused,
  onPause,
  onSkip,
}: {
  step: TimedStep;
  left: number;
  paused: boolean;
  onPause: () => void;
  onSkip: () => void;
}) {
  let segLabel: string | null = null;
  let segLeft = 0;
  if (step.intervals) {
    const elapsed = step.seconds - left;
    const cycle = step.intervals.work + step.intervals.easy;
    const inCycle = elapsed % cycle;
    const isWork = inCycle < step.intervals.work;
    segLabel = isWork ? step.intervals.workLabel : step.intervals.easyLabel;
    segLeft = isWork ? step.intervals.work - inCycle : cycle - inCycle;
  }
  return (
    <motion.section
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="flex flex-1 flex-col"
    >
      <h1 className="mt-6 text-3xl font-semibold tracking-tight">{step.title}</h1>
      <div className="flex flex-1 flex-col items-center justify-center">
        {segLabel && (
          <p
            className={cn(
              "mb-3 rounded-full px-4 py-1.5 text-base font-semibold",
              segLabel === step.intervals?.workLabel ? "bg-lime text-lime-ink" : "bg-surface-2",
            )}
          >
            {segLabel} · {mmss(segLeft)}
          </p>
        )}
        <p className={cn("tabular text-[6rem] font-semibold leading-none tracking-tight", paused && "opacity-40")}>
          {mmss(left)}
        </p>
        <ul className="mt-8 space-y-2 text-center text-lg text-ink-2">
          {step.lines.map((l) => (
            <li key={l}>{l}</li>
          ))}
        </ul>
      </div>
      <div className="flex gap-3">
        <Button variant="secondary" size="lg" className="flex-1" onClick={onPause} aria-label={paused ? "Fortsätt" : "Pausa"}>
          {paused ? <Play size={22} fill="currentColor" /> : <Pause size={22} fill="currentColor" />}
          {paused ? "Fortsätt" : "Paus"}
        </Button>
        <Button size="lg" className="flex-1" onClick={onSkip}>
          Klar <SkipForward size={20} />
        </Button>
      </div>
    </motion.section>
  );
}

function ExerciseView({
  step,
  level,
  setIdx,
  reps,
  setReps,
  holdLeft,
  onHold,
  onEasier,
  onHarder,
  onDone,
  onSkip,
  videoUrl,
  showHow,
  setShowHow,
}: {
  step: ExerciseStep;
  level: number;
  setIdx: number;
  reps: number;
  setReps: (n: number) => void;
  holdLeft: number | null;
  onHold: () => void;
  onEasier: () => void;
  onHarder: () => void;
  onDone: () => void;
  onSkip: () => void;
  videoUrl?: string;
  showHow: boolean;
  setShowHow: (v: boolean) => void;
}) {
  const ex = getExercise(step.key);
  const lvl = ex.levels[level - 1];
  const isHold = ex.mode === "hold";
  return (
    <>
      <div className="mt-5 flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-accent">
            Set {setIdx + 1} av {step.sets}
          </p>
          <h1 className="mt-1 text-3xl font-semibold leading-tight tracking-tight">{ex.name}</h1>
          <p className="mt-1 text-ink-2">{lvl?.name}</p>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {ex.zones.map((z) => (
          <span key={z} className="rounded-full bg-lime-soft px-3 py-1 text-xs font-semibold text-accent">
            {ZONE_LABEL[z]}
          </span>
        ))}
      </div>

      <div className="mt-4 rounded-3xl bg-surface p-4 shadow-card">
        <button
          type="button"
          onClick={() => setShowHow(!showHow)}
          className="flex min-h-10 w-full items-center justify-between text-left font-semibold"
          aria-expanded={showHow}
        >
          Så här gör du
          {showHow ? <ChevronUp size={20} className="text-ink-3" /> : <ChevronDown size={20} className="text-ink-3" />}
        </button>
        {showHow && (
          <div className="mt-2 flex gap-3">
            <ol className="flex-1 space-y-2 text-[0.98rem] leading-snug text-ink-2">
              {lvl?.how && <li className="font-medium text-ink">{lvl.how}</li>}
              {ex.steps.map((s, i) => (
                <li key={i}>
                  {i + 1}. {s}
                </li>
              ))}
              <li className="text-sm italic">{ex.tip}</li>
            </ol>
            <div className="shrink-0">
              <BodyMap zones={ex.zones} size={40} />
            </div>
          </div>
        )}
        {videoUrl && (
          <a
            href={videoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 flex h-11 items-center gap-2 text-sm font-semibold text-accent"
          >
            <Video size={18} /> Se video
          </a>
        )}
      </div>

      <div className="mt-auto pt-5">
        <p className="mb-2 px-1 text-center text-sm text-ink-2">
          Mål: {step.repMin}–{step.repMax} {isHold ? `håll à ${ex.holdSeconds} s` : "repetitioner"} – lugnt och kontrollerat
        </p>
        {isHold && (
          <Button
            variant="dark"
            size="lg"
            className="mb-3 w-full"
            onClick={onHold}
            disabled={holdLeft !== null}
          >
            {holdLeft !== null ? `Håll… ${Math.ceil(holdLeft)}` : `Håll ${ex.holdSeconds} s`}
          </Button>
        )}
        <Stepper value={reps} onChange={setReps} min={0} max={50} unit={isHold ? "håll" : "st"} />
        <div className="mt-3 flex gap-2">
          <Button variant="secondary" className="flex-1" onClick={onEasier} disabled={level <= 1}>
            Lättare
          </Button>
          <Button variant="secondary" className="flex-1" onClick={onHarder} disabled={level >= ex.levels.length}>
            Svårare
          </Button>
        </div>
        <Button size="lg" className="mt-3 w-full" onClick={onDone} disabled={reps === 0}>
          Klar med set
        </Button>
        <button type="button" onClick={onSkip} className="mt-1 flex h-11 w-full items-center justify-center text-sm text-ink-3">
          Hoppa över övningen
        </button>
      </div>
    </>
  );
}
