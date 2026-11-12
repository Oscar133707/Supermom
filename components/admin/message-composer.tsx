"use client";

import { useState, useTransition } from "react";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Chips } from "@/components/log/stepper";
import { useToast } from "@/components/ui/toast";
import { deleteMessage, sendMessage } from "@/app/admin/actions";
import type { MessageTrigger } from "@/lib/types";

const TRIGGER_LABEL: Record<MessageTrigger, string> = {
  now: "Visa direkt",
  any: "Nästa lämpliga tillfälle",
  comeback: "När hon kommer tillbaka",
  milestone: "Vid en milstolpe",
  heavy_day: "På en tung dag",
};

const IDEAS = [
  "Jag är så stolt över dig – oavsett hur dagen ser ut.",
  "Välkommen tillbaka! Allt du gjort finns kvar. ❤",
  "Tänker på dig idag. En låt räcker.",
  "Du gör det här för dig själv, och det märks.",
];

export function MessageComposer() {
  const [body, setBody] = useState("");
  const [trigger, setTrigger] = useState<MessageTrigger>("any");
  const [pending, start] = useTransition();
  const toast = useToast();
  return (
    <div className="flex flex-col gap-4">
      <textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        rows={3}
        maxLength={600}
        placeholder="Skriv något varmt…"
        className="w-full resize-none rounded-2xl bg-surface p-4 text-base shadow-card outline-none focus:ring-2 focus:ring-accent"
      />
      <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4">
        {IDEAS.map((i) => (
          <button key={i} type="button" onClick={() => setBody(i)} className="shrink-0 rounded-full bg-surface-2 px-4 py-2 text-sm text-ink-2">
            {i.length > 34 ? i.slice(0, 32) + "…" : i}
          </button>
        ))}
      </div>
      <div>
        <p className="mb-2 px-1 text-sm font-medium text-ink-2">När ska det visas?</p>
        <Chips
          value={trigger}
          onChange={setTrigger}
          options={(Object.keys(TRIGGER_LABEL) as MessageTrigger[]).map((t) => ({ value: t, label: TRIGGER_LABEL[t] }))}
        />
      </div>
      <Button
        size="lg"
        disabled={pending || !body.trim()}
        onClick={() =>
          start(async () => {
            const { ok } = await sendMessage(body, trigger);
            if (ok) {
              setBody("");
              toast(trigger === "now" ? "Skickat" : "Lagt i kön");
            }
          })
        }
      >
        {trigger === "now" ? "Skicka nu" : "Lägg i kön"}
      </Button>
      <p className="px-1 text-xs text-ink-3">
        Högst två meddelanden per vecka släpps automatiskt, vid tillfällen då de gör mest nytta. Stötta hennes egna val
        (”Jag är stolt över dig”) hellre än att kontrollera (”Har du tränat idag?”).
      </p>
    </div>
  );
}

export function DeleteMessageButton({ id }: { id: string }) {
  const [pending, start] = useTransition();
  return (
    <button
      type="button"
      aria-label="Ta bort"
      disabled={pending}
      onClick={() => start(() => deleteMessage(id))}
      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-ink-3"
    >
      <Trash2 size={16} />
    </button>
  );
}

export { TRIGGER_LABEL };
