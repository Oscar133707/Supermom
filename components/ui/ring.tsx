import { cn } from "@/lib/cn";

/** Aktivitetsring. value/goal kan överstiga 1 – ringen fylls då helt. */
export function Ring({
  value,
  goal,
  size = 64,
  stroke = 8,
  className,
  trackClass = "stroke-surface-3",
  barClass = "stroke-lime",
  children,
  label,
}: {
  value: number;
  goal: number;
  size?: number;
  stroke?: number;
  className?: string;
  trackClass?: string;
  barClass?: string;
  children?: React.ReactNode;
  label?: string;
}) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const pct = goal > 0 ? Math.min(1, Math.max(0, value / goal)) : 0;
  return (
    <div
      className={cn("relative inline-flex items-center justify-center", className)}
      style={{ width: size, height: size }}
      role="img"
      aria-label={label ?? `${Math.round(value)} av ${goal}`}
    >
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" strokeWidth={stroke} className={trackClass} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          strokeWidth={stroke}
          strokeLinecap="round"
          className={cn(barClass, "transition-[stroke-dashoffset] duration-700 ease-out")}
          strokeDasharray={c}
          strokeDashoffset={c * (1 - pct)}
          style={{ opacity: pct === 0 ? 0 : 1 }}
        />
      </svg>
      {children && <div className="absolute inset-0 flex items-center justify-center">{children}</div>}
    </div>
  );
}
