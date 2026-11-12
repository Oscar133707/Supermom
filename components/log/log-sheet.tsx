"use client";

import { useCallback, useMemo, useState, useTransition } from "react";
import {
  Activity as ActivityIcon,
  Beef,
  Bike,
  BookHeart,
  ChevronLeft,
  Droplet,
  Footprints,
  Music,
  Ruler,
  Stethoscope,
  Syringe,
} from "lucide-react";
import { Sheet } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { useCelebrate } from "@/components/app/celebration";
import { RedFlagScreen } from "@/components/app/red-flag";
import { cn } from "@/lib/cn";
import {
  DOSES,
  FOODS,
  HYDRATION_TIPS_LITHIUM,
  LOW_APPETITE_TIPS,
  RED_FLAGS,
  SEVERITY,
  SITE_LABEL,
  SITES,
  SYMPTOM_LABELS,
} from "@/lib/health";
import {
  addInjection,
  addIntake,
  deleteActivity,
  deleteInjection,
  deleteIntake,
  logActivity,
  saveBody,
  saveDiary,
  saveSymptoms,
} from "@/app/(app)/actions";
import type { ActivityKind, InjectionSite, Lithium } from "@/lib/types";
import { LogSheetContext, type LogPanel } from "./log-context";
import { Chips, Stepper } from "./stepper";

export interface LogSummary {
  today: string;
  yesterday: string;
  proteinToday: number;
  waterToday: number;
  proteinGoal: number;
  waterGoal: number;
  lithium: Lithium;
  lastInjection: { dose_mg: number; site: InjectionSite | null } | null;
  diary: { mood: number | null; sleep_hours: number | null; meds_taken: boolean | null; note: string | null } | null;
  symptoms: { nausea: number; vomiting: number; diarrhea: number; constipation: number; red_flags: string[] } | null;
}

const TITLES: Record<LogPanel, string> = {
  menu: "Logga",
  protein: "Protein",
  water: "Vatten",
  move: "Rörelse",
  diary: "Dagbok",
  injection: "Spruta",
  symptoms: "Hur mår magen?",
  body: "Vikt & mått",
};

export function LogSheetProvider({ summary, children }: { summary: LogSummary; children: React.ReactNode }) {
  const [panel, setPanel] = useState<LogPanel | null>(null);
  const open = useCallback((p: LogPanel = "menu") => setPanel(p), []);
  const close = useCallback(() => setPanel(null), []);
  const ctx = useMemo(() => ({ open }), [open]);

  return (
    <LogSheetContext.Provider value={ctx}>
      {children}
      <Sheet open={panel !== null} onClose={close} title={panel ? TITLES[panel] : undefined}>
        {panel && panel !== "menu" && (
          <button
            type="button"
            onClick={() => setPanel("menu")}
            className="-mt-1 mb-3 flex h-10 items-center gap-1 text-sm font-medium text-ink-2"
          >
            <ChevronLeft size={18} /> Alla
          </button>
        )}
        {panel === "menu" && <Menu onPick={setPanel} />}
        {panel === "protein" && <ProteinPanel s={summary} />}
        {panel === "water" && <WaterPanel s={summary} />}
        {panel === "move" && <MovePanel onDone={close} />}
        {panel === "diary" && <DiaryPanel s={summary} onDone={close} />}
        {panel === "symptoms" && <SymptomsPanel s={summary} onDone={close} />}
        {panel === "injection" && <InjectionPanel s={summary} onDone={close} />}
        {panel === "body" && <BodyPanel onDone={close} />}
      </Sheet>
    </LogSheetContext.Provider>
  );
}

// ─── Menu ───────────────────────────────────────────────────────────────────
function Menu({ onPick }: { onPick: (p: LogPanel) => void }) {
  const items: { p: LogPanel; label: string; icon: React.ElementType; tint: string }[] = [
    { p: "move", label: "Rörelse", icon: Footprints, tint: "bg-lime text-lime-ink" },
    { p: "protein", label: "Protein", icon: Beef, tint: "bg-peach text-peach-ink" },
    { p: "water", label: "Vatten", icon: Droplet, tint: "bg-sky text-sky-ink" },
    { p: "diary", label: "Dagbok", icon: BookHeart, tint: "bg-surface-2 text-ink" },
    { p: "symptoms", label: "Mage & mående", icon: Stethoscope, tint: "bg-surface-2 text-ink" },
    { p: "injection", label: "Spruta", icon: Syringe, tint: "bg-surface-2 text-ink" },
    { p: "body", label: "Vikt & mått", icon: Ruler, tint: "bg-surface-2 text-ink" },
  ];
  return (
    <div className="grid grid-cols-2 gap-3">
      {items.map(({ p, label, icon: Icon, tint }) => (
        <button
          key={p}
          type="button"
          onClick={() => onPick(p)}
          className="flex h-28 flex-col items-start justify-between rounded-3xl bg-surface p-4 text-left shadow-card transition-transform active:scale-[0.98]"
        >
          <span className={cn("flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl", tint)}>
            <Icon size={22} />
          </span>
          <span className="text-base font-semibold">{label}</span>
        </button>
      ))}
    </div>
  );
}

