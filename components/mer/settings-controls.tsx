"use client";

import { useState, useTransition } from "react";
import { Segmented } from "@/components/ui/segmented";
import { Button } from "@/components/ui/button";
import { setPause, setTheme } from "@/app/(app)/actions";
import type { Theme } from "@/lib/types";

export function ThemeControl({ value }: { value: Theme }) {
  const [v, setV] = useState<Theme>(value);
  const [, start] = useTransition();
  return (
    <Segmented
      value={v}
      onChange={(t) => {
        setV(t);
        if (t === "system") document.documentElement.removeAttribute("data-theme");
        else document.documentElement.setAttribute("data-theme", t);
        start(() => setTheme(t));
      }}
      options={[
        { value: "light", label: "Ljust" },
        { value: "dark", label: "Mörkt" },
        { value: "system", label: "Auto" },
      ]}
    />
  );
}

export function PauseControl({ pausedUntil }: { pausedUntil: string | null }) {
  const [pending, start] = useTransition();
  if (pausedUntil)
    return (
      <Button variant="secondary" className="w-full" disabled={pending} onClick={() => start(() => setPause(null))}>
        Avsluta pausen
      </Button>
    );
  return (
    <div className="flex gap-2">
      {[3, 7, 14].map((d) => (
        <Button key={d} variant="secondary" className="flex-1" disabled={pending} onClick={() => start(() => setPause(d))}>
          {d} dagar
        </Button>
      ))}
    </div>
  );
}
