import { requireAdmin } from "@/lib/data";
import { EXERCISES } from "@/lib/program/exercises";
import { Card } from "@/components/ui/card";
import { VideoField } from "@/components/admin/video-form";

export default async function AdminExercisesPage() {
  const { supabase } = await requireAdmin();
  const { data } = await supabase.from("exercise_media").select("exercise_key, video_url");
  const media = Object.fromEntries((data ?? []).map((m) => [m.exercise_key, m.video_url ?? ""]));
  return (
    <main className="flex flex-col gap-6 px-4 pt-2">
      <header className="px-1">
        <h1 className="text-3xl font-semibold tracking-tight">Övningar</h1>
        <p className="mt-2 text-ink-2">
          Lägg in en videolänk per övning (t.ex. YouTube). Välj gärna videor där personen gör en sittande/stödd variant och
          inga hopp. Länken visas som ”Se video” i passläget.
        </p>
      </header>
      <Card className="flex flex-col divide-y divide-line py-1">
        {EXERCISES.map((e) => (
          <VideoField key={e.key} exKey={e.key} name={e.name} initial={media[e.key] ?? ""} />
        ))}
      </Card>
    </main>
  );
}
