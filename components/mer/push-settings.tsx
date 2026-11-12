"use client";

import { useEffect, useState, useTransition } from "react";
import { Bell, BellOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Chips } from "@/components/log/stepper";
import { useToast } from "@/components/ui/toast";
import { deletePushSubscription, savePushSubscription, saveReminder } from "@/app/(app)/actions";

const TIMES = ["09:30", "10:30", "11:30", "13:00", "14:30", "16:00", "17:30", "19:00"];

function b64ToUint8(base64: string) {
  const pad = "=".repeat((4 - (base64.length % 4)) % 4);
  const raw = atob((base64 + pad).replace(/-/g, "+").replace(/_/g, "/"));
  return Uint8Array.from([...raw].map((c) => c.charCodeAt(0)));
}

type State = "loading" | "unsupported" | "denied" | "off" | "on";

export function PushSettings({
  reminders,
}: {
  reminders: { kind: "move" | "nutrition"; time: string; enabled: boolean }[];
}) {
  const [state, setState] = useState<State>("loading");
  const [pending, start] = useTransition();
  const toast = useToast();
  const move = reminders.find((r) => r.kind === "move");
  const food = reminders.find((r) => r.kind === "nutrition");
  const [moveTime, setMoveTime] = useState(move?.time ?? "11:30");
  const [moveOn, setMoveOn] = useState(move?.enabled ?? true);
  const [foodTime, setFoodTime] = useState(food?.time ?? "14:30");
  const [foodOn, setFoodOn] = useState(food?.enabled ?? false);
  const vapid = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;

  useEffect(() => {
    (async () => {
      if (!("serviceWorker" in navigator) || !("PushManager" in window) || !vapid) return setState("unsupported");
      if (Notification.permission === "denied") return setState("denied");
      const reg = await navigator.serviceWorker.getRegistration();
      const sub = await reg?.pushManager.getSubscription();
      setState(sub ? "on" : "off");
    })();
  }, [vapid]);

  const enable = () =>
    start(async () => {
      try {
        const perm = await Notification.requestPermission();
        if (perm !== "granted") return setState(perm === "denied" ? "denied" : "off");
        const reg = (await navigator.serviceWorker.getRegistration()) ?? (await navigator.serviceWorker.register("/sw.js"));
        await navigator.serviceWorker.ready;
        const sub = await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: b64ToUint8(vapid!) });
        const json = sub.toJSON() as { endpoint: string; keys: { p256dh: string; auth: string } };
        const { ok } = await savePushSubscription(json);
        setState(ok ? "on" : "off");
        await saveReminder("move", moveTime, moveOn);
        await saveReminder("nutrition", foodTime, foodOn);
        toast("Påminnelser är på");
      } catch {
        toast("Det gick inte att slå på notiser");
      }
    });

  const disable = () =>
    start(async () => {
      const reg = await navigator.serviceWorker.getRegistration();
      const sub = await reg?.pushManager.getSubscription();
      if (sub) {
        await deletePushSubscription(sub.endpoint);
        await sub.unsubscribe();
      }
      setState("off");
      toast("Notiser avstängda");
    });

  const saveTimes = () =>
    start(async () => {
      await saveReminder("move", moveTime, moveOn);
      await saveReminder("nutrition", foodTime, foodOn);
      toast("Sparat");
    });

  return (
    <div className="flex flex-col gap-6">
      <div className="rounded-[1.5rem] bg-surface p-5 shadow-card">
        {state === "on" ? (
          <div className="flex items-center gap-3">
            <Bell size={22} className="text-accent" />
            <p className="flex-1 font-semibold">Notiser är på</p>
            <Button variant="secondary" size="sm" disabled={pending} onClick={disable}>
              Stäng av
            </Button>
          </div>
        ) : state === "unsupported" ? (
          <p className="text-ink-2">
            Notiser fungerar när appen är installerad på hemskärmen. Öppna Supermom i Chrome → menyn ⋮ → ”Lägg till på
            startskärmen”, och öppna sedan appen därifrån.
          </p>
        ) : state === "denied" ? (
          <div className="flex gap-3">
            <BellOff size={22} className="shrink-0 text-ink-2" />
            <p className="text-ink-2">
              Notiser är blockerade. Öppna telefonens Inställningar → Appar → Supermom (eller Chrome) → Aviseringar och
              tillåt dem.
            </p>
          </div>
        ) : (
          <>
            <p className="font-semibold">Mjuka påminnelser</p>
            <p className="mt-1 text-sm text-ink-2">
              Högst två om dagen, aldrig efter 21. Har du redan rört dig skickas ingen påminnelse.
            </p>
            <Button className="mt-4 w-full" disabled={pending || state === "loading"} onClick={enable}>
              <Bell size={18} /> Slå på påminnelser
            </Button>
          </>
        )}
      </div>

      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between px-1">
          <p className="font-semibold">Dagens rörelse</p>
          <Toggle on={moveOn} onChange={setMoveOn} label="Påminnelse om rörelse" />
        </div>
        {moveOn && <Chips value={moveTime} onChange={setMoveTime} options={TIMES.map((t) => ({ value: t, label: t }))} />}
      </div>

      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between px-1">
          <p className="font-semibold">Protein & vatten</p>
          <Toggle on={foodOn} onChange={setFoodOn} label="Påminnelse om protein och vatten" />
        </div>
        {foodOn && <Chips value={foodTime} onChange={setFoodTime} options={TIMES.map((t) => ({ value: t, label: t }))} />}
      </div>

      <Button variant="secondary" size="lg" disabled={pending} onClick={saveTimes}>
        Spara tider
      </Button>
    </div>
  );
}

function Toggle({ on, onChange, label }: { on: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      aria-label={label}
      onClick={() => onChange(!on)}
      className={"relative h-8 w-14 rounded-full transition-colors " + (on ? "bg-lime" : "bg-surface-3")}
    >
      <span
        className={
          "absolute top-1 h-6 w-6 rounded-full bg-white shadow transition-transform " + (on ? "translate-x-7" : "translate-x-1")
        }
      />
    </button>
  );
}
