import { requireMom } from "@/lib/data";
import { SubHeader } from "@/components/mer/sub-header";
import { Playlists } from "@/components/mer/playlists";
import type { Playlist } from "@/lib/types";

export default async function MusicPage() {
  const { supabase, user } = await requireMom();
  const { data } = await supabase.from("playlists").select("*").eq("user_id", user.id).order("created_at");
  return (
    <main className="flex flex-col gap-6 px-4 pt-4">
      <SubHeader
        title="Mina spellistor"
        lead="Musik gör rörelse roligare och känns lättare. Tips: ha en spellista som du bara lyssnar på när du rör dig."
      />
      <Playlists items={((data ?? []) as Playlist[]).map((p) => ({ id: p.id, name: p.name, url: p.url }))} />
    </main>
  );
}
