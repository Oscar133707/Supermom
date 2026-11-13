import { getMomProfile, loadDashboard, requireAdmin } from "@/lib/data";
import { addDays, shortDate, weekdayShort, weekdayIndex } from "@/lib/dates";
import { habitStats, isComeback, lastDoseIncrease, WEEK_GOAL } from "@/lib/program/engine";
import { getPhase } from "@/lib/program/phases";
import { diaryPatterns, trend } from "@/lib/stats";
import { SEVERITY } from "@/lib/health";
import { Card, SectionTitle } from "@/components/ui/card";
import { cn } from "@/lib/cn";
import type { BodyMetrics, DailyCheckin, Symptoms } from "@/lib/types";

const MOOD_WORD: Record<number, string> = {
  [-3]: "mycket låg",
  [-2]: "låg",
  [-1]: "lite låg",
  0: "jämn",
  1: "lite hög",
  2: "hög",
  3: "mycket hög",
};
const ENERGY_WORD: Record<string, string> = { low: "Tung dag", normal: "Vanlig dag", high: "Mycket energi" };

export default async function AdminHome() {
  const { supabase } = await requireAdmin();
  const mom = await getMomProfile();
  if (!mom) {
    return (
      <main className="px-4 pt-4">
        <Card>
          <p className="font-semibold">Inget mamma-konto hittat</p>
          <p className="mt-2 text-sm text-ink-2">Skapa hennes konto i Supabase (se docs/setup.md). Det får rollen ”mom” automatiskt.</p>
        </Card>
      </main>
    );
  }
  const d = await loadDashboard(mom.id);
  const today = d.today;
  const from14 = addDays(today, -13);

  const [diaryRes, symRes, bodyRes, intakeRes] = await Promise.all([
    supabase.from("daily_checkins").select("*").eq("user_id", mom.id).gte("date", from14).order("date", { ascending: false }),
    supabase.from("symptoms").select("*").eq("user_id", mom.id).gte("date", addDays(today, -6)).order("date", { ascending: false }),
    supabase.from("body_metrics").select("date, weight_kg").eq("user_id", mom.id).not("weight_kg", "is", null).order("date"),
    supabase.from("intake_logs").select("date, kind, amount").eq("user_id", mom.id).gte("date", addDays(today, -6)),
  ]);
  const diary = (diaryRes.data ?? []) as DailyCheckin[];
  const symptoms = (symRes.data ?? []) as Symptoms[];
  const weights = ((bodyRes.data ?? []) as Pick<BodyMetrics, "date" | "weight_kg">[]).map((b) => ({ date: b.date, value: Number(b.weight_kg) }));
  const tr = trend(weights);

  const stats = habitStats(d.activities, today, d.totals);
  const comeback = !stats.activeToday && isComeback(stats, today);
  const activeDates = new Set(d.activities.map((a) => a.date));
  const intake7 = intakeRes.data ?? [];
  const avg = (k: string) => intake7.filter((i) => i.kind === k).reduce((s, i) => s + Number(i.amount), 0) / 7;
  const proteinToday = d.intake.filter((i) => i.kind === "protein").reduce((s, i) => s + Number(i.amount), 0);
  const waterToday = d.intake.filter((i) => i.kind === "water").reduce((s, i) => s + Number(i.amount), 0);
  const patterns = diaryPatterns(diary, today);
  const lastInj = d.injections[d.injections.length - 1];
  const inc = lastDoseIncrease(d.injections);
  const phase = getPhase(d.state.phase);

  return (
    <main className="flex flex-col gap-6 px-4 pt-2">
      <header className="px-1">
        <h1 className="text-3xl font-semibold tracking-tight">{mom.display_name ?? "Mamma"}</h1>
        <p className="mt-1 text-ink-2">
          {phase.short}: {phase.name} · {stats.totalActiveDays} rörelsedagar totalt
          {mom.takes_lithium === "yes" && " · tar litium"}
        </p>
      </header>

      {comeback && (
        <Card className="bg-lime text-lime-ink shadow-none">
          <p className="font-semibold">Hon har haft en paus sedan {shortDate(stats.lastActiveBefore!)}</p>
          <p className="mt-1 text-sm">
            Ett varmt meddelande utan frågor om träningen gör mest nytta nu – t.ex. ”Tänker på dig. Jag är stolt över
            dig oavsett.” Lägg det som ”När hon kommer tillbaka”.
          </p>
        </Card>
      )}

      {patterns.map((p) => (
        <Card key={p.key} className="bg-sky text-sky-ink shadow-none">
          <p className="font-semibold">{p.title}</p>
          <p className="mt-1 text-sm">
            Ett mönster i dagboken, ingen diagnos. Följ det ni kommit överens om – en vänlig kontakt är oftast bättre än
            frågor om träning eller vikt.
          </p>
        </Card>
      ))}

      <div>
        <SectionTitle>Senaste 14 dagarna</SectionTitle>
        <Card>
          {/* Two rows of seven – fits any phone width without crowding. */}
          <div className="grid grid-cols-7 gap-y-3">
            {Array.from({ length: 14 }).map((_, i) => {
              const date = addDays(from14, i);
              return (
                <div key={date} className="flex flex-col items-center gap-1.5">
                  <span className="text-xs text-ink-3">{weekdayShort(weekdayIndex(date))}</span>
                  <span
                    className={cn(
                      "h-7 w-7 rounded-full",
                      activeDates.has(date) ? "bg-lime" : "bg-surface-2",
                      date === today && "ring-2 ring-ink/50",
                    )}
                  />
                </div>
              );
            })}
          </div>
          <p className="mt-4 text-sm text-ink-2">
            Den här veckan: {stats.weekActiveDates.length} av {WEEK_GOAL} rörelsedagar · {stats.weekStrength} styrkepass
          </p>
        </Card>
      </div>

      <div>
        <SectionTitle>Idag</SectionTitle>
        <Card className="grid grid-cols-2 gap-4">
          <Mini label="Dagsform" value={d.checkin?.energy ? ENERGY_WORD[d.checkin.energy] : "–"} />
          <Mini label="Rörelse" value={stats.activeToday ? "Ja ✓" : "Inte än"} />
          <Mini label="Protein" value={`${Math.round(proteinToday)} / ${mom.protein_goal_g} g`} />
          <Mini label="Vatten" value={`${waterToday} / ${mom.water_goal_glasses} glas`} />
          <Mini label="Protein, snitt 7 d" value={`${Math.round(avg("protein"))} g`} />
          <Mini label="Vatten, snitt 7 d" value={`${avg("water").toFixed(1).replace(".", ",")} glas`} />
        </Card>
      </div>

      <div>
        <SectionTitle>Mounjaro & mage</SectionTitle>
        <Card>
          <p className="font-semibold">
            {lastInj
              ? `${String(lastInj.dose_mg).replace(".", ",")} mg · ${shortDate(lastInj.date)}`
              : "Ingen spruta loggad"}
          </p>
          {inc && <p className="text-sm text-ink-2">Senaste dosökning/start: {shortDate(inc)}</p>}
          {symptoms.length > 0 ? (
            <ul className="mt-3 space-y-1.5 text-sm">
              {symptoms.map((s) => {
                const parts = [
                  s.nausea && `illamående: ${SEVERITY[s.nausea].toLowerCase()}`,
                  s.vomiting && `kräkning: ${SEVERITY[s.vomiting].toLowerCase()}`,
                  s.diarrhea && `diarré: ${SEVERITY[s.diarrhea].toLowerCase()}`,
                  s.constipation && `förstoppning: ${SEVERITY[s.constipation].toLowerCase()}`,
                ].filter(Boolean);
                return (
                  <li key={s.date} className={cn(s.red_flags.length > 0 && "font-semibold text-danger")}>
                    {shortDate(s.date)}: {parts.length ? parts.join(", ") : "inga besvär"}
                    {s.red_flags.length > 0 && " · allvarliga symtom markerade"}
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="mt-2 text-sm text-ink-2">Inga magbesvär loggade senaste veckan.</p>
          )}
        </Card>
      </div>

      <div>
        <SectionTitle>Dagbok</SectionTitle>
        <Card className="flex flex-col divide-y divide-line p-0">
          {diary.length === 0 && <p className="p-5 text-sm text-ink-2">Inga anteckningar de senaste två veckorna.</p>}
          {diary.map((e) => (
            <div key={e.date} className="px-5 py-3.5">
              <p className="text-sm font-semibold">
                {shortDate(e.date)}
                <span className="font-normal text-ink-2">
                  {e.energy && ` · ${ENERGY_WORD[e.energy]}`}
                  {e.mood !== null && ` · humör ${MOOD_WORD[e.mood]}`}
                  {e.sleep_hours !== null && ` · sov ${String(e.sleep_hours).replace(".", ",")} h`}
                </span>
              </p>
              {e.note && <p className="mt-1 text-ink-2">”{e.note}”</p>}
            </div>
          ))}
        </Card>
      </div>

      <div>
        <SectionTitle>Vikt (trend)</SectionTitle>
        <Card>
          {tr.length ? (
            <p className="text-ink-2">
              <span className="text-2xl font-semibold text-ink">{tr[tr.length - 1].value.toFixed(1).replace(".", ",")} kg</span>
              {tr.length > 1 && ` · ${(tr[0].value - tr[tr.length - 1].value).toFixed(1).replace(".", ",")} kg sedan start`}
            </p>
          ) : (
            <p className="text-sm text-ink-2">Ingen vikt loggad.</p>
          )}
          <p className="mt-2 text-xs text-ink-3">Fråga helst inte om vikten – styrka, ork och att hon dyker upp är det som räknas.</p>
        </Card>
      </div>

      {d.checklist.length > 0 && (
        <div>
          <SectionTitle>Hennes vårdlista</SectionTitle>
          <Card className="flex flex-col gap-2">
            {d.checklist.map((c) => (
              <p key={c.id} className={cn("text-sm", c.done_at ? "text-ink-3 line-through" : "")}>
                {c.done_at ? "✓ " : "○ "}
                {c.text}
              </p>
            ))}
          </Card>
        </div>
      )}
    </main>
  );
}

function Mini({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-ink-2">{label}</p>
      <p className="font-semibold">{value}</p>
    </div>
  );
}
