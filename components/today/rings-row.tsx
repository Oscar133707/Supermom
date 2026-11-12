"use client";

import { Ring } from "@/components/ui/ring";
import { useLogSheet } from "@/components/log/log-context";

export function RingsRow({
  weekDays,
  weekGoal,
  protein,
  proteinGoal,
  water,
  waterGoal,
}: {
  weekDays: number;
  weekGoal: number;
  protein: number;
  proteinGoal: number;
  water: number;
  waterGoal: number;
}) {
  const { open } = useLogSheet();
  const cell = "flex flex-1 flex-col items-center gap-2 rounded-3xl bg-surface py-4 shadow-card active:scale-[0.98] transition-transform";
  return (
    <div className="flex gap-2.5">
      <button type="button" className={cell} onClick={() => open("move")} aria-label={`Veckan: ${weekDays} av ${weekGoal} rörelsedagar`}>
        <Ring value={weekDays} goal={weekGoal} size={68} stroke={9}>
          <span className="tabular text-lg font-semibold">{weekDays}</span>
        </Ring>
        <span className="text-xs font-semibold text-ink-2">Veckan {weekDays}/{weekGoal}</span>
      </button>
      <button type="button" className={cell} onClick={() => open("protein")} aria-label={`Protein: ${Math.round(protein)} av ${proteinGoal} gram`}>
        <Ring value={protein} goal={proteinGoal} size={68} stroke={9} barClass="stroke-[#f08a4b]">
          <span className="tabular text-base font-semibold">{Math.round(protein)}</span>
        </Ring>
        <span className="text-xs font-semibold text-ink-2">Protein (g)</span>
      </button>
      <button type="button" className={cell} onClick={() => open("water")} aria-label={`Vatten: ${water} av ${waterGoal} glas`}>
        <Ring value={water} goal={waterGoal} size={68} stroke={9} barClass="stroke-[#4a9be8]">
          <span className="tabular text-lg font-semibold">{water}</span>
        </Ring>
        <span className="text-xs font-semibold text-ink-2">Vatten (glas)</span>
      </button>
    </div>
  );
}
