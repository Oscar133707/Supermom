import { getMomProfile, requireAdmin } from "@/lib/data";
import { shortDate } from "@/lib/dates";
import { Card, SectionTitle } from "@/components/ui/card";
import { DeleteMessageButton, MessageComposer } from "@/components/admin/message-composer";
import type { Message, MessageTrigger } from "@/lib/types";

const LABEL: Record<MessageTrigger, string> = {
  now: "Direkt",
  any: "Nästa tillfälle",
  comeback: "Vid comeback",
  milestone: "Vid milstolpe",
  heavy_day: "Tung dag",
};

export default async function MessagesPage() {
  const { supabase } = await requireAdmin();
  const mom = await getMomProfile();
  const { data } = mom
    ? await supabase.from("messages").select("*").eq("to_user", mom.id).order("created_at", { ascending: false }).limit(50)
    : { data: [] };
  const rows = (data ?? []) as Message[];
  const queued = rows.filter((m) => !m.released_at);
  const shown = rows.filter((m) => m.released_at);

  return (
    <main className="flex flex-col gap-6 px-4 pt-2">
      <h1 className="px-1 text-3xl font-semibold tracking-tight">Meddelanden</h1>
      <MessageComposer />
      {queued.length > 0 && (
        <div>
          <SectionTitle>I kön ({queued.length})</SectionTitle>
          <Card className="flex flex-col divide-y divide-line p-0">
            {queued.map((m) => (
              <div key={m.id} className="flex items-start gap-3 py-3.5 pl-5 pr-2">
                <div className="flex-1">
                  <p>{m.body}</p>
                  <p className="mt-1 text-xs text-ink-3">{LABEL[m.trigger]}</p>
                </div>
                <DeleteMessageButton id={m.id} />
              </div>
            ))}
          </Card>
        </div>
      )}
      {shown.length > 0 && (
        <div>
          <SectionTitle>Visade</SectionTitle>
          <Card className="flex flex-col divide-y divide-line p-0">
            {shown.map((m) => (
              <div key={m.id} className="px-5 py-3.5">
                <p className="text-ink-2">{m.body}</p>
                <p className="mt-1 text-xs text-ink-3">
                  Visat {shortDate(m.released_at!.slice(0, 10))}
                  {m.read_at ? " · läst ❤" : ""}
                </p>
              </div>
            ))}
          </Card>
        </div>
      )}
    </main>
  );
}
