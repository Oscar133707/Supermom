"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { requireMom } from "@/lib/data";
import { addDays, daysBetween, stockholmDate } from "@/lib/dates";
import { DOSES, RED_FLAGS, SITES } from "@/lib/health";
import { suggestLevelUp } from "@/lib/program/progression";
import type { ActivityKind, Energy, InjectionSite, Lithium, Message, Theme, WorkoutExerciseLog } from "@/lib/types";

const MILESTONES = [1, 3, 7, 10, 15, 20, 30, 40, 50, 75, 100, 150, 200, 250, 300, 365, 500];

function done(paths: string[] = ["/"]) {
  for (const p of paths) revalidatePath(p);
}

function clampInt(v: unknown, min: number, max: number): number | null {
  const n = Number(v);
  if (!Number.isFinite(n)) return null;
  return Math.min(max, Math.max(min, Math.round(n)));
}

// ─── Energy / diary ─────────────────────────────────────────────────────────
export async function setEnergy(energy: Energy) {
  const { supabase, user } = await requireMom();
  const today = stockholmDate();
  await supabase.from("daily_checkins").upsert({ user_id: user.id, date: today, energy, updated_at: new Date().toISOString() });
  let message: Message | null = null;
  if (energy === "low") {
    const { data } = await supabase.rpc("release_message", { p_trigger: "heavy_day" });
    message = (data as Message[] | null)?.[0] ?? null;
  }
  done();
  return { message };
}

export async function saveDiary(input: { mood: number | null; sleep_hours: number | null; meds_taken: boolean | null; note: string | null }) {
  const { supabase, user } = await requireMom();
  const today = stockholmDate();
  await supabase.from("daily_checkins").upsert({
    user_id: user.id,
    date: today,
    mood: input.mood === null ? null : clampInt(input.mood, -3, 3),
    sleep_hours: input.sleep_hours === null ? null : Math.min(24, Math.max(0, Number(input.sleep_hours))),
    meds_taken: input.meds_taken,
    note: input.note?.slice(0, 2000) || null,
    updated_at: new Date().toISOString(),
  });
  done(["/", "/framsteg"]);
}

// ─── Activities ─────────────────────────────────────────────────────────────
export interface Celebration {
  comeback: boolean;
  milestone: number | null;
  message: Message | null;
}

export async function logActivity(input: {
  kind: ActivityKind;
  title?: string | null;
  minutes?: number;
  songs?: number;
  outdoor?: boolean;
  feel_before?: number | null;
  feel_after?: number | null;
  effort?: number | null;
  workout?: WorkoutExerciseLog[] | null;
}): Promise<{ id: string | null; celebration: Celebration }> {
  const { supabase, user } = await requireMom();
  const today = stockholmDate();

  // State before insert, for comeback/milestone detection.
  const [todayRes, lastRes, totalsRes] = await Promise.all([
    supabase.from("activities").select("id").eq("user_id", user.id).eq("date", today).limit(1),
    supabase
      .from("activities")
      .select("date")
      .eq("user_id", user.id)
      .lt("date", today)
      .order("date", { ascending: false })
      .limit(1),
    supabase.from("activity_summary").select("active_days, first_date").eq("user_id", user.id).maybeSingle(),
  ]);
  const firstToday = (todayRes.data ?? []).length === 0;
  const lastBefore = (lastRes.data?.[0]?.date as string | undefined) ?? null;
  const priorActiveDays = (totalsRes.data?.active_days as number | undefined) ?? 0;
  const firstEver = (totalsRes.data?.first_date as string | undefined) ?? today;

  const { data, error } = await supabase
    .from("activities")
    .insert({
      user_id: user.id,
      date: today,
      kind: input.kind,
      title: input.title?.slice(0, 80) ?? null,
      minutes: clampInt(input.minutes ?? 0, 0, 600) ?? 0,
      songs: clampInt(input.songs ?? 0, 0, 200) ?? 0,
      outdoor: !!input.outdoor,
      feel_before: input.feel_before == null ? null : clampInt(input.feel_before, 1, 5),
      feel_after: input.feel_after == null ? null : clampInt(input.feel_after, 1, 5),
      effort: input.effort == null ? null : clampInt(input.effort, 0, 10),
      workout: input.workout ?? null,
    })
    .select("id")
    .single();

  const celebration: Celebration = { comeback: false, milestone: null, message: null };
  if (error || !data) return { id: null, celebration };

  if (firstToday) {
    const activeDays = priorActiveDays + 1;
    if (lastBefore && daysBetween(lastBefore, today) >= 3) celebration.comeback = true;
    if (MILESTONES.includes(activeDays)) celebration.milestone = activeDays;

    const trigger = celebration.comeback
      ? "comeback"
      : celebration.milestone
        ? "milestone"
        : daysBetween(firstEver, today) >= 10 && daysBetween(firstEver, today) <= 14
          ? "any" // förstärkning runt dag 10–14, hennes vanliga avhoppspunkt
          : null;
    if (trigger) {
      const { data: m } = await supabase.rpc("release_message", { p_trigger: trigger });
      celebration.message = (m as Message[] | null)?.[0] ?? null;
    }
  }

  if (input.kind === "strength" && input.workout?.length) {
    await maybeProposeLevelUp(user.id, data.id, input.workout);
  }

  done(["/", "/framsteg"]);
  return { id: data.id, celebration };
}

