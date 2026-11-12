"use client";

import { useOptimistic, useTransition } from "react";
import { BatteryLow, BatteryMedium, BatteryFull } from "lucide-react";
import { cn } from "@/lib/cn";
import { setEnergy } from "@/app/(app)/actions";
import { useCelebrate } from "@/components/app/celebration";
import type { Energy } from "@/lib/types";

const OPTIONS: { v: Energy; label: string; icon: React.ElementType }[] = [
  { v: "low", label: "Tung dag", icon: BatteryLow },
  { v: "normal", label: "Vanlig dag", icon: BatteryMedium },
  { v: "high", label: "Mycket energi", icon: BatteryFull },
];

export function EnergyPicker({ value }: { value: Energy | null }) {
  const [optimistic, setOptimistic] = useOptimistic(value);
  const [, start] = useTransition();
  const celebrate = useCelebrate();

  const pick = (v: Energy) =>
    start(async () => {
      setOptimistic(v);
      const { message } = await setEnergy(v);
      if (message) celebrate({ comeback: false, milestone: null, message });
    });

  return (
    <div>
      <p className="mb-3 px-1 text-base font-semibold">{optimistic ? "Dagsform" : "Hur känns det idag?"}</p>
      <div className="grid grid-cols-3 gap-2">
        {OPTIONS.map(({ v, label, icon: Icon }) => {
          const on = optimistic === v;
          return (
            <button
              key={v}
              type="button"
              onClick={() => pick(v)}
              aria-pressed={on}
              className={cn(
                "flex h-24 flex-col items-center justify-center gap-2 rounded-3xl text-sm font-semibold transition-all active:scale-[0.97]",
                on ? "bg-ink text-canvas" : optimistic ? "bg-surface text-ink-2 shadow-card" : "bg-surface text-ink shadow-card",
              )}
            >
              <Icon size={26} strokeWidth={1.8} />
              {label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
