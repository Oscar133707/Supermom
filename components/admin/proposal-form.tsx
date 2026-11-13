"use client";

import { useState, useTransition } from "react";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { createProposal, deleteProposal } from "@/app/admin/actions";
import { EXERCISES } from "@/lib/program/exercises";
import { PHASES } from "@/lib/program/phases";

export function PhaseProposal({ phase }: { phase: number }) {
  const [msg, setMsg] = useState("");
  const [pending, start] = useTransition();
  const toast = useToast();
  const propose = (to: number) =>
    start(async () => {
      const { ok } = await createProposal({ kind: to > phase ? "phase_up" : "phase_down", to_value: to, message: msg });
      if (ok) {
        setMsg("");
        toast("Förslaget visas för henne – hon väljer själv");
      }
    });
  return (
    <div className="flex flex-col gap-3">
      <input
        value={msg}
        onChange={(e) => setMsg(e.target.value)}
        placeholder="Valfri hälsning, t.ex. ”Du har varit så stark!”"
        // 16 px text: smaller makes iPhone zoom in when the field is tapped.
        className="h-12 w-full rounded-2xl bg-surface-2 px-4 text-base outline-none focus:ring-2 focus:ring-accent"
      />
      {/* Stacked: long phase names ("Styrka & löpförberedelse") never get squeezed. */}
      <div className="flex flex-col gap-2">
        {phase < PHASES.length - 1 && (
          <Button className="h-auto min-h-14 py-3 text-center" disabled={pending} onClick={() => propose(phase + 1)}>
            Föreslå {PHASES[phase + 1].name}
          </Button>
        )}
        {phase > 0 && (
          <Button variant="secondary" disabled={pending} onClick={() => propose(phase - 1)}>
            Föreslå lättare fas
          </Button>
        )}
      </div>
    </div>
  );
}

export function LevelProposal({ levels }: { levels: Record<string, number> }) {
  const [pending, start] = useTransition();
  const toast = useToast();
  return (
    <div className="flex flex-col divide-y divide-line">
      {EXERCISES.map((ex) => {
        const cur = levels[ex.key] ?? 1;
        return (
          <div key={ex.key} className="flex items-center gap-3 py-3">
            <div className="min-w-0 flex-1">
              <p className="font-medium">{ex.name}</p>
              <p className="truncate text-xs text-ink-2">
                Nivå {cur}/{ex.levels.length}: {ex.levels[cur - 1]?.name}
              </p>
            </div>
            <button
              type="button"
              disabled={pending || cur <= 1}
              onClick={() =>
                start(async () => {
                  await createProposal({ kind: "level_down", exercise_key: ex.key, to_value: cur - 1 });
                  toast("Förslag skickat");
                })
              }
              className="h-11 w-11 shrink-0 rounded-xl bg-surface-2 text-lg font-semibold disabled:opacity-30"
              aria-label={`Föreslå lättare ${ex.name}`}
            >
              −
            </button>
            <button
              type="button"
              disabled={pending || cur >= ex.levels.length}
              onClick={() =>
                start(async () => {
                  await createProposal({ kind: "level_up", exercise_key: ex.key, to_value: cur + 1 });
                  toast("Förslag skickat");
                })
              }
              className="h-11 w-11 shrink-0 rounded-xl bg-surface-2 text-lg font-semibold disabled:opacity-30"
              aria-label={`Föreslå svårare ${ex.name}`}
            >
              +
            </button>
          </div>
        );
      })}
    </div>
  );
}

export function DeleteProposalButton({ id }: { id: string }) {
  const [pending, start] = useTransition();
  return (
    <button
      type="button"
      aria-label="Dra tillbaka"
      disabled={pending}
      onClick={() => start(() => deleteProposal(id))}
      className="flex h-10 w-10 items-center justify-center rounded-xl text-ink-3"
    >
      <Trash2 size={16} />
    </button>
  );
}
