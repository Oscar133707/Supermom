"use client";

import { useState, useTransition } from "react";
import { ChevronDown, Video } from "lucide-react";
import { BodyMap } from "@/components/pass/body-map";
import { getExercise, ZONE_LABEL } from "@/lib/program/exercises";
import { setLevelEasier } from "@/app/(app)/actions";
import { useToast } from "@/components/ui/toast";
import { cn } from "@/lib/cn";

export function ExerciseRow({ exKey, level, locked, video }: { exKey: string; level: number; locked: boolean; video?: string }) {
  const ex = getExercise(exKey);
  const [open, setOpen] = useState(false);
  const [pending, start] = useTransition();
  const toast = useToast();
  return (
    <div className={cn("px-5 py-4", locked && "opacity-60")}>
      <button type="button" onClick={() => setOpen(!open)} className="flex w-full items-center gap-3 text-left" aria-expanded={open}>
        <span className="flex-1">
          <span className="block font-semibold">{ex.name}</span>
          <span className="text-sm text-ink-2">
            {locked ? "Kommer i en senare fas" : `Nivå ${level}: ${ex.levels[level - 1]?.name}`} · {ex.zones.map((z) => ZONE_LABEL[z]).join(", ")}
          </span>
        </span>
        <ChevronDown size={20} className={cn("shrink-0 text-ink-3 transition-transform", open && "rotate-180")} />
      </button>
      {open && (
        <div className="mt-4 flex gap-4">
          <ol className="flex-1 space-y-2 text-sm text-ink-2">
            {ex.steps.map((s, i) => (
              <li key={i}>
                {i + 1}. {s}
              </li>
            ))}
            <li className="pt-1 text-xs text-ink-3">Utrustning: {ex.equipment.join(", ")}</li>
            {video && (
              <li>
                <a href={video} target="_blank" rel="noopener noreferrer" className="inline-flex h-10 items-center gap-1.5 font-semibold text-accent">
                  <Video size={16} /> Se video
                </a>
              </li>
            )}
            {!locked && level > 1 && (
              <li>
                <button
                  type="button"
                  disabled={pending}
                  onClick={() =>
                    start(async () => {
                      await setLevelEasier(exKey, level - 1);
                      toast("Lättare nivå sparad");
                    })
                  }
                  className="mt-1 h-10 rounded-full bg-surface-2 px-4 text-sm font-semibold text-ink"
                >
                  Gör lättare
                </button>
              </li>
            )}
          </ol>
          <BodyMap zones={ex.zones} size={38} />
        </div>
      )}
    </div>
  );
}
