"use client";

import { useState, useTransition } from "react";
import { useToast } from "@/components/ui/toast";
import { setVideo } from "@/app/admin/actions";

export function VideoField({ exKey, name, initial }: { exKey: string; name: string; initial: string }) {
  const [url, setUrl] = useState(initial);
  const [pending, start] = useTransition();
  const toast = useToast();
  const dirty = url.trim() !== initial;
  return (
    <div className="py-3">
      <p className="mb-1.5 font-medium">{name}</p>
      <div className="flex gap-2">
        <input
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://www.youtube.com/watch?v=…"
          inputMode="url"
          className="h-11 min-w-0 flex-1 rounded-xl bg-surface-2 px-3 text-sm outline-none focus:ring-2 focus:ring-accent"
        />
        <button
          type="button"
          disabled={pending || !dirty}
          onClick={() =>
            start(async () => {
              const { ok } = await setVideo(exKey, url);
              toast(ok ? "Sparat" : "Länken måste börja med https://");
            })
          }
          className="h-11 rounded-xl bg-ink px-4 text-sm font-semibold text-canvas disabled:opacity-30"
        >
          Spara
        </button>
      </div>
    </div>
  );
}