async function maybeProposeLevelUp(userId: string, activityId: string, current: WorkoutExerciseLog[]) {
  const { supabase } = await requireMom();
  const today = stockholmDate();
  const [stateRes, levelsRes, prevRes, pendingRes] = await Promise.all([
    supabase.from("program_state").select("phase, last_increase_on").eq("user_id", userId).maybeSingle(),
    supabase.from("exercise_levels").select("exercise_key, level").eq("user_id", userId),
    supabase
      .from("activities")
      .select("workout")
      .eq("user_id", userId)
      .eq("kind", "strength")
      .neq("id", activityId)
      .not("workout", "is", null)
      .order("created_at", { ascending: false })
      .limit(8),
    supabase.from("program_proposals").select("id").eq("user_id", userId).eq("status", "pending").limit(1),
  ]);
  if ((pendingRes.data ?? []).length) return;
  const lastInc = stateRes.data?.last_increase_on;
  if (lastInc && daysBetween(lastInc, today) < 14) return; // högst en ökning per 14 dagar
  const levels: Record<string, number> = {};
  for (const l of levelsRes.data ?? []) levels[l.exercise_key] = l.level;
  const s = suggestLevelUp({
    phase: stateRes.data?.phase ?? 0,
    levels,
    current,
    previous: (prevRes.data ?? []).map((r) => r.workout as WorkoutExerciseLog[]),
  });
  if (!s) return;
  await supabase.from("program_proposals").insert({ user_id: userId, created_by: null, kind: "level_up", exercise_key: s.key, to_value: s.to });
}

export async function deleteActivity(id: string) {
  const { supabase, user } = await requireMom();
  await supabase.from("activities").delete().eq("id", id).eq("user_id", user.id);
  done(["/", "/framsteg"]);
}

// ─── Protein & water ────────────────────────────────────────────────────────
export async function addIntake(kind: "protein" | "water", amount: number, label?: string) {
  const { supabase, user } = await requireMom();
  const a = Number(amount);
  if (!Number.isFinite(a) || a <= 0 || a > 500) return { id: null };
  const { data } = await supabase
    .from("intake_logs")
    .insert({ user_id: user.id, date: stockholmDate(), kind, amount: a, label: label?.slice(0, 60) ?? null })
    .select("id")
    .single();
  done();
  return { id: data?.id ?? null };
}

export async function deleteIntake(id: string) {
  const { supabase, user } = await requireMom();
  await supabase.from("intake_logs").delete().eq("id", id).eq("user_id", user.id);
  done();
}

