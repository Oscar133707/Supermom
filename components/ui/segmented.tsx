"use client";

import { cn } from "@/lib/cn";

export function Segmented<T extends string>({
  options,
  value,
  onChange,
  className,
}: {
  options: { value: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
  className?: string;
}) {
  return (
    <div className={cn("flex rounded-full bg-surface-2 p-1", className)} role="radiogroup">
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          role="radio"
          aria-checked={value === o.value}
          onClick={() => onChange(o.value)}
          className={cn(
            "h-11 flex-1 rounded-full text-sm font-semibold transition-colors",
            value === o.value ? "bg-surface text-ink shadow-card" : "text-ink-2",
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
