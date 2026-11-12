"use client";

import { useState, useTransition } from "react";
import { ExternalLink, Music, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { addPlaylist, deletePlaylist } from "@/app/(app)/actions";

const field = "h-14 w-full rounded-2xl bg-surface px-4 text-base shadow-card outline-none focus:ring-2 focus:ring-accent";

export function Playlists({ items }: { items: { id: string; name: string; url: string }[] }) {
  const [name, setName] = useState("");
  const [url, setUrl] = useState("");
  const [pending, start] = useTransition();
  const toast = useToast();
  return (
    <div className="flex flex-col gap-6">
      {items.length > 0 && (
        <ul className="flex flex-col gap-2">
          {items.map((p) => (
            <li key={p.id} className="flex min-h-16 items-center gap-3 rounded-2xl bg-surface pl-4 pr-1 shadow-card">
              <Music size={20} className="shrink-0 text-accent" />
              <a href={p.url} target="_blank" rel="noopener noreferrer" className="flex flex-1 items-center gap-2 py-3 font-semibold">
                {p.name} <ExternalLink size={14} className="text-ink-3" />
              </a>
              <button
                type="button"
                aria-label={`Ta bort ${p.name}`}
                disabled={pending}
                onClick={() => start(() => deletePlaylist(p.id))}
                className="flex h-12 w-12 items-center justify-center rounded-xl text-ink-3"
              >
                <Trash2 size={18} />
              </button>
            </li>
          ))}
        </ul>
      )}
      <div className="flex flex-col gap-3 rounded-[1.5rem] bg-surface-2 p-4">
        <p className="font-semibold">Lägg till en spellista</p>
        <p className="text-sm text-ink-2">
          I Spotify: öppna spellistan → tryck på ⋯ → Dela → Kopiera länk. Klistra in här.
        </p>
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Namn, t.ex. Promenadpepp" className={field} />
        <input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://open.spotify.com/playlist/…" inputMode="url" className={field} />
        <Button
          disabled={pending || !name.trim() || !url.trim()}
          onClick={() =>
            start(async () => {
              const { ok } = await addPlaylist(name, url);
              if (ok) {
                setName("");
                setUrl("");
                toast("Spellistan är sparad");
              } else toast("Kontrollera länken");
            })
          }
        >
          Spara
        </Button>
      </div>
    </div>
  );
}