// ─── Mounjaro ───────────────────────────────────────────────────────────────

export async function addInjection(input: { date: string; dose_mg: number; site: InjectionSite | null; note?: string }) {
  const { supabase, user } = await requireMom();
  if (!DOSES.includes(Number(input.dose_mg))) return { id: null };
  const today = stockholmDate();
  const date = /^\d{4}-\d{2}-\d{2}$/.test(input.date) && input.date <= today && input.date >= addDays(today, -30) ? input.date : today;
  const { data } = await supabase
    .from("injections")
    .insert({
      user_id: user.id,
      date,
      dose_mg: Number(input.dose_mg),
      site: input.site && SITES.includes(input.site) ? input.site : null,
      note: input.note?.slice(0, 300) || null,
    })
    .select("id")
    .single();
  done(["/", "/mer/spruta"]);
  return { id: data?.id ?? null };
}

export async function deleteInjection(id: string) {
  const { supabase, user } = await requireMom();
  await supabase.from("injections").delete().eq("id", id).eq("user_id", user.id);
  done(["/", "/mer/spruta"]);
}

// ─── Symptoms ───────────────────────────────────────────────────────────────

export async function saveSymptoms(input: {
  nausea: number;
  vomiting: number;
  diarrhea: number;
  constipation: number;
  red_flags: string[];
}) {
  const { supabase, user } = await requireMom();
  const allowed = new Set<string>(RED_FLAGS.map((r) => r.key));
  await supabase.from("symptoms").upsert({
    user_id: user.id,
    date: stockholmDate(),
    nausea: clampInt(input.nausea, 0, 3) ?? 0,
    vomiting: clampInt(input.vomiting, 0, 3) ?? 0,
    diarrhea: clampInt(input.diarrhea, 0, 3) ?? 0,
    constipation: clampInt(input.constipation, 0, 3) ?? 0,
    red_flags: input.red_flags.filter((f) => allowed.has(f)),
    updated_at: new Date().toISOString(),
  });
  done();
}

// ─── Body ───────────────────────────────────────────────────────────────────
const BODY_FIELDS = ["weight_kg", "waist_cm", "hips_cm", "chest_cm", "upper_arm_cm", "thigh_cm", "calf_cm"] as const;
export type BodyField = (typeof BODY_FIELDS)[number];

export async function saveBody(values: Partial<Record<BodyField, number | null>>) {
  const { supabase, user } = await requireMom();
  const row: Record<string, unknown> = { user_id: user.id, date: stockholmDate(), updated_at: new Date().toISOString() };
  let any = false;
  for (const f of BODY_FIELDS) {
    const v = values[f];
    if (v != null && Number.isFinite(Number(v)) && Number(v) > 0) {
      row[f] = Math.round(Number(v) * 10) / 10;
      any = true;
    }
  }
  if (!any) return { ok: false };
  const { error } = await supabase.from("body_metrics").upsert(row);
  done(["/", "/framsteg"]);
  return { ok: !error };
}

export async function addFunctionTest(test_key: string, value: number) {
  const { supabase, user } = await requireMom();
  if (!["chair_stand_30s", "walk_minutes", "bike_minutes", "wall_pushups"].includes(test_key)) return;
  const v = Number(value);
  if (!Number.isFinite(v) || v < 0 || v > 1000) return;
  await supabase.from("function_tests").insert({ user_id: user.id, date: stockholmDate(), test_key, value: v });
  done(["/framsteg"]);
}

// ─── Messages & proposals ───────────────────────────────────────────────────
export async function markMessageRead(id: string) {
  const { supabase } = await requireMom();
  await supabase.rpc("mark_message_read", { p_id: id });
  done();
}

export async function decideProposal(id: string, accept: boolean) {
  const { supabase, user } = await requireMom();
  const { data: p } = await supabase
    .from("program_proposals")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .eq("status", "pending")
    .maybeSingle();
  if (!p) return;
  await supabase
    .from("program_proposals")
    .update({ status: accept ? "accepted" : "declined", decided_at: new Date().toISOString() })
    .eq("id", id);
  if (accept) await applyProposal(user.id, p.kind, p.exercise_key, p.to_value);
  done(["/", "/framsteg", "/mer/program"]);
}

