"use client";

import { useMemo, useState } from "react";
import { Segmented } from "@/components/ui/segmented";
import { addDays, shortDate } from "@/lib/dates";
import { trend, type Point } from "@/lib/stats";

const W = 340;
const H = 170;
const PAD = { l: 8, r: 40, t: 12, b: 24 };

export function TrendChart({ points, today, unit = "kg" }: { points: Point[]; today: string; unit?: string }) {
  const [range, setRange] = useState<"30" | "90" | "all">("90");
  const trendAll = useMemo(() => trend(points), [points]);

  const from = range === "all" ? (points[0]?.date ?? today) : addDays(today, -Number(range));
  const pts = points.filter((p) => p.date >= from);
  const tr = trendAll.filter((p) => p.date >= from);

  if (points.length === 0) {
    return <p className="py-8 text-center text-ink-2">Ingen vikt loggad än. En gång i veckan räcker.</p>;
  }

  const xs = [from, today];
  const x0 = new Date(xs[0]).getTime();
  const x1 = Math.max(new Date(xs[1]).getTime(), x0 + 86_400_000);
  const vals = [...pts, ...tr].map((p) => p.value);
  const lo = Math.floor(Math.min(...vals) - 1);
  const hi = Math.ceil(Math.max(...vals) + 1);
  const sx = (d: string) => PAD.l + ((new Date(d).getTime() - x0) / (x1 - x0)) * (W - PAD.l - PAD.r);
  const sy = (v: number) => PAD.t + (1 - (v - lo) / Math.max(1, hi - lo)) * (H - PAD.t - PAD.b);
  const path = tr.map((p, i) => `${i ? "L" : "M"}${sx(p.date).toFixed(1)},${sy(p.value).toFixed(1)}`).join(" ");
  const last = tr[tr.length - 1];

  return (
    <div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label={`Trendlinje för vikt, senast ${last?.value.toFixed(1)} ${unit}`}>
        {[lo, (lo + hi) / 2, hi].map((v) => (
          <g key={v}>
            <line x1={PAD.l} x2={W - PAD.r} y1={sy(v)} y2={sy(v)} stroke="var(--line)" strokeWidth="1" />
            <text x={W - PAD.r + 6} y={sy(v) + 4} fontSize="11" fill="var(--ink-3)" className="tabular">
              {Math.round(v)}
            </text>
          </g>
        ))}
        {pts.map((p) => (
          <circle key={p.date} cx={sx(p.date)} cy={sy(p.value)} r="3" fill="var(--ink-3)" opacity="0.35" />
        ))}
        {tr.length > 1 && <path d={path} fill="none" stroke="var(--ink)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />}
        {last && <circle cx={sx(last.date)} cy={sy(last.value)} r="6" fill="var(--lime)" stroke="var(--ink)" strokeWidth="2" />}
        <text x={PAD.l} y={H - 6} fontSize="11" fill="var(--ink-3)">
          {shortDate(from)}
        </text>
        <text x={W - PAD.r} y={H - 6} fontSize="11" fill="var(--ink-3)" textAnchor="end">
          Idag
        </text>
      </svg>
      <Segmented
        className="mt-3"
        value={range}
        onChange={setRange}
        options={[
          { value: "30", label: "30 d" },
          { value: "90", label: "90 d" },
          { value: "all", label: "Allt" },
        ]}
      />
    </div>
  );
}
