"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Chips, Stepper } from "@/components/log/stepper";
import { useToast } from "@/components/ui/toast";
import { updateProfile } from "@/app/(app)/actions";
import type { Lithium } from "@/lib/types";

const field = "w-full rounded-2xl bg-surface p-4 text-base shadow-card outline-none focus:ring-2 focus:ring-accent";

export function WhyForm(p: {
  why: string;
  anchor: string;
  heavy: string;
  lithium: Lithium;
  proteinGoal: number;
  waterGoal: number;
  name: string;
}) {
  const [name, setName] = useState(p.name);
  const [why, setWhy] = useState(p.why);
  const [anchor, setAnchor] = useState(p.anchor);
  const [heavy, setHeavy] = useState(p.heavy);
  const [lithium, setLithium] = useState<Lithium>(p.lithium);
  const [protein, setProtein] = useState(p.proteinGoal);
  const [water, setWater] = useState(p.waterGoal);
  const [pending, start] = useTransition();
  const toast = useToast();

  return (
    <div className="flex flex-col gap-5">
      <label className="flex flex-col gap-2">
        <span className="px-1 text-sm font-medium text-ink-2">Namn</span>
        <input value={name} onChange={(e) => setName(e.target.value)} className={field + " h-14"} />
      </label>
      <label className="flex flex-col gap-2">
        <span className="px-1 text-sm font-medium text-ink-2">Mitt varför</span>
        <textarea value={why} onChange={(e) => setWhy(e.target.value)} rows={4} maxLength={600} className={field + " resize-none text-lg"} />
      </label>
      <label className="flex flex-col gap-2">
        <span className="px-1 text-sm font-medium text-ink-2">Min plan (”När …, då …”)</span>
        <textarea value={anchor} onChange={(e) => setAnchor(e.target.value)} rows={2} maxLength={200} className={field + " resize-none"} />
      </label>
      <label className="flex flex-col gap-2">
        <span className="px-1 text-sm font-medium text-ink-2">Plan för tunga dagar</span>
        <textarea value={heavy} onChange={(e) => setHeavy(e.target.value)} rows={2} maxLength={200} className={field + " resize-none"} />
      </label>
      <div>
        <p className="mb-2 px-1 text-sm font-medium text-ink-2">Tar du litium?</p>
        <Chips
          value={lithium}
          onChange={setLithium}
          options={[
            { value: "yes", label: "Ja" },
            { value: "no", label: "Nej" },
            { value: "unknown", label: "Vet inte" },
          ]}
        />
      </div>
      <div>
        <p className="mb-2 px-1 text-sm font-medium text-ink-2">Proteinmål per dag</p>
        <Stepper value={protein} onChange={setProtein} step={5} min={60} max={150} unit="g" />
        <p className="mt-2 px-1 text-xs text-ink-3">Förslaget 90 g bygger på forskningen. Ändra bara i samråd med vården.</p>
      </div>
      <div>
        <p className="mb-2 px-1 text-sm font-medium text-ink-2">Vatten per dag</p>
        <Stepper value={water} onChange={setWater} min={4} max={16} unit="glas" />
      </div>
      <Button
        size="lg"
        disabled={pending}
        onClick={() =>
          start(async () => {
            await updateProfile({
              display_name: name.trim(),
              why_text: why.trim(),
              anchor_text: anchor.trim(),
              heavy_day_text: heavy.trim(),
              takes_lithium: lithium,
              protein_goal_g: protein,
              water_goal_glasses: water,
            });
            toast("Sparat");
          })
        }
      >
        Spara
      </Button>
    </div>
  );
}
