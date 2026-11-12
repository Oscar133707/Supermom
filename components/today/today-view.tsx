import Link from "next/link";
import { ArrowRight, Clock, Moon, Play, Stethoscope } from "lucide-react";
import type { Dashboard } from "@/lib/data";
import { greeting, longDate, weekStart, addDays, weekdayShort, shortDate } from "@/lib/dates";
import { dayPlan, habitStats, isComeback, symptomHeavy, WEEK_GOAL } from "@/lib/program/engine";
import { getExercise } from "@/lib/program/exercises";
import { getPhase } from "@/lib/program/phases";
import { cn } from "@/lib/cn";
import { ButtonLink } from "@/components/ui/button";
import { EnergyPicker } from "@/components/today/energy-picker";
import { MinDoseButton } from "@/components/today/min-dose-button";
import { RingsRow } from "@/components/today/rings-row";
import { MessageCard } from "@/components/today/message-card";
import { ProposalCard } from "@/components/today/proposal-card";
import type { Profile, ProgramProposal } from "@/lib/types";

export function TodayView({ profile, d }: { profile: Profile; d: Dashboard }) {
  const { today } = d;
  const stats = habitStats(d.activities, today, d.totals);
  const comeback = !stats.activeToday && isComeback(stats, today);
  const heavy = symptomHeavy(d.symptoms, d.injections, today);
  const plan = dayPlan({
    today,
    energy: d.checkin?.energy ?? null,
    state: d.state,
    levels: d.levels,
    activities: d.activities,
    heavySymptoms: heavy,
    comeback,
  });
  const paused = profile.paused_until && profile.paused_until >= today;
  const protein = d.intake.filter((i) => i.kind === "protein").reduce((s, i) => s + Number(i.amount), 0);
  const water = d.intake.filter((i) => i.kind === "water").reduce((s, i) => s + Number(i.amount), 0);
  const openChecklist = d.checklist.filter((c) => !c.done_at);
  const ws = weekStart(today);
  const name = profile.display_name ? `, ${profile.display_name}` : "";

  return (
    <main className="flex flex-col gap-5 px-4 pt-6">
      <header className="px-1">
        <p className="text-sm font-medium text-ink-2">{capitalize(longDate(today))}</p>
        <h1 className="mt-0.5 text-3xl font-semibold tracking-tight">
          {comeback ? "Välkommen tillbaka" : greeting()}
          {name}
        </h1>
      </header>

      {comeback && (
        <div className="rounded-[1.5rem] bg-lime p-5 text-lime-ink">
          <p className="text-lg font-semibold">En paus raderar ingenting.</p>
          <p className="mt-1 opacity-85">
            Allt du gjort finns kvar – {stats.totalActiveDays} rörelsedagar. Att komma tillbaka är det viktigaste du kan
            göra. En låt räcker idag.
          </p>
        </div>
      )}

      {paused && (
        <div className="flex items-center gap-3 rounded-[1.5rem] bg-surface p-5 shadow-card">
          <Moon size={22} className="text-ink-2" />
          <p className="text-ink-2">
            Pausläge till {shortDate(profile.paused_until!)}. Inga påminnelser, inga mål – bara vila.
          </p>
        </div>
      )}

      {d.message && <MessageCard id={d.message.id} body={d.message.body} />}

      <EnergyPicker value={d.checkin?.energy ?? null} />

      {/* Dagens förslag */}
      <section
        className={cn(
          "rounded-[1.75rem] p-6",
          plan.mode === "done" ? "bg-surface shadow-card" : "bg-hero text-hero-ink",
        )}
        aria-label="Dagens förslag"
      >
        <p className={cn("text-sm font-semibold", plan.mode === "done" ? "text-accent" : "text-lime")}>
          {plan.mode === "done" ? "Klart för idag ✓" : "Dagens förslag"}
        </p>
        <h2 className="mt-2 text-3xl font-semibold tracking-tight">{plan.primary.title}</h2>
        <p className={cn("mt-1", plan.mode === "done" ? "text-ink-2" : "text-hero-ink/70")}>
          <span className="inline-flex items-center gap-1.5">
            <Clock size={15} /> ca {plan.primary.minutes} min
          </span>{" "}
          · {plan.primary.subtitle}
        </p>
        {plan.note && (
          <p className={cn("mt-4 text-sm leading-relaxed", plan.mode === "done" ? "text-ink-2" : "text-hero-ink/80")}>
            {plan.note}
          </p>
        )}
        <ButtonLink
          href={`/pass/${plan.primary.workoutId}`}
          size="lg"
          variant={plan.mode === "done" ? "secondary" : "primary"}
          className="mt-5 w-full"
        >
          <Play size={20} fill="currentColor" /> {plan.mode === "done" ? "Lite extra" : "Starta"}
        </ButtonLink>
        <div className="no-scrollbar -mx-1 mt-4 flex gap-2 overflow-x-auto px-1">
          {plan.alternatives.map((a) => (
            <Link
              key={a.workoutId}
              href={`/pass/${a.workoutId}`}
              className={cn(
                "flex h-11 shrink-0 items-center rounded-full px-4 text-sm font-semibold",
                plan.mode === "done" ? "bg-surface-2 text-ink" : "bg-white/10 text-hero-ink",
              )}
            >
              {a.title} · {a.minutes} min
            </Link>
          ))}
        </div>
      </section>

      <MinDoseButton />

      {d.proposals.map((p) => (
        <ProposalCard key={p.id} id={p.id} {...proposalText(p)} from={p.created_by ? "Oscar föreslår" : "Nästa steg"} />
      ))}

      <RingsRow
        weekDays={stats.weekActiveDates.length}
        weekGoal={WEEK_GOAL}
        protein={protein}
        proteinGoal={profile.protein_goal_g}
        water={water}
        waterGoal={profile.water_goal_glasses}
      />

      {/* Veckan – aktiva dagar fylls, inget markeras som missat */}
      <section className="rounded-[1.5rem] bg-surface p-5 shadow-card" aria-label="Veckan">
        <div className="flex items-center justify-between">
          <p className="font-semibold">Den här veckan</p>
          <p className="text-sm text-ink-2">
            {stats.weekActiveDates.length >= WEEK_GOAL ? "Veckomålet nått 🎉" : `Mål: ${WEEK_GOAL} dagar`}
          </p>
        </div>
        <div className="mt-4 grid grid-cols-7 gap-1">
          {Array.from({ length: 7 }).map((_, i) => {
            const date = addDays(ws, i);
            const active = stats.weekActiveDates.includes(date);
            const isToday = date === today;
            return (
              <div key={date} className="flex flex-col items-center gap-2">
                <span className={cn("text-xs font-medium", isToday ? "text-ink" : "text-ink-3")}>{weekdayShort(i)}</span>
                <span
                  className={cn(
                    "aspect-square w-full max-w-9 rounded-full",
                    active ? "bg-lime" : "bg-surface-2",
                    isToday && !active && "ring-2 ring-ink/70 ring-offset-2 ring-offset-surface",
                  )}
                />
              </div>
            );
          })}
        </div>
        <p className="mt-4 text-sm text-ink-2">
          {stats.totalActiveDays} rörelsedagar totalt · {getPhase(d.state.phase).short}: {getPhase(d.state.phase).name}
        </p>
      </section>

      {(profile.why_text || profile.anchor_text) && (
        <section className="rounded-[1.5rem] bg-surface p-5 shadow-card">
          {profile.why_text && (
            <>
              <p className="text-sm font-semibold text-ink-2">Ditt varför</p>
              <p className="mt-1 text-lg leading-relaxed">”{profile.why_text}”</p>
            </>
          )}
          {profile.anchor_text && (
            <p className={cn("text-sm text-ink-2", profile.why_text && "mt-4")}>
              <span className="font-semibold text-ink">Din plan: </span>
              {profile.anchor_text}
            </p>
          )}
          {profile.heavy_day_text && d.checkin?.energy === "low" && (
            <p className="mt-2 text-sm text-ink-2">
              <span className="font-semibold text-ink">Tung dag: </span>
              {profile.heavy_day_text}
            </p>
          )}
        </section>
      )}

      {openChecklist.length > 0 && (
        <Link
          href="/mer/lakare"
          className="flex items-center gap-4 rounded-[1.5rem] bg-surface p-5 shadow-card active:scale-[0.99]"
        >
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-sky text-sky-ink">
            <Stethoscope size={22} />
          </span>
          <span className="flex-1">
            <span className="block font-semibold">Att ta upp med vården</span>
            <span className="line-clamp-2 text-sm text-ink-2">{openChecklist[0].text}</span>
          </span>
          <ArrowRight size={20} className="text-ink-3" />
        </Link>
      )}
    </main>
  );
}

function proposalText(p: ProgramProposal): { title: string; body: string } {
  if (p.kind === "phase_up") {
    const ph = getPhase(p.to_value);
    return {
      title: `Redo för ${ph.short}: ${ph.name}?`,
      body: p.message ?? ph.summary,
    };
  }
  if (p.kind === "phase_down") {
    const ph = getPhase(p.to_value);
    return { title: `Tillbaka till ${ph.short}: ${ph.name}`, body: p.message ?? "Ett steg tillbaka är också ett steg framåt." };
  }
  const ex = p.exercise_key ? getExercise(p.exercise_key) : null;
  const level = ex?.levels[p.to_value - 1];
  return {
    title: ex ? `${ex.name}: ${level?.name ?? `nivå ${p.to_value}`}` : "Ny nivå",
    body: p.message ?? (p.kind === "level_up" ? "Du har klarat övningen fint två pass i rad. Vill du prova nästa nivå?" : "En lättare nivå."),
  };
}

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
