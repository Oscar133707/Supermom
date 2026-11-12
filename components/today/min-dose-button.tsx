"use client";

import { useTransition } from "react";
import { Music } from "lucide-react";
import { logActivity, deleteActivity } from "@/app/(app)/actions";
import { useToast } from "@/components/ui/toast";
import { useCelebrate } from "@/components/app/celebration";

export function MinDoseButton({ label = "Jag rörde mig till en låt" }: { label?: string }) {
  const [pending, start] = useTransition();
  const toast = useToast();
  const celebrate = useCelebrate();
  return (
    <button
      type="button"
      disabled={pending}
      onClick={() =>
        start(async () => {
          const { id, celebration } = await logActivity({ kind: "min_dose", minutes: 3, songs: 1, title: "En låt" });
          toast("En låt – det räknas!", id ? () => deleteActivity(id) : undefined);
          celebrate(celebration);
        })
      }
      className="flex min-h-16 w-full items-center gap-4 rounded-3xl bg-surface px-5 py-3 text-left shadow-card transition-transform active:scale-[0.99] disabled:opacity-60"
    >
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-lime-soft text-accent">
        <Music size={22} />
      </span>
      <span className="flex-1">
        <span className="block font-semibold">{label}</span>
        <span className="text-sm text-ink-2">Minsta dosen. Ett tryck – räknas fullt ut.</span>
      </span>
    </button>
  );
}
