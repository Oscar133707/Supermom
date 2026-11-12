"use client";

import { useState, useTransition } from "react";
import { Sheet } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { advancePhase, phaseBack } from "@/app/(app)/actions";

export function PhaseActions({ criteria, nextName, canGoBack }: { criteria: string[]; nextName: string | null; canGoBack: boolean }) {
  const [open, setOpen] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const toast = useToast();
  return (
    <>
      <div className="mt-4 flex gap-2">
        {nextName && (
          <Button variant="secondary" className="flex-1" onClick={() => { setMsg(null); setOpen(true); }}>
            Redo för nästa steg?
          </Button>
        )}
        {canGoBack && (
          <Button
            variant="ghost"
            className="shrink-0"
            disabled={pending}
            onClick={() => start(async () => { await phaseBack(); toast("Ett steg tillbaka – helt rätt ibland"); })}
          >
            Lättare fas
          </Button>
        )}
      </div>
      <Sheet open={open} onClose={() => setOpen(false)} title={`Vidare till ${nextName ?? ""}?`}>
        <p className="text-ink-2">Gå vidare när du klarar det här – utan smärta som sitter i:</p>
        <ul className="mt-3 space-y-2">
          {criteria.map((c) => (
            <li key={c} className="rounded-2xl bg-surface p-3 shadow-card">{c}</li>
          ))}
        </ul>
        {msg && <p className="mt-4 rounded-2xl bg-surface-2 p-3 text-sm">{msg}</p>}
        <div className="mt-6 flex flex-col gap-3">
          <Button
            size="lg"
            disabled={pending}
            onClick={() =>
              start(async () => {
                const r = await advancePhase();
                if (r.ok) {
                  setOpen(false);
                  toast("Nästa fas – i din takt");
                } else setMsg(r.reason ?? null);
              })
            }
          >
            Ja, jag klarar det
          </Button>
          <Button variant="secondary" size="lg" onClick={() => setOpen(false)}>
            Inte än
          </Button>
        </div>
      </Sheet>
    </>
  );
}
