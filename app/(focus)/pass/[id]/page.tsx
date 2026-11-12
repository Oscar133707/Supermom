import { notFound } from "next/navigation";
import { loadDashboard, requireMom } from "@/lib/data";
import { isDeloadWeek } from "@/lib/program/engine";
import { buildWorkout, WORKOUT_IDS, type WorkoutId } from "@/lib/program/workouts";
import { Player } from "@/components/pass/player";

export const metadata = { title: "Pass · Supermom" };

export default async function PassPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!WORKOUT_IDS.includes(id as WorkoutId)) notFound();
  const { supabase, user } = await requireMom();
  const d = await loadDashboard(user.id);
  const { data: mediaRows } = await supabase.from("exercise_media").select("exercise_key, video_url");
  const media: Record<string, string> = {};
  for (const m of mediaRows ?? []) if (m.video_url) media[m.exercise_key] = m.video_url;

  const workout = buildWorkout(id as WorkoutId, d.state.phase, d.levels, {
    deload: isDeloadWeek(d.state, d.today),
  });

  return (
    <Player
      workout={workout}
      playlists={d.playlists.map((p) => ({ id: p.id, name: p.name, url: p.url }))}
      media={media}
    />
  );
}
