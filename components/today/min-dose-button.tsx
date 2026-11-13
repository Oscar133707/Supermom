"use client";

import { useState, useTransition } from "react";
import { Check, Music } from "lucide-react";
import { logActivity, deleteActivity } from "@/app/(app)/actions";
import { useToast } from "@/components/ui/toast";
import { useCelebrate } from "@/components/app/celebration";
import { cn } from "@/lib/cn";

export function MinDoseButton({ label = "Jag rörde mig till en låt" }: { label?: string }) {
  const [pending, start] = useTransition();
  // Shown the instant she taps, before the server has answered.
  const [saved, setSaved] = useState(false);
  const toast = useToast();
  const celebrate = useCelebrate();
  return (
    <button
      type="button"
      disabled={pending || saved}
      onClick={() => {
        setSaved(true);
        start(async () => {
          const res = await logActivity({ kind: "min_dose", minutes: 3, songs: 1, title: "En låt" }).catch(() => null);
          if (!res?.id) {
            setSaved(false);
            toast("Det gick inte att spara just nu – prova igen om en stund");
            return;
          }
          const { id, celebration } = res;
          toast("En låt – det räknas!", () => deleteActivity(id));
          celebrate(celebration);
          setTimeout(() => setSaved(false), 2500);
        });
      }}
      className="flex min-h-16 w-full items-center gap-4 rounded-3xl bg-surface px-5 py-3 text-left shadow-card transition-transform active:scale-[0.99]"
    >
      <span
        className={cn(
          "flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl transition-colors duration-200",
          saved ? "bg-lime text-lime-ink" : "bg-lime-soft text-accent",
        )}
      >
        {saved ? <Check size={22} strokeWidth={2.6} /> : <Music size={22} />}
      </span>
      <span className="flex-1">
        <span className="block font-semibold">{saved ? "Registrerat – det räknas!" : label}</span>
        <span className="text-sm text-ink-2">Minsta dosen. Ett tryck – räknas fullt ut.</span>
      </span>
    </button>
  );
}
