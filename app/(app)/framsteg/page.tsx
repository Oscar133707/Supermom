import { requireMom } from "@/lib/data";
import { addDays, shortDate, stockholmDate, weekStart } from "@/lib/dates";
import { habitStats, type ActivityTotals } from "@/lib/program/engine";
import { getPhase, JOURNEY, PHASES } from "@/lib/program/phases";
import { bmi, diaryPatterns, trend } from "@/lib/stats";
import { Card, SectionTitle } from "@/components/ui/card";
import { TrendChart } from "@/components/charts/trend-chart";
import { Sparkline } from "@/components/charts/sparkline";
import { FunctionTestButton, TESTS, type TestKey } from "@/components/progress/function-test";
import { PhaseActions } from "@/components/progress/phase-actions";
import { cn } from "@/lib/cn";
import type { BodyMetrics, FunctionTest } from "@/lib/types";

export const metadata = { title: "Framsteg · Supermom" };

const MEASURE_LABEL: Record<string, string> = {
  waist_cm: "Midja",
  hips_cm: "Höft",
  upper_arm_cm: "Överarm",
  thigh_cm: "Lår",
  chest_cm: "Bröst",
  calf_cm: "Vad",
};

const fmt = (n: number, d = 1) => n.toFixed(d).replace(".", ",");