async function applyProposal(userId: string, kind: string, exerciseKey: string | null, toValue: number) {
  const { supabase } = await requireMom();
  const today = stockholmDate();
  if (kind === "phase_up" || kind === "phase_down") {
    await supabase.from("program_state").upsert({
      user_id: userId,
      phase: Math.min(4, Math.max(0, toValue)),
      phase_started_on: today,
      ...(kind === "phase_up" ? { last_increase_on: today } : {}),
      updated_at: new Date().toISOString(),
    });
  } else if (exerciseKey) {
    await supabase.from("exercise_levels").upsert({
      user_id: userId,
      exercise_key: exerciseKey,
      level: Math.min(10, Math.max(1, toValue)),
      updated_at: new Date().toISOString(),
    });
    if (kind === "level_up") {
      await supabase.from("program_state").update({ last_increase_on: today }).eq("user_id", userId);
    }
  }
}

/** Lättare nivå gäller direkt – det kräver inget godkännande. */
export async function setLevelEasier(exerciseKey: string, level: number) {
  const { supabase, user } = await requireMom();
  await supabase.from("exercise_levels").upsert({
    user_id: user.id,
    exercise_key: exerciseKey,
    level: Math.min(10, Math.max(1, Math.round(level))),
    updated_at: new Date().toISOString(),
  });
  done(["/", "/mer/program"]);
}

// ─── Profile & settings ─────────────────────────────────────────────────────
export async function updateProfile(input: {
  display_name?: string;
  why_text?: string;
  anchor_text?: string;
  heavy_day_text?: string;
  takes_lithium?: Lithium;
  height_cm?: number | null;
  start_weight_kg?: number | null;
  protein_goal_g?: number;
  water_goal_glasses?: number;
  paused_until?: string | null;
}) {
  const { supabase, user } = await requireMom({ allowUnonboarded: true });
  const row: Record<string, unknown> = {};
  if (input.display_name !== undefined) row.display_name = input.display_name.slice(0, 40) || null;
  if (input.why_text !== undefined) row.why_text = input.why_text.slice(0, 600) || null;
  if (input.anchor_text !== undefined) row.anchor_text = input.anchor_text.slice(0, 200) || null;
  if (input.heavy_day_text !== undefined) row.heavy_day_text = input.heavy_day_text.slice(0, 200) || null;
  if (input.takes_lithium !== undefined && ["yes", "no", "unknown"].includes(input.takes_lithium))
    row.takes_lithium = input.takes_lithium;
  if (input.height_cm !== undefined) row.height_cm = input.height_cm;
  if (input.start_weight_kg !== undefined) row.start_weight_kg = input.start_weight_kg;
  if (input.protein_goal_g !== undefined) row.protein_goal_g = clampInt(input.protein_goal_g, 30, 250);
  if (input.water_goal_glasses !== undefined) row.water_goal_glasses = clampInt(input.water_goal_glasses, 2, 20);
  if (input.paused_until !== undefined) row.paused_until = input.paused_until;
  const { error } = await supabase.from("profiles").update(row).eq("id", user.id);
  if (input.takes_lithium === "yes") await ensureLithiumChecklist(user.id);
  done(["/", "/mer", "/mer/varfor"]);
  return { ok: !error };
}

async function ensureLithiumChecklist(userId: string) {
  const { supabase } = await requireMom({ allowUnonboarded: true });
  await supabase.from("checklist_items").upsert(
    [
      {
        user_id: userId,
        key: "lithium_test",
        text: "Fråga om litiumprov när du börjar med Mounjaro och efter varje dosökning.",
      },
    ],
    { onConflict: "user_id,key", ignoreDuplicates: true },
  );
}

