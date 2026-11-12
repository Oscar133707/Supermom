import { requireMom } from "@/lib/data";
import { addDays, stockholmDate } from "@/lib/dates";
import { TabBar } from "@/components/app/tab-bar";
import { ToastProvider } from "@/components/ui/toast";
import { CelebrationProvider } from "@/components/app/celebration";
import { LogSheetProvider, type LogSummary } from "@/components/log/log-sheet";
import type { InjectionSite } from "@/lib/types";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const { supabase, user, profile } = await requireMom();
  const today = stockholmDate();

  const [intake, lastInj, diary, symptoms] = await Promise.all([
    supabase.from("intake_logs").select("kind, amount").eq("user_id", user.id).eq("date", today),
    supabase
      .from("injections")
      .select("dose_mg, site")
      .eq("user_id", user.id)
      .order("date", { ascending: false })
      .order("created_at", { ascending: false })
      .limit(1),
    supabase.from("daily_checkins").select("mood, sleep_hours, meds_taken, note").eq("user_id", user.id).eq("date", today).maybeSingle(),
    supabase
      .from("symptoms")
      .select("nausea, vomiting, diarrhea, constipation, red_flags")
      .eq("user_id", user.id)
      .eq("date", today)
      .maybeSingle(),
  ]);

  const sum = (k: string) =>
    (intake.data ?? []).filter((r) => r.kind === k).reduce((s, r) => s + Number(r.amount), 0);
  const inj = lastInj.data?.[0];

  const summary: LogSummary = {
    today,
    yesterday: addDays(today, -1),
    proteinToday: sum("protein"),
    waterToday: sum("water"),
    proteinGoal: profile.protein_goal_g,
    waterGoal: profile.water_goal_glasses,
    lithium: profile.takes_lithium,
    lastInjection: inj ? { dose_mg: Number(inj.dose_mg), site: inj.site as InjectionSite | null } : null,
    diary: diary.data ?? null,
    symptoms: symptoms.data ?? null,
  };

  return (
    <ToastProvider>
      <CelebrationProvider>
        <LogSheetProvider summary={summary}>
          <div className="safe-top mx-auto min-h-dvh max-w-lg pb-32">{children}</div>
          <TabBar />
        </LogSheetProvider>
      </CelebrationProvider>
    </ToastProvider>
  );
}
