import { requireMom } from "@/lib/data";
import { SubHeader } from "@/components/mer/sub-header";
import { Checklist } from "@/components/mer/checklist";
import { Card } from "@/components/ui/card";
import type { ChecklistItem } from "@/lib/types";

export default async function DoctorPage() {
  const { supabase, user, profile } = await requireMom();
  const { data } = await supabase.from("checklist_items").select("*").eq("user_id", user.id).order("created_at");
  const items = ((data ?? []) as ChecklistItem[]).map((i) => ({ id: i.id, text: i.text, done: !!i.done_at, custom: !i.key }));
  return (
    <main className="flex flex-col gap-6 px-4 pt-4">
      <SubHeader title="Att ta upp med vården" lead="Ta fram listan nästa gång du träffar din läkare eller sköterska." />
      <Checklist items={items} />
      <Card>
        <p className="font-semibold">Bra frågor att ställa</p>
        <ul className="mt-2 space-y-2 text-sm text-ink-2">
          <li>• Passar träningsplanen mig – finns det något jag ska undvika?</li>
          <li>• Hur mycket protein och vätska ska jag sikta på?</li>
          <li>• Påverkar Mounjaro någon av mina andra mediciner?</li>
          {profile.takes_lithium !== "no" && <li>• Behöver mitt litiumvärde kontrolleras oftare nu?</li>}
          <li>• Vad gör jag om magen krånglar mycket efter en dosökning?</li>
        </ul>
      </Card>
    </main>
  );
}
