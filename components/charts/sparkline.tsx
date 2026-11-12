export function Sparkline({ values, width = 120, height = 36 }: { values: number[]; width?: number; height?: number }) {
  if (values.length < 2) return null;
  const lo = Math.min(...values);
  const hi = Math.max(...values);
  const sx = (i: number) => 3 + (i / (values.length - 1)) * (width - 6);
  const sy = (v: number) => 3 + (1 - (v - lo) / Math.max(1, hi - lo)) * (height - 6);
  const d = values.map((v, i) => `${i ? "L" : "M"}${sx(i)},${sy(v)}`).join(" ");
  return (
    <svg width={width} height={height} aria-hidden="true">
      <path d={d} fill="none" stroke="var(--ink)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={sx(values.length - 1)} cy={sy(values[values.length - 1])} r="4" fill="var(--lime)" stroke="var(--ink)" strokeWidth="1.5" />
    </svg>
  );
}