export async function setTheme(theme: Theme) {
  const { supabase, user } = await requireMom();
  await supabase.from("profiles").update({ theme }).eq("id", user.id);
  const jar = await cookies();
  if (theme === "system") jar.delete("sm-theme");
  else jar.set("sm-theme", theme, { path: "/", maxAge: 60 * 60 * 24 * 365, sameSite: "lax" });
  done(["/mer"]);
}

export async function setPause(days: number | null) {
  const { supabase, user } = await requireMom();
  const until = days ? addDays(stockholmDate(), days) : null;
  await supabase.from("profiles").update({ paused_until: until }).eq("id", user.id);
  done(["/", "/mer"]);
}

// ─── Checklist ──────────────────────────────────────────────────────────────
export async function toggleChecklist(id: string, isDone: boolean) {
  const { supabase, user } = await requireMom();
  await supabase
    .from("checklist_items")
    .update({ done_at: isDone ? new Date().toISOString() : null })
    .eq("id", id)
    .eq("user_id", user.id);
  done(["/", "/mer/lakare"]);
}

export async function addChecklistItem(text: string) {
  const { supabase, user } = await requireMom();
  const t = text.trim().slice(0, 200);
  if (!t) return;
  await supabase.from("checklist_items").insert({ user_id: user.id, text: t });
  done(["/mer/lakare"]);
}

export async function deleteChecklistItem(id: string) {
  const { supabase, user } = await requireMom();
  await supabase.from("checklist_items").delete().eq("id", id).eq("user_id", user.id);
  done(["/mer/lakare"]);
}

