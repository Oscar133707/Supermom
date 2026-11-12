"use client";

import { AnimatePresence, motion } from "motion/react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { ChevronLeft, HeartPulse } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Chips } from "@/components/log/stepper";
import { LogoMark } from "@/components/brand/logo";
import { completeOnboarding } from "@/app/(app)/actions";
import { cn } from "@/lib/cn";
import type { Lithium } from "@/lib/types";

const WHY_IDEAS = [
  "Jag vill kunna ta på mig hörlurarna och gå ut och springa till min musik.",
  "Jag vill orka mer i vardagen.",
  "Jag vill känna mig stark i min kropp.",
];
const WHEN = [
  "När jag druckit förmiddagskaffet",
  "Efter lunch",
  "När jag kommit hem från affären",
  "Innan kvällens serie",
];
const THEN = ["rör jag mig till en låt", "går jag fem minuter", "gör jag dagens förslag"];
const TIMES = ["09:30", "11:00", "14:00", "17:00"];

const input =
  "w-full rounded-2xl bg-surface px-4 text-base shadow-card outline-none placeholder:text-ink-3 focus:ring-2 focus:ring-accent";

export function Onboarding({ initialName }: { initialName: string }) {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [pending, start] = useTransition();
  const [name, setName] = useState(initialName);
  const [why, setWhy] = useState("");
  const [when, setWhen] = useState<string | null>(null);
  const [then, setThen] = useState<string | null>(THEN[0]);
  const [heavy, setHeavy] = useState("Om jag är trött, då dansar jag till en låt sittande.");
  const [height, setHeight] = useState("160");
  const [weight, setWeight] = useState("");
  const [lithium, setLithium] = useState<Lithium | null>(null);
  const [time, setTime] = useState<string | null>("11:00");

  const steps = 6;
  const next = () => setStep((s) => Math.min(steps - 1, s + 1));
  const back = () => setStep((s) => Math.max(0, s - 1));
  const num = (v: string) => {
    const n = Number(v.replace(",", "."));
    return v.trim() && Number.isFinite(n) && n > 0 ? n : null;
  };

  const finish = () =>
    start(async () => {
      await completeOnboarding({
        display_name: name.trim(),
        why_text: why.trim(),
        anchor_text: when && then ? `${when}, då ${then}.` : "",
        heavy_day_text: heavy.trim(),
        takes_lithium: lithium ?? "unknown",
        height_cm: num(height),
        start_weight_kg: num(weight),
        reminder_time: time,
      });
      router.replace("/");
    });

  return (
    <main className="safe-top safe-bottom mx-auto flex min-h-dvh max-w-md flex-col px-6 pb-8 pt-6">
      <div className="mb-8 flex h-11 items-center gap-3">
        {step > 0 ? (
          <button type="button" onClick={back} aria-label="Tillbaka" className="-ml-2 flex h-11 w-11 items-center justify-center rounded-full">
            <ChevronLeft size={24} />
          </button>
        ) : (
          <LogoMark size={36} />
        )}
        <div className="flex flex-1 gap-1.5" aria-hidden="true">
          {Array.from({ length: steps }).map((_, i) => (
            <span key={i} className={cn("h-1.5 flex-1 rounded-full", i <= step ? "bg-ink" : "bg-surface-3")} />
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -24 }}
          transition={{ duration: 0.22 }}
          className="flex flex-1 flex-col"
        >
          {step === 0 && (
            <Step
              title="Hej! Det här är din app."
              lead="Den är byggd för att hålla länge – inte för att pressa dig. Varje liten rörelse räknas, tunga dagar är helt okej, och du bestämmer alltid takten."
              footer={<Button size="lg" className="w-full" onClick={next}>Kom igång</Button>}
            >
              <label className="flex flex-col gap-2">
                <span className="px-1 text-sm font-medium text-ink-2">Vad vill du kallas?</span>
                <input value={name} onChange={(e) => setName(e.target.value)} className={input + " h-14"} placeholder="Ditt namn" autoComplete="given-name" />
              </label>
            </Step>
          )}

          {step === 1 && (
            <Step
              title="Varför gör du det här?"
              lead="Skriv med dina egna ord. Appen påminner dig om det de dagar det känns tungt."
              footer={<Button size="lg" className="w-full" onClick={next} disabled={!why.trim()}>Fortsätt</Button>}
            >
              <textarea
                value={why}
                onChange={(e) => setWhy(e.target.value)}
                rows={4}
                maxLength={600}
                className={input + " resize-none py-4 text-lg"}
                placeholder="Jag vill…"
              />
              <div className="mt-4 flex flex-col gap-2">
                {WHY_IDEAS.map((w) => (
                  <button key={w} type="button" onClick={() => setWhy(w)} className="rounded-2xl bg-surface-2 px-4 py-3 text-left text-sm text-ink-2">
                    {w}
                  </button>
                ))}
              </div>
            </Step>
          )}

          {step === 2 && (
            <Step
              title="Koppla rörelsen till din dag"
              lead="Vanor fastnar lättast när de hänger ihop med något du redan gör. Klockslaget spelar mindre roll."
              footer={<Button size="lg" className="w-full" onClick={next} disabled={!when}>Fortsätt</Button>}
            >
              <p className="mb-2 px-1 text-sm font-medium text-ink-2">När…</p>
              <div className="flex flex-col gap-2">
                {WHEN.map((w) => (
                  <button
                    key={w}
                    type="button"
                    onClick={() => setWhen(w)}
                    aria-pressed={when === w}
                    className={cn("min-h-12 rounded-2xl px-4 text-left font-medium", when === w ? "bg-ink text-canvas" : "bg-surface shadow-card")}
                  >
                    {w}
                  </button>
                ))}
              </div>
              <p className="mb-2 mt-5 px-1 text-sm font-medium text-ink-2">…då</p>
              <Chips value={then} onChange={setThen} options={THEN.map((t) => ({ value: t, label: t }))} />
              <label className="mt-6 flex flex-col gap-2">
                <span className="px-1 text-sm font-medium text-ink-2">Och en plan för tunga dagar</span>
                <input value={heavy} onChange={(e) => setHeavy(e.target.value)} className={input + " h-14"} />
              </label>
            </Step>
          )}

          {step === 3 && (
            <Step
              title="Lite om dig"
              lead="Så att appen kan anpassa protein, vätska och förslag."
              footer={<Button size="lg" className="w-full" onClick={next} disabled={!lithium}>Fortsätt</Button>}
            >
              <div className="grid grid-cols-2 gap-3">
                <label className="flex flex-col gap-2">
                  <span className="px-1 text-sm font-medium text-ink-2">Längd (cm)</span>
                  <input inputMode="decimal" value={height} onChange={(e) => setHeight(e.target.value)} className={input + " h-14 tabular"} />
                </label>
                <label className="flex flex-col gap-2">
                  <span className="px-1 text-sm font-medium text-ink-2">Vikt idag (valfritt)</span>
                  <input inputMode="decimal" value={weight} onChange={(e) => setWeight(e.target.value)} className={input + " h-14 tabular"} placeholder="kg" />
                </label>
              </div>
              <p className="mb-2 mt-6 px-1 font-semibold">Tar du litium?</p>
              <p className="mb-3 px-1 text-sm text-ink-2">
                Mounjaro kan ge illamående och mindre vätska i kroppen. Med litium behöver det hållas extra koll på – då
                anpassar appen sig.
              </p>
              <Chips
                value={lithium}
                onChange={setLithium}
                options={[
                  { value: "yes", label: "Ja" },
                  { value: "no", label: "Nej" },
                  { value: "unknown", label: "Vet inte" },
                ]}
              />
            </Step>
          )}

          {step === 4 && (
            <Step
              title="Trygg start"
              lead="De första veckorna är medvetet väldigt lätta. Visa gärna planen för din läkare nästa gång – vi har lagt det på din lista."
              footer={<Button size="lg" className="w-full" onClick={next}>Jag förstår</Button>}
            >
              <div className="rounded-3xl bg-surface p-5 shadow-card">
                <div className="flex items-center gap-2 font-semibold">
                  <HeartPulse size={20} className="text-danger" /> Avbryt och ring 1177 (eller 112) om du får
                </div>
                <ul className="mt-3 space-y-2 text-ink-2">
                  <li>• smärta eller tryck över bröstet</li>
                  <li>• yrsel eller känsla av att svimma</li>
                  <li>• ovanlig andnöd som inte går över i vila</li>
                  <li>• hjärtklappning eller oregelbunden puls</li>
                </ul>
              </div>
              <p className="mt-4 px-1 text-sm text-ink-2">
                Träningsvärk som går över på ett par dagar är normalt. Ledvärk som sitter i mer än ett dygn betyder: ta
                ett steg tillbaka.
              </p>
            </Step>
          )}

          {step === 5 && (
            <Step
              title="En mjuk påminnelse?"
              lead="En om dagen, som mest. Aldrig om du redan rört dig, och aldrig på kvällen."
              footer={
                <Button size="lg" className="w-full" onClick={finish} disabled={pending}>
                  {pending ? "Gör i ordning…" : "Klart – visa min dag"}
                </Button>
              }
            >
              <Chips
                value={time}
                onChange={setTime}
                options={[...TIMES.map((t) => ({ value: t, label: t })), { value: "", label: "Ingen" }]}
              />
              <p className="mt-4 px-1 text-sm text-ink-2">Du kan ändra det när som helst under Mer → Påminnelser.</p>
            </Step>
          )}
        </motion.div>
      </AnimatePresence>
    </main>
  );
}

function Step({
  title,
  lead,
  children,
  footer,
}: {
  title: string;
  lead: string;
  children?: React.ReactNode;
  footer: React.ReactNode;
}) {
  return (
    <>
      <h1 className="text-3xl font-semibold tracking-tight">{title}</h1>
      <p className="mb-7 mt-3 text-lg leading-relaxed text-ink-2">{lead}</p>
      <div className="flex-1">{children}</div>
      <div className="pt-8">{footer}</div>
    </>
  );
}