// ─── Protein ────────────────────────────────────────────────────────────────
function ProteinPanel({ s }: { s: LogSummary }) {
  const toast = useToast();
  const [pending, start] = useTransition();
  const [total, setTotal] = useState(s.proteinToday);
  const [custom, setCustom] = useState(10);
  const nauseous = (s.symptoms?.nausea ?? 0) >= 1 || (s.symptoms?.vomiting ?? 0) >= 1;
  const [easyOnly, setEasyOnly] = useState(nauseous);
  const foods = easyOnly ? FOODS.filter((f) => f.easy) : FOODS;

  const add = (amount: number, label: string) =>
    start(async () => {
      setTotal((t) => t + amount);
      const { id } = await addIntake("protein", amount, label);
      toast(`+${amount} g protein`, id ? async () => {
        setTotal((t) => t - amount);
        await deleteIntake(id);
      } : undefined);
    });

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-baseline justify-between rounded-3xl bg-peach px-5 py-4 text-peach-ink">
        <span className="text-sm font-semibold">Idag</span>
        <span className="tabular">
          <span className="text-3xl font-semibold">{Math.round(total)}</span>
          <span className="ml-1 text-base"> av {s.proteinGoal} g</span>
        </span>
      </div>

      {nauseous && (
        <div className="rounded-2xl bg-surface p-4 shadow-card">
          <p className="font-semibold">Läge för låg aptit</p>
          <ul className="mt-2 space-y-1.5 text-sm text-ink-2">
            {LOW_APPETITE_TIPS.slice(0, 3).map((t) => (
              <li key={t}>• {t}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="flex items-center justify-between">
        <p className="text-sm text-ink-2">Tryck på det du åt – ungefärliga värden.</p>
        <button
          type="button"
          onClick={() => setEasyOnly((v) => !v)}
          aria-pressed={easyOnly}
          className={cn(
            "h-10 rounded-full px-3 text-xs font-semibold",
            easyOnly ? "bg-ink text-canvas" : "bg-surface-2 text-ink-2",
          )}
        >
          Lätt för magen
        </button>
      </div>

      <div className="grid grid-cols-2 gap-2.5">
        {foods.map((f) => (
          <button
            key={f.key}
            type="button"
            disabled={pending}
            onClick={() => add(f.protein, f.label)}
            className="flex min-h-[4.5rem] flex-col items-start justify-center rounded-2xl bg-surface px-4 py-3 text-left shadow-card active:scale-[0.98]"
          >
            <span className="font-semibold">{f.label}</span>
            <span className="text-sm text-ink-2">
              {f.portion} · ≈{f.protein} g
            </span>
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-2">
        <p className="px-1 text-sm font-medium text-ink-2">Egen mängd</p>
        <Stepper value={custom} onChange={setCustom} step={5} min={5} max={100} unit="g" />
        <Button variant="secondary" disabled={pending} onClick={() => add(custom, "Egen")}>
          Lägg till {custom} g
        </Button>
      </div>
    </div>
  );
}

// ─── Water ──────────────────────────────────────────────────────────────────
function WaterPanel({ s }: { s: LogSummary }) {
  const toast = useToast();
  const [pending, start] = useTransition();
  const [total, setTotal] = useState(s.waterToday);
  const add = (n: number) =>
    start(async () => {
      setTotal((t) => t + n);
      const { id } = await addIntake("water", n, n === 1 ? "Glas" : `${n} glas`);
      toast(n === 1 ? "+1 glas vatten" : `+${n} glas vatten`, id ? async () => {
        setTotal((t) => t - n);
        await deleteIntake(id);
      } : undefined);
    });
  const glasses = Array.from({ length: Math.max(s.waterGoal, Math.ceil(total)) });

  return (
    <div className="flex flex-col gap-5">
      <div className="rounded-3xl bg-sky px-5 py-5 text-sky-ink">
        <div className="flex items-baseline justify-between">
          <span className="text-sm font-semibold">Idag</span>
          <span className="tabular">
            <span className="text-3xl font-semibold">{total}</span>
            <span className="ml-1 text-base"> av {s.waterGoal} glas</span>
          </span>
        </div>
        <div className="mt-4 flex flex-wrap gap-1.5" aria-hidden="true">
          {glasses.map((_, i) => (
            <span key={i} className={cn("h-7 w-5 rounded-b-md rounded-t-sm", i < total ? "bg-sky-ink/80" : "bg-sky-ink/15")} />
          ))}
        </div>
        <p className="mt-3 text-sm opacity-80">1 glas = 2,5 dl. Lite extra på träningsdagar och varma dagar.</p>
      </div>
      <Button size="lg" disabled={pending} onClick={() => add(1)} className="w-full">
        <Droplet size={22} /> +1 glas
      </Button>
      <Button variant="secondary" disabled={pending} onClick={() => add(2)} className="w-full">
        +2 glas
      </Button>
      {s.lithium === "yes" && (
        <div className="rounded-2xl bg-surface p-4 shadow-card">
          <p className="font-semibold">Viktigt med litium</p>
          <ul className="mt-2 space-y-1.5 text-sm text-ink-2">
            {HYDRATION_TIPS_LITHIUM.map((t) => (
              <li key={t}>• {t}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

// ─── Movement ───────────────────────────────────────────────────────────────
function MovePanel({ onDone }: { onDone: () => void }) {
  const toast = useToast();
  const celebrate = useCelebrate();
  const [pending, start] = useTransition();
  const [kind, setKind] = useState<ActivityKind | null>(null);
  const [minutes, setMinutes] = useState(10);
  const [songs, setSongs] = useState(1);
  const [outdoor, setOutdoor] = useState(false);

  const save = (k: ActivityKind, mins: number, s: number, title: string, out = false) =>
    start(async () => {
      const { id, celebration } = await logActivity({ kind: k, minutes: mins, songs: s, title, outdoor: out });
      onDone();
      toast("Rörelse sparad – den räknas", id ? () => deleteActivity(id) : undefined);
      celebrate(celebration);
    });

  if (!kind) {
    return (
      <div className="flex flex-col gap-3">
        <button
          type="button"
          disabled={pending}
          onClick={() => save("min_dose", 3, 1, "En låt")}
          className="flex items-center gap-4 rounded-3xl bg-lime p-5 text-left text-lime-ink active:scale-[0.99]"
        >
          <Music size={28} />
          <span>
            <span className="block text-lg font-semibold">Jag rörde mig till en låt</span>
            <span className="text-sm opacity-80">Ett tryck. Det räknas fullt ut.</span>
          </span>
        </button>
        {(
          [
            { k: "walk", label: "Promenad", icon: Footprints },
            { k: "bike", label: "Cykel", icon: Bike },
            { k: "dance", label: "Dans", icon: Music },
            { k: "other", label: "Annat", icon: ActivityIcon },
          ] as const
        ).map(({ k, label, icon: Icon }) => (
          <button
            key={k}
            type="button"
            onClick={() => {
              setKind(k);
              setMinutes(k === "dance" ? 6 : 10);
            }}
            className="flex h-16 items-center gap-4 rounded-2xl bg-surface px-5 text-left shadow-card active:scale-[0.99]"
          >
            <Icon size={22} className="text-ink-2" />
            <span className="text-base font-semibold">{label}</span>
          </button>
        ))}
      </div>
    );
  }

  const label = { walk: "Promenad", bike: "Cykel", dance: "Dans", other: "Rörelse" }[kind as "walk" | "bike" | "dance" | "other"];

  return (
    <div className="flex flex-col gap-5">
      <p className="text-lg font-semibold">{label}</p>
      {kind === "dance" ? (
        <>
          <p className="px-1 text-sm font-medium text-ink-2">Hur många låtar?</p>
          <Stepper value={songs} onChange={setSongs} min={1} max={30} unit={songs === 1 ? "låt" : "låtar"} />
        </>
      ) : (
        <>
          <p className="px-1 text-sm font-medium text-ink-2">Hur länge?</p>
          <Chips
            value={minutes}
            onChange={setMinutes}
            options={[2, 5, 10, 15, 20, 30, 45].map((m) => ({ value: m, label: `${m} min` }))}
          />
          <Stepper value={minutes} onChange={setMinutes} min={1} max={180} unit="min" />
        </>
      )}
      {kind === "walk" && (
        <Chips
          value={outdoor ? "ute" : "inne"}
          onChange={(v) => setOutdoor(v === "ute")}
          options={[
            { value: "inne", label: "Inne" },
            { value: "ute", label: "Ute" },
          ]}
        />
      )}
      <Button
        size="lg"
        disabled={pending}
        onClick={() =>
          kind === "dance"
            ? save("dance", songs * 3, songs, "Dans")
            : save(kind, minutes, 0, label, outdoor)
        }
      >
        Spara
      </Button>
    </div>
  );
}

// ─── Diary ──────────────────────────────────────────────────────────────────
const MOODS = [
  { v: -3, label: "Mycket låg" },
  { v: -2, label: "Låg" },
  { v: -1, label: "Lite låg" },
  { v: 0, label: "Jämn" },
  { v: 1, label: "Lite hög" },
  { v: 2, label: "Hög" },
  { v: 3, label: "Mycket hög" },
];

function DiaryPanel({ s, onDone }: { s: LogSummary; onDone: () => void }) {
  const toast = useToast();
  const [pending, start] = useTransition();
  const [mood, setMood] = useState<number | null>(s.diary?.mood ?? null);
  const [sleep, setSleep] = useState<number>(s.diary?.sleep_hours ?? 7);
  const [sleepSet, setSleepSet] = useState(s.diary?.sleep_hours != null);
  const [meds, setMeds] = useState<boolean | null>(s.diary?.meds_taken ?? null);
  const [note, setNote] = useState(s.diary?.note ?? "");

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="mb-3 px-1 text-sm font-medium text-ink-2">Humör idag</p>
        <div className="grid grid-cols-7 gap-1.5">
          {MOODS.map((m) => (
            <button
              key={m.v}
              type="button"
              onClick={() => setMood(m.v)}
              aria-label={m.label}
              aria-pressed={mood === m.v}
              className={cn(
                "flex h-14 items-center justify-center rounded-2xl text-base font-semibold tabular transition-colors",
                mood === m.v ? "bg-ink text-canvas" : "bg-surface text-ink shadow-card",
              )}
            >
              {m.v > 0 ? `+${m.v}` : m.v}
            </button>
          ))}
        </div>
        <div className="mt-2 flex justify-between px-1 text-xs text-ink-3">
          <span>Låg</span>
          <span>{mood !== null ? MOODS.find((m) => m.v === mood)?.label : "Jämn i mitten"}</span>
          <span>Hög</span>
        </div>
      </div>

      <div>
        <p className="mb-3 px-1 text-sm font-medium text-ink-2">Sömn i natt</p>
        <Stepper
          value={sleep}
          onChange={(v) => {
            setSleep(v);
            setSleepSet(true);
          }}
          step={0.5}
          min={0}
          max={16}
          unit="tim"
          format={(v) => String(v).replace(".", ",")}
        />
      </div>

      <div>
        <p className="mb-3 px-1 text-sm font-medium text-ink-2">Tagit dina mediciner? (valfritt)</p>
        <Chips
          value={meds === null ? null : meds ? "ja" : "nej"}
          onChange={(v) => setMeds(v === "ja")}
          options={[
            { value: "ja", label: "Ja" },
            { value: "nej", label: "Inte än" },
          ]}
        />
      </div>

      <label className="flex flex-col gap-2">
        <span className="px-1 text-sm font-medium text-ink-2">Något du vill komma ihåg? (valfritt)</span>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={3}
          maxLength={2000}
          placeholder="Några ord räcker."
          className="w-full resize-none rounded-2xl bg-surface p-4 text-base shadow-card outline-none placeholder:text-ink-3 focus:ring-2 focus:ring-accent"
        />
      </label>

      <Button
        size="lg"
        disabled={pending}
        onClick={() =>
          start(async () => {
            await saveDiary({ mood, sleep_hours: sleepSet ? sleep : null, meds_taken: meds, note: note.trim() || null });
            onDone();
            toast("Dagboken sparad");
          })
        }
      >
        Spara
      </Button>
    </div>
  );
}

// ─── Symptoms ───────────────────────────────────────────────────────────────
type SymKey = "nausea" | "vomiting" | "diarrhea" | "constipation";

function SymptomsPanel({ s, onDone }: { s: LogSummary; onDone: () => void }) {
  const toast = useToast();
  const [pending, start] = useTransition();
  const [vals, setVals] = useState<Record<SymKey, number>>({
    nausea: s.symptoms?.nausea ?? 0,
    vomiting: s.symptoms?.vomiting ?? 0,
    diarrhea: s.symptoms?.diarrhea ?? 0,
    constipation: s.symptoms?.constipation ?? 0,
  });
  const [flags, setFlags] = useState<string[]>(s.symptoms?.red_flags ?? []);
  const [showFlags, setShowFlags] = useState(flags.length > 0);
  const [stop, setStop] = useState(false);
  const fluidLoss = vals.vomiting > 0 || vals.diarrhea > 0;

  if (stop) return <RedFlagScreen onClose={onDone} />;

  return (
    <div className="flex flex-col gap-5">
      {SYMPTOM_LABELS.map(({ key, label }) => (
        <div key={key}>
          <p className="mb-2 px-1 font-semibold">{label}</p>
          <div className="grid grid-cols-4 gap-1.5">
            {SEVERITY.map((sv, i) => (
              <button
                key={sv}
                type="button"
                onClick={() => setVals((v) => ({ ...v, [key]: i }))}
                aria-pressed={vals[key] === i}
                className={cn(
                  "h-12 rounded-xl text-sm font-semibold transition-colors",
                  vals[key] === i ? "bg-ink text-canvas" : "bg-surface text-ink shadow-card",
                )}
              >
                {sv}
              </button>
            ))}
          </div>
        </div>
      ))}

      {fluidLoss && (
        <div className={cn("rounded-2xl p-4", s.lithium === "yes" ? "bg-danger-soft" : "bg-sky")}>
          <p className="font-semibold">{s.lithium === "yes" ? "Viktigt med litium" : "Vätskeläge idag"}</p>
          <p className="mt-1 text-sm">
            Drick 2–4 extra glas, gärna vätskeersättning från apoteket.
            {s.lithium === "yes" &&
              " När du kräks eller har diarré kan litiumhalten stiga – kontakta vården eller 1177 redan idag."}
          </p>
        </div>
      )}

      <div className="rounded-2xl bg-surface shadow-card">
        <button
          type="button"
          onClick={() => setShowFlags((v) => !v)}
          className="flex min-h-14 w-full items-center justify-between px-4 text-left font-semibold"
          aria-expanded={showFlags}
        >
          Något som känns allvarligt?
          <span className="text-sm font-medium text-ink-2">{showFlags ? "Dölj" : "Visa"}</span>
        </button>
        {showFlags && (
          <div className="flex flex-col gap-1 px-2 pb-3">
            {RED_FLAGS.map((f) => {
              const on = flags.includes(f.key);
              return (
                <label key={f.key} className="flex min-h-12 items-center gap-3 rounded-xl px-2">
                  <input
                    type="checkbox"
                    checked={on}
                    onChange={() => setFlags((x) => (on ? x.filter((k) => k !== f.key) : [...x, f.key]))}
                    className="h-6 w-6 shrink-0 accent-[var(--danger)]"
                  />
                  <span className="text-sm">{f.label}</span>
                </label>
              );
            })}
          </div>
        )}
      </div>

      <Button
        size="lg"
        disabled={pending}
        onClick={() =>
          start(async () => {
            await saveSymptoms({ ...vals, red_flags: flags });
            if (flags.length) setStop(true);
            else {
              onDone();
              toast("Sparat. Dagens förslag anpassas efter hur du mår.");
            }
          })
        }
      >
        Spara
      </Button>
    </div>
  );
}

// ─── Injection ──────────────────────────────────────────────────────────────
function nextSite(last: InjectionSite | null): InjectionSite {
  if (!last) return "mage_v";
  return SITES[(SITES.indexOf(last) + 1) % SITES.length];
}

function InjectionPanel({ s, onDone }: { s: LogSummary; onDone: () => void }) {
  const toast = useToast();
  const [pending, start] = useTransition();
  const [day, setDay] = useState<"today" | "yesterday">("today");
  const [dose, setDose] = useState<number>(s.lastInjection?.dose_mg ?? 2.5);
  const [site, setSite] = useState<InjectionSite>(nextSite(s.lastInjection?.site ?? null));
  const increased = s.lastInjection && dose > s.lastInjection.dose_mg;

  return (
    <div className="flex flex-col gap-5">
      <div>
        <p className="mb-2 px-1 text-sm font-medium text-ink-2">När?</p>
        <Chips
          value={day}
          onChange={setDay}
          options={[
            { value: "today", label: "Idag" },
            { value: "yesterday", label: "Igår" },
          ]}
        />
      </div>
      <div>
        <p className="mb-2 px-1 text-sm font-medium text-ink-2">Dos</p>
        <Chips
          value={dose}
          onChange={setDose}
          options={DOSES.map((d) => ({ value: d, label: `${String(d).replace(".", ",")} mg` }))}
        />
      </div>
      {increased && (
        <p className="rounded-2xl bg-lime-soft p-4 text-sm">
          Ny dos. De närmaste två veckorna kan magen kännas mer – appen gör dina förslag lättare de dagar du loggar
          illamående.
          {s.lithium === "yes" && " Kom ihåg att fråga om litiumprov efter dosökningen."}
        </p>
      )}
      <div>
        <p className="mb-2 px-1 text-sm font-medium text-ink-2">Var? (förslag: nästa ställe i turordningen)</p>
        <div className="grid grid-cols-2 gap-2">
          {SITES.map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => setSite(st)}
              aria-pressed={site === st}
              className={cn(
                "h-12 rounded-xl text-sm font-semibold",
                site === st ? "bg-ink text-canvas" : "bg-surface shadow-card",
              )}
            >
              {SITE_LABEL[st]}
            </button>
          ))}
        </div>
      </div>
      <Button
        size="lg"
        disabled={pending}
        onClick={() =>
          start(async () => {
            const { id } = await addInjection({
              date: day === "today" ? s.today : s.yesterday,
              dose_mg: dose,
              site,
            });
            onDone();
            toast("Sprutan är loggad", id ? () => deleteInjection(id) : undefined);
          })
        }
      >
        Spara
      </Button>
    </div>
  );
}

// ─── Body ───────────────────────────────────────────────────────────────────
const MEASURES = [
  { key: "waist_cm", label: "Midja" },
  { key: "hips_cm", label: "Höft" },
  { key: "upper_arm_cm", label: "Överarm" },
  { key: "thigh_cm", label: "Lår" },
  { key: "chest_cm", label: "Bröst" },
  { key: "calf_cm", label: "Vad" },
] as const;

function parseNum(v: string): number | null {
  const n = Number(v.replace(",", ".").trim());
  return v.trim() && Number.isFinite(n) && n > 0 ? n : null;
}

function BodyPanel({ onDone }: { onDone: () => void }) {
  const toast = useToast();
  const [pending, start] = useTransition();
  const [weight, setWeight] = useState("");
  const [vals, setVals] = useState<Record<string, string>>({});
  const [more, setMore] = useState(false);
  const input =
    "h-14 w-full rounded-2xl bg-surface px-4 text-lg tabular shadow-card outline-none focus:ring-2 focus:ring-accent";

  return (
    <div className="flex flex-col gap-5">
      <p className="text-sm text-ink-2">
        Vikten varierar mycket från dag till dag – appen visar trenden, inte enskilda siffror. En gång i veckan räcker.
      </p>
      <label className="flex flex-col gap-2">
        <span className="px-1 text-sm font-medium text-ink-2">Vikt (kg)</span>
        <input inputMode="decimal" value={weight} onChange={(e) => setWeight(e.target.value)} className={input} placeholder="t.ex. 138,5" />
      </label>
      {!more ? (
        <Button variant="secondary" onClick={() => setMore(true)}>
          Lägg till mått (cm)
        </Button>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {MEASURES.map((m) => (
            <label key={m.key} className="flex flex-col gap-1.5">
              <span className="px-1 text-sm font-medium text-ink-2">{m.label}</span>
              <input
                inputMode="decimal"
                value={vals[m.key] ?? ""}
                onChange={(e) => setVals((v) => ({ ...v, [m.key]: e.target.value }))}
                className={input}
              />
            </label>
          ))}
          <p className="col-span-2 px-1 text-xs text-ink-3">
            Mät på samma ställe varje gång, t.ex. överarmen mitt emellan axel och armbåge.
          </p>
        </div>
      )}
      <Button
        size="lg"
        disabled={pending}
        onClick={() =>
          start(async () => {
            const payload: Record<string, number | null> = { weight_kg: parseNum(weight) };
            for (const m of MEASURES) payload[m.key] = parseNum(vals[m.key] ?? "");
            const { ok } = await saveBody(payload);
            if (ok) {
              onDone();
              toast("Sparat");
            } else toast("Fyll i minst ett värde");
          })
        }
      >
        Spara
      </Button>
    </div>
  );
}