// ─── Playlists ──────────────────────────────────────────────────────────────
export async function addPlaylist(name: string, url: string) {
  const { supabase, user } = await requireMom({ allowUnonboarded: true });
  const n = name.trim().slice(0, 80);
  let u = url.trim();
  if (!/^https:\/\//i.test(u)) u = "https://" + u.replace(/^\/+/, "");
  try {
    new URL(u);
  } catch {
    return { ok: false };
  }
  if (!n) return { ok: false };
  const { error } = await supabase.from("playlists").insert({ user_id: user.id, name: n, url: u });
  done(["/", "/mer/musik"]);
  return { ok: !error };
}

export async function deletePlaylist(id: string) {
  const { supabase, user } = await requireMom();
  await supabase.from("playlists").delete().eq("id", id).eq("user_id", user.id);
  done(["/", "/mer/musik"]);
}

// ─── Onboarding ─────────────────────────────────────────────────────────────
export async function completeOnboarding(input: {
  display_name: string;
  why_text: string;
  anchor_text: string;
  heavy_day_text: string;
  takes_lithium: Lithium;
  height_cm: number | null;
  start_weight_kg: number | null;
  reminder_time: string | null;
}) {
  const { supabase, user } = await requireMom({ allowUnonboarded: true });
  const today = stockholmDate();
  await supabase
    .from("profiles")
    .update({
      display_name: input.display_name.slice(0, 40) || null,
      why_text: input.why_text.slice(0, 600) || null,
      anchor_text: input.anchor_text.slice(0, 200) || null,
      heavy_day_text: input.heavy_day_text.slice(0, 200) || null,
      takes_lithium: input.takes_lithium,
      height_cm: input.height_cm,
      start_weight_kg: input.start_weight_kg,
      onboarded_at: new Date().toISOString(),
    })
    .eq("id", user.id);

  await supabase
    .from("program_state")
    .upsert({ user_id: user.id, phase: 0, phase_started_on: today }, { onConflict: "user_id", ignoreDuplicates: true });

  const items = [
    { user_id: user.id, key: "doctor_training", text: "Visa läkaren din träningsplan och fråga om något behöver anpassas." },
    { user_id: user.id, key: "doctor_labs", text: "Fråga om D-vitamin, B12 och om ett multivitamin passar dig." },
  ];
  if (input.takes_lithium !== "no")
    items.push({
      user_id: user.id,
      key: "lithium_test",
      text:
        input.takes_lithium === "yes"
          ? "Fråga om litiumprov när du börjar med Mounjaro och efter varje dosökning."
          : "Ta reda på om någon av dina mediciner är litium – i så fall behövs extra provtagning med Mounjaro.",
    });
  await supabase.from("checklist_items").upsert(items, { onConflict: "user_id,key", ignoreDuplicates: true });

  if (input.reminder_time && /^\d{2}:\d{2}$/.test(input.reminder_time)) {
    await supabase
      .from("reminders")
      .upsert({ user_id: user.id, kind: "move", time_local: input.reminder_time, enabled: true });
  }

  if (input.start_weight_kg) {
    await supabase.from("body_metrics").upsert({ user_id: user.id, date: today, weight_kg: input.start_weight_kg });
  }

  done(["/"]);
}

// ─── Her own decision to move to the next phase ─────────────────────────────
// Skydd mot för snabb upptrappning (bipolär hänsyn): minst 14 dagar i fasen
// och minst 14 dagar sedan senaste ökningen.
export async function advancePhase(): Promise<{ ok: boolean; reason?: string }> {
  const { supabase, user } = await requireMom();
  const today = stockholmDate();
  const { data: st } = await supabase.from("program_state").select("*").eq("user_id", user.id).maybeSingle();
  const phase = st?.phase ?? 0;
  if (phase >= 4) return { ok: false, reason: "Du är redan i sista fasen." };
  const startedOn = st?.phase_started_on ?? today;
  if (daysBetween(startedOn, today) < 14)
    return { ok: false, reason: "Ge kroppen minst två veckor i varje fas – det är så styrkan byggs." };
  if (st?.last_increase_on && daysBetween(st.last_increase_on, today) < 14)
    return { ok: false, reason: "Du ökade nyligen. Vänta lite till – jämnhet slår tempo." };
  await supabase.from("program_state").upsert({
    user_id: user.id,
    phase: phase + 1,
    phase_started_on: today,
    last_increase_on: today,
    updated_at: new Date().toISOString(),
  });
  done(["/", "/framsteg"]);
  return { ok: true };
}

/** Ett steg tillbaka gäller direkt – alltid tillåtet. */
export async function phaseBack() {
  const { supabase, user } = await requireMom();
  const { data: st } = await supabase.from("program_state").select("phase").eq("user_id", user.id).maybeSingle();
  const phase = st?.phase ?? 0;
  if (phase <= 0) return;
  await supabase.from("program_state").upsert({
    user_id: user.id,
    phase: phase - 1,
    phase_started_on: stockholmDate(),
    updated_at: new Date().toISOString(),
  });
  done(["/", "/framsteg"]);
}

// ─── Push & reminders ───────────────────────────────────────────────────────
export async function savePushSubscription(sub: { endpoint: string; keys: { p256dh: string; auth: string } }) {
  const { supabase, user } = await requireMom();
  if (!sub?.endpoint?.startsWith("https://") || !sub.keys?.p256dh || !sub.keys?.auth) return { ok: false };
  await supabase.from("push_subscriptions").delete().eq("endpoint", sub.endpoint);
  const { error } = await supabase
    .from("push_subscriptions")
    .insert({ user_id: user.id, endpoint: sub.endpoint, p256dh: sub.keys.p256dh, auth: sub.keys.auth });
  return { ok: !error };
}

export async function deletePushSubscription(endpoint: string) {
  const { supabase, user } = await requireMom();
  await supabase.from("push_subscriptions").delete().eq("endpoint", endpoint).eq("user_id", user.id);
}

export async function saveReminder(kind: "move" | "nutrition", time: string, enabled: boolean) {
  const { supabase, user } = await requireMom();
  if (!/^\d{2}:\d{2}$/.test(time)) return;
  const [h] = time.split(":").map(Number);
  if (h < 9 || h >= 21) return; // tysta timmar 21–09
  await supabase.from("reminders").upsert({ user_id: user.id, kind, time_local: time, enabled });
  done(["/mer/paminnelser"]);
}