export default async function ProgressPage() {
  const { supabase, user, profile } = await requireMom();
  const today = stockholmDate();
  const lastWeekStart = addDays(weekStart(today), -7);
  const lastWeekEnd = addDays(weekStart(today), -1);

  const [acts, body, tests, intake, diary, state, totals] = await Promise.all([
    supabase
      .from("activities")
      .select("date, kind, minutes, songs, title, outdoor, feel_before, feel_after")
      .eq("user_id", user.id)
      .gte("date", addDays(today, -60))
      .order("date"),
    supabase.from("body_metrics").select("*").eq("user_id", user.id).order("date"),
    supabase.from("function_tests").select("*").eq("user_id", user.id).order("date"),
    supabase.from("intake_logs").select("date, kind, amount").eq("user_id", user.id).gte("date", lastWeekStart).lte("date", lastWeekEnd),
    supabase
      .from("daily_checkins")
      .select("date, mood, sleep_hours, energy")
      .eq("user_id", user.id)
      .gte("date", addDays(today, -14))
      .order("date"),
    supabase.from("program_state").select("*").eq("user_id", user.id).maybeSingle(),
    supabase.from("activity_summary").select("*").eq("user_id", user.id).maybeSingle<ActivityTotals>(),
  ]);

  const activities = acts.data ?? [];
  const stats = habitStats(activities, today, totals.data);
  const bodyRows = (body.data ?? []) as BodyMetrics[];
  const testRows = (tests.data ?? []) as FunctionTest[];
  const phase = getPhase(state.data?.phase ?? 0);

  // Senaste veckan
  const lw = activities.filter((a) => a.date >= lastWeekStart && a.date <= lastWeekEnd);
  const lwDays = new Set(lw.map((a) => a.date)).size;
  const lwMinutes = lw.reduce((s, a) => s + a.minutes, 0);
  const lwOutdoor = lw.filter((a) => a.outdoor).reduce((s, a) => s + a.minutes, 0);
  const lwProtein = (intake.data ?? []).filter((i) => i.kind === "protein").reduce((s, i) => s + Number(i.amount), 0) / 7;
  const lwWater = (intake.data ?? []).filter((i) => i.kind === "water").reduce((s, i) => s + Number(i.amount), 0) / 7;

  // Mående före/efter (senaste 30 dagarna)
  const withFeel = activities.filter((a) => a.date >= addDays(today, -30) && a.feel_before && a.feel_after);
  const better = withFeel.filter((a) => (a.feel_after ?? 0) > (a.feel_before ?? 0)).length;
  const sameOrBetter = withFeel.filter((a) => (a.feel_after ?? 0) >= (a.feel_before ?? 0)).length;

  // Vikt
  const weights = bodyRows.filter((b) => b.weight_kg).map((b) => ({ date: b.date, value: Number(b.weight_kg) }));
  const tr = trend(weights);
  const trendNow = tr[tr.length - 1]?.value ?? null;
  const trendStart = tr[0]?.value ?? null;
  const height = profile.height_cm ? Number(profile.height_cm) : null;

  // Mått: första vs senaste per mått
  const measureDiffs = Object.keys(MEASURE_LABEL)
    .map((k) => {
      const vals = bodyRows.filter((b) => b[k as keyof BodyMetrics] != null);
      if (vals.length === 0) return null;
      const first = Number(vals[0][k as keyof BodyMetrics]);
      const last = Number(vals[vals.length - 1][k as keyof BodyMetrics]);
      return { key: k, label: MEASURE_LABEL[k], first, last, diff: last - first, n: vals.length };
    })
    .filter(Boolean) as { key: string; label: string; first: number; last: number; diff: number; n: number }[];

  const patterns = diaryPatterns(diary.data ?? [], today);
  const journeyIdx = state.data?.phase ?? 0;

  return (
    <main className="flex flex-col gap-6 px-4 pt-6">
      <header className="px-1">
        <h1 className="text-3xl font-semibold tracking-tight">Framsteg</h1>
        <p className="mt-1 text-ink-2">Allt här växer – inget kan tas ifrån dig.</p>
      </header>

      <section className="grid grid-cols-2 gap-2.5">
        {[
          { n: stats.totalActiveDays, label: "rörelsedagar" },
          { n: stats.totalSongs, label: "låtar" },
          { n: stats.totalMinutes, label: "minuter" },
          { n: stats.totalStrength, label: "styrkepass" },
        ].map((c, i) => (
          <div key={c.label} className={cn("rounded-[1.5rem] p-5", i === 0 ? "bg-lime text-lime-ink" : "bg-surface shadow-card")}>
            <p className="tabular text-4xl font-semibold tracking-tight">{c.n}</p>
            <p className={cn("mt-1 text-sm font-medium", i === 0 ? "opacity-80" : "text-ink-2")}>{c.label}</p>
          </div>
        ))}
      </section>

      {patterns.map((p) => (
        <Card key={p.key} className="bg-sky text-sky-ink shadow-none">
          <p className="font-semibold">{p.title}</p>
          <p className="mt-1 text-sm">{p.body}</p>
        </Card>
      ))}

      <div>
        <SectionTitle>Förra veckan · {shortDate(lastWeekStart)}–{shortDate(lastWeekEnd)}</SectionTitle>
        <Card>
          <div className="grid grid-cols-2 gap-y-4">
            <Stat value={`${lwDays}`} label="rörelsedagar" />
            <Stat value={`${lwMinutes}`} label="minuter rörelse" />
            <Stat value={`${lwOutdoor}`} label="minuter ute" />
            <Stat value={lwProtein ? `${Math.round(lwProtein)} g` : "–"} label="protein/dag i snitt" />
            <Stat value={lwWater ? fmt(lwWater) : "–"} label="glas vatten/dag" />
          </div>
          {withFeel.length >= 3 && (
            <p className="mt-5 rounded-2xl bg-lime-soft p-4 text-sm">
              <span className="font-semibold">Du mådde bättre efter {better} av {withFeel.length} pass</span>
              {sameOrBetter > better && ` – och minst lika bra efter ${sameOrBetter}`}. Det är rörelsens snabbaste
              belöning.
            </p>
          )}
        </Card>
      </div>

      <div>
        <SectionTitle>Resan</SectionTitle>
        <Card>
          <ol className="relative flex flex-col gap-4 pl-1">
            {JOURNEY.map((j, i) => {
              const done = i < journeyIdx;
              const current = i === journeyIdx;
              return (
                <li key={j.title} className="flex items-center gap-3">
                  <span
                    className={cn(
                      "flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-semibold",
                      done ? "bg-lime text-lime-ink" : current ? "bg-ink text-canvas" : "bg-surface-2 text-ink-3",
                    )}
                  >
                    {done ? "✓" : i + 1}
                  </span>
                  <span className={cn(current ? "font-semibold" : done ? "text-ink-2" : "text-ink-3")}>{j.title}</span>
                </li>
              );
            })}
          </ol>
          <div className="mt-5 rounded-2xl bg-surface-2 p-4">
            <p className="text-sm font-semibold">
              {phase.short}: {phase.name}
            </p>
            <p className="mt-1 text-sm text-ink-2">{phase.summary}</p>
            <p className="mt-1 text-sm text-ink-2">Mål: {phase.weeklyMinutesGoal.toLowerCase()}.</p>
          </div>
          <PhaseActions
            criteria={phase.criteria}
            nextName={phase.id < PHASES.length - 1 ? getPhase(phase.id + 1).name : null}
            canGoBack={phase.id > 0}
          />
        </Card>
      </div>

      <div>
        <SectionTitle>Styrka & ork</SectionTitle>
        <Card className="flex flex-col divide-y divide-line p-0">
          {(Object.keys(TESTS) as TestKey[]).map((k) => {
            const rows = testRows.filter((t) => t.test_key === k);
            const vals = rows.map((r) => Number(r.value));
            const last = rows[rows.length - 1];
            return (
              <div key={k} className="flex items-center gap-3 px-5 py-4">
                <div className="min-w-0 flex-1">
                  <p className="font-semibold">{TESTS[k].label}</p>
                  <p className="text-sm text-ink-2">
                    {last
                      ? `${fmt(Number(last.value), 0)} ${TESTS[k].unit} · ${shortDate(last.date)}${vals.length > 1 && vals[vals.length - 1] > vals[0] ? ` · +${fmt(vals[vals.length - 1] - vals[0], 0)} sedan start` : ""}`
                      : "Inte testat än"}
                  </p>
                </div>
                <Sparkline values={vals} width={72} />
                <FunctionTestButton testKey={k} last={last ? Number(last.value) : null} />
              </div>
            );
          })}
        </Card>
        <p className="mt-2 px-1 text-xs text-ink-3">Testa var 4–6 vecka. Styrka syns ofta långt innan vågen rör sig.</p>
      </div>

      <div>
        <SectionTitle>Kropp</SectionTitle>
        <Card>
          {trendNow !== null && (
            <div className="mb-3">
              <p className="text-sm text-ink-2">Trend</p>
              <p className="tabular text-3xl font-semibold tracking-tight">
                {fmt(trendNow)} <span className="text-lg font-medium text-ink-2">kg</span>
              </p>
              {trendStart !== null && tr.length > 1 && (
                <p className="text-sm text-ink-2">
                  {trendNow < trendStart ? `−${fmt(trendStart - trendNow)} kg sedan start` : "Trenden visar riktningen över tid"}
                </p>
              )}
            </div>
          )}
          <TrendChart points={weights} today={today} />
          {height && trendNow !== null && (
            <p className="mt-4 text-xs text-ink-3">BMI enligt trenden: {fmt(bmi(trendNow, height))}</p>
          )}
        </Card>
        {measureDiffs.length > 0 && (
          <Card className="mt-2.5 flex flex-col divide-y divide-line p-0">
            {measureDiffs.map((m) => (
              <div key={m.key} className="flex items-center justify-between px-5 py-3.5">
                <span className="font-medium">{m.label}</span>
                <span className="tabular text-ink-2">
                  {fmt(m.last)} cm
                  {m.n > 1 && m.diff < 0 && <span className="ml-2 font-semibold text-accent">−{fmt(-m.diff)}</span>}
                </span>
              </div>
            ))}
          </Card>
        )}
      </div>
    </main>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <p className="tabular text-2xl font-semibold tracking-tight">{value}</p>
      <p className="text-sm text-ink-2">{label}</p>
    </div>
  );
}
