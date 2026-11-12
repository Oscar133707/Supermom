import { requireMom } from "@/lib/data";
import { SubHeader } from "@/components/mer/sub-header";
import { PushSettings } from "@/components/mer/push-settings";
import type { Reminder } from "@/lib/types";

export default async function RemindersPage() {
  const { supabase, user } = await requireMom();
  const { data } = await supabase.from("reminders").select("*").eq("user_id", user.id);
  const reminders = ((data ?? []) as Reminder[]).map((r) => ({ kind: r.kind, time: r.time_local.slice(0, 5), enabled: r.enabled }));
  return (
    <main className="flex flex-col gap-6 px-4 pt-4">
      <SubHeader title="Påminnelser" lead="Välj en tid som hänger ihop med din vardag – t.ex. efter förmiddagskaffet." />
      <PushSettings reminders={reminders} />
    </main>
  );
}
