"use client";

import { useOptimistic, useState, useTransition } from "react";
import { Check, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";
import { addChecklistItem, deleteChecklistItem, toggleChecklist } from "@/app/(app)/actions";

type Item = { id: string; text: string; done: boolean; custom: boolean };
type Change = { type: "toggle"; id: string; done: boolean } | { type: "delete"; id: string };

export function Checklist({ items }: { items: Item[] }) {
  const [text, setText] = useState("");
  const [pending, start] = useTransition();
  // Ticks and deletions show instantly; the server confirms in the background.
  const [shown, apply] = useOptimistic(items, (list: Item[], c: Change) =>
    c.type === "delete" ? list.filter((i) => i.id !== c.id) : list.map((i) => (i.id === c.id ? { ...i, done: c.done } : i)),
  );
  return (
    <div className="flex flex-col gap-5">
      <ul className="flex flex-col gap-2">
        {shown.map((i) => (
          <li key={i.id} className="flex items-start gap-3 rounded-2xl bg-surface p-4 shadow-card">
            <button
              type="button"
              aria-label={i.done ? "Markera som inte klar" : "Markera som klar"}
              aria-pressed={i.done}
              onClick={() =>
                start(async () => {
                  apply({ type: "toggle", id: i.id, done: !i.done });
                  await toggleChecklist(i.id, !i.done);
                })
              }
              className={cn(
                "flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 transition-colors duration-150",
                i.done ? "border-lime bg-lime text-lime-ink" : "border-ink-3",
              )}
            >
              {i.done && <Check size={16} strokeWidth={3} />}
            </button>
            <span className={cn("flex-1 pt-1", i.done && "text-ink-3 line-through")}>{i.text}</span>
            {i.custom && (
              <button
                type="button"
                aria-label="Ta bort"
                onClick={() =>
                  start(async () => {
                    apply({ type: "delete", id: i.id });
                    await deleteChecklistItem(i.id);
                  })
                }
                className="-mr-1 flex h-9 w-9 items-center justify-center text-ink-3"
              >
                <Trash2 size={16} />
              </button>
            )}
          </li>
        ))}
      </ul>
      <div className="flex gap-2">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Lägg till en fråga…"
          className="h-14 flex-1 rounded-2xl bg-surface px-4 shadow-card outline-none focus:ring-2 focus:ring-accent"
        />
        <Button
          disabled={pending || !text.trim()}
          onClick={() =>
            start(async () => {
              await addChecklistItem(text);
              setText("");
            })
          }
        >
          Lägg till
        </Button>
      </div>
    </div>
  );
}
