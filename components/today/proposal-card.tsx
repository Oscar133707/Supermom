"use client";

import { useTransition } from "react";
import { Sparkles } from "lucide-react";
import { decideProposal } from "@/app/(app)/actions";
import { Button } from "@/components/ui/button";

export function ProposalCard({ id, title, body, from }: { id: string; title: string; body: string; from: string }) {
  const [pending, start] = useTransition();
  return (
    <div className="rounded-[1.5rem] bg-surface p-5 shadow-card">
      <div className="flex items-center gap-2 text-sm font-semibold text-ink-2">
        <Sparkles size={16} /> {from}
      </div>
      <p className="mt-2 text-lg font-semibold">{title}</p>
      <p className="mt-1 text-ink-2">{body}</p>
      <div className="mt-4 flex gap-2">
        <Button className="flex-1" disabled={pending} onClick={() => start(() => decideProposal(id, true))}>
          Ja, gärna
        </Button>
        <Button variant="secondary" className="flex-1" disabled={pending} onClick={() => start(() => decideProposal(id, false))}>
          Inte än
        </Button>
      </div>
      <p className="mt-3 text-xs text-ink-3">Du bestämmer. ”Inte än” är alltid ett bra svar.</p>
    </div>
  );
}
