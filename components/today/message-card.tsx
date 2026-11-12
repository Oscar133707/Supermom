"use client";

import { useTransition } from "react";
import { Heart } from "lucide-react";
import { markMessageRead } from "@/app/(app)/actions";

export function MessageCard({ id, body }: { id: string; body: string }) {
  const [pending, start] = useTransition();
  return (
    <div className="rounded-[1.5rem] bg-lime-soft p-5">
      <div className="flex items-center gap-2 text-sm font-semibold text-accent">
        <Heart size={16} fill="currentColor" /> Från Oscar
      </div>
      <p className="mt-2 text-lg leading-relaxed">{body}</p>
      <button
        type="button"
        disabled={pending}
        onClick={() => start(() => markMessageRead(id))}
        className="mt-3 h-11 rounded-full bg-surface px-5 text-sm font-semibold shadow-card"
      >
        Tack ❤
      </button>
    </div>
  );
}
