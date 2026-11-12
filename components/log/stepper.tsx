"use client";

import { Minus, Plus } from "lucide-react";

export function Stepper({
  value,
  onChange,
  step = 1,
  min = 0,
  max = 999,
  unit,
  format,
}: {
  value: number;
  onChange: (v: number) => void;
  step?: number;
  min?: number;
  max?: number;
  unit?: string;
  format?: (v: number) => string;
}) {
  const set = (v: number) => onChange(Math.min(max, Math.max(min, Math.round(v * 100) / 100)));
  return (
    <div className="flex items-center justify-between rounded-2xl bg-surface p-2 shadow-card">
      <button
        type="button"
        onClick={() => set(value - step)}
        disabled={value <= min}
        aria-label="Minska"
        className="flex h-12 w-12 items-center justify-center rounded-xl bg-surface-2 disabled:opacity-30"
      >
        <Minus size={22} />
      </button>
      <div className="tabular text-center">
        <span className="text-3xl font-semibold tracking-tight">{format ? format(value) : value}</span>
        {unit && <span className="ml-1.5 text-base text-ink-2">{unit}</span>}
      </div>
      <button
        type="button"
        onClick={() => set(value + step)}
        disabled={value >= max}
        aria-label="Öka"
        className="flex h-12 w-12 items-center justify-center rounded-xl bg-surface-2 disabled:opacity-30"
      >
        <Plus size={22} />
      </button>
    </div>
  );
}

export function Chips<T extends string | number>({
  options,
  value,
  onChange,
  className = "",
}: {
  options: { value: T; label: string }[];
  value: T | null;
  onChange: (v: T) => void;
  className?: string;
}) {
  return (
    <div className={"flex flex-wrap gap-2 " + className}>
      {options.map((o) => (
        <button
          key={String(o.value)}
          type="button"
          onClick={() => onChange(o.value)}
          aria-pressed={value === o.value}
          className={
            "h-11 min-w-11 rounded-full px-4 text-sm font-semibold transition-colors " +
            (value === o.value ? "bg-ink text-canvas" : "bg-surface text-ink shadow-card")
          }
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
