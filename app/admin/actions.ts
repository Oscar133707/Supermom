"use server";

import { revalidatePath } from "next/cache";
import { getMomProfile, requireAdmin } from "@/lib/data";
import { EXERCISE_BY_KEY } from "@/lib/program/exercises";
import type { MessageTrigger } from "@/lib/types";

const TRIGGERS: MessageTrigger[] = ["now", "any", "comeback", "milestone", "heavy_day"];

export async function sendMessage(body: string, trigger: MessageTrigger) {
  const { supabase, user } = await requireAdmin();
  const mom = await getMomProfile();
  const text = body.trim().slice(0, 600);
  if (!mom || !text || !TRIGGERS.includes(trigger)) return { ok: false };
  const { error } = await supabase.from("messages").insert({ to_user: mom.id, from_user: user.id, body: text, trigger });
  revalidatePath("/admin/meddelanden");
  return { ok: !error };
}

export async function deleteMessage(id: string) {
  const { supabase } = await requireAdmin();
  await supabase.from("messages").delete().eq("id", id);
  revalidatePath("/admin/meddelanden");
}

export async function createProposal(input: {
  kind: "phase_up" | "phase_down" | "level_up" | "level_down";
  exercise_key?: string | null;
  to_value: number;
  message?: string;
}) {
  const { supabase, user } = await requireAdmin();
  const mom = await getMomProfile();
  if (!mom) return { ok: false };
  const isLevel = input.kind === "level_up" || input.kind === "level_down";
  if (isLevel) {
    const ex = input.exercise_key ? EXERCISE_BY_KEY[input.exercise_key] : null;
    if (!ex || input.to_value < 1 || input.to_value > ex.levels.length) return { ok: false };
  } else if (input.to_value < 0 || input.to_value > 4) return { ok: false };
  // Ersätt ev. väntande förslag av samma slag
  let del = supabase.from("program_proposals").delete().eq("user_id", mom.id).eq("status", "pending").eq("kind", input.kind);
  if (isLevel) del = del.eq("exercise_key", input.exercise_key!);
  await del;
  const { error } = await supabase.from("program_proposals").insert({
    user_id: mom.id,
    created_by: user.id,
    kind: input.kind,
    exercise_key: isLevel ? input.exercise_key : null,
    to_value: input.to_value,
    message: input.message?.trim().slice(0, 300) || null,
  });
  revalidatePath("/admin/program");
  return { ok: !error };
}

export async function deleteProposal(id: string) {
  const { supabase } = await requireAdmin();
  await supabase.from("program_proposals").delete().eq("id", id).eq("status", "pending");
  revalidatePath("/admin/program");
}

export async function setVideo(exerciseKey: string, url: string) {
  const { supabase } = await requireAdmin();
  if (!EXERCISE_BY_KEY[exerciseKey]) return { ok: false };
  const u = url.trim();
  if (!u) {
    await supabase.from("exercise_media").delete().eq("exercise_key", exerciseKey);
  } else {
    if (!/^https:\/\//i.test(u)) return { ok: false };
    await supabase.from("exercise_media").upsert({ exercise_key: exerciseKey, video_url: u, updated_at: new Date().toISOString() });
  }
  revalidatePath("/admin/ovningar");
  return { ok: true };
}
