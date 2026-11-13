import { notFound } from "next/navigation";
import { DEFAULT_STATE, getAuth, requireMom } from "@/lib/data";
import { stockholmDate } from "@/lib/dates";
import { isDeloadWeek } from "@/lib/program/engine";
import { buildWorkout, WORKOUT_IDS, type WorkoutId } from "@/lib/program/workouts";
import { Player } from "@/components/pass/player";
import type { ProgramState } from "@/lib/types";

export const metadata = { title: "Pass · Supermom" };

export default async function PassPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!WORKOUT_IDS.includes(id as WorkoutId)) notFound();
  const { supabase, user } = await getAuth();
  const today = stockholmDate();

  // Only what the player needs, all in parallel.
  const [, stateRes, levelsRes, playlistsRes, mediaRes] = await Promise.all([
    requireMom(),
    supabase.from("program_state").select("*").eq("user_id", user.id).maybeSingle<ProgramState>(),
    supabase.from("exercise_levels").select("exercise_key, level").eq("user_id", user.id),
    supabase.from("playlists").select("id, name, url").eq("user_id", user.id).order("created_at"),
    supabase.from("exercise_media").select("exercise_key, video_url"),
  ]);

  const state = stateRes.data ?? DEFAULT_STATE(user.id, today);
  const levels: Record<string, number> = {};
  for (const l of levelsRes.data ?? []) levels[l.exercise_key] = l.level;
  const media: Record<string, string> = {};
  for (const m of mediaRes.data ?? []) if (m.video_url) media[m.exercise_key] = m.video_url;

  const workout = buildWorkout(id as WorkoutId, state.phase, levels, {
    deload: isDeloadWeek(state, today),
  });

  return <Player workout={workout} playlists={playlistsRes.data ?? []} media={media} />;
}
