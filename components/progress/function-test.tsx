"use client";

import { useEffect, useState, useTransition } from "react";
import { Timer } from "lucide-react";
import { Sheet } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Stepper } from "@/components/log/stepper";
import { useToast } from "@/components/ui/toast";
import { addFunctionTest } from "@/app/(app)/actions";
import { beep, chime, unlockAudio } from "@/components/pass/audio";

export const TESTS = {
  chair_stand_30s: {
    label: "Uppresningar på 30 sekunder",
    unit: "st",
    how: "Sitt på en stabil stol med armarna i kors. Res dig och sätt dig så många gånger du orkar på 30 sekunder. Använd händerna om du behöver – gör likadant varje gång.",
    timer: 30,
    initial: 5,
  },
  walk_minutes: {
    label: "Minuter promenad i ett svep",
    unit: "min",
    how: "Hur många minuter kan du gå i lugnt tempo utan att behöva stanna?",
    timer: 0,
    initial: 5,
  },
  bike_minutes: {
    label: "Minuter cykel i ett svep",
    unit: "min",
    how: "Hur många minuter kan du cykla i lätt tempo (du kan prata) utan paus?",
    timer: 0,
    initial: 5,
  },
  wall_pushups: {
    label: "Armhävningar mot vägg",
    unit: "st",
    how: "Hur många kan du göra i rad med god form, en armlängd från väggen?",
    timer: 0,
    initial: 5,
  },
} as const;

export type TestKey = keyof typeof TESTS;

export function FunctionTestButton({ testKey, last }: { testKey: TestKey; last: number | null }) {
  const t = TESTS[testKey];
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState<number>(last ?? t.initial);
  const [endAt, setEndAt] = useState<number | null>(null);
  const [now, setNow] = useState(0);
  const [pending, start] = useTransition();
  const toast = useToast();

  useEffect(() => {
    if (!endAt) return;
    const id = setInterval(() => {
      const n = Date.now();
      setNow(n);
      const left = Math.ceil((endAt - n) / 1000);
      if (left <= 3 && left > 0) beep(660, 80);
      if (n >= endAt) {
        chime();
        setEndAt(null);
      }
    }, 1000);
    return () => clearInterval(id);
  }, [endAt]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="h-10 shrink-0 rounded-full bg-surface-2 px-4 text-sm font-semibold"
      >
        Testa
      </button>
      <Sheet open={open} onClose={() => setOpen(false)} title={t.label}>
        <p className="text-ink-2">{t.how}</p>
        {t.timer > 0 && (
          <Button
            variant="dark"
            size="lg"
            className="mt-5 w-full"
            onClick={() => {
              unlockAudio();
              setNow(Date.now());
              setEndAt(Date.now() + t.timer * 1000);
              beep(880, 100);
            }}
            disabled={endAt !== null}
          >
            <Timer size={20} />
            {endAt ? `${Math.max(0, Math.ceil((endAt - now) / 1000))} s` : `Starta ${t.timer} s`}
          </Button>
        )}
        <p className="mb-2 mt-6 px-1 text-sm font-medium text-ink-2">Ditt resultat</p>
        <Stepper value={value} onChange={setValue} min={0} max={300} unit={t.unit} />
        <Button
          size="lg"
          className="mt-5 w-full"
          disabled={pending}
          onClick={() =>
            start(async () => {
              await addFunctionTest(testKey, value);
              setOpen(false);
              toast("Sparat – jämför om 4–6 veckor");
            })
          }
        >
          Spara
        </Button>
      </Sheet>
    </>
  );
}
