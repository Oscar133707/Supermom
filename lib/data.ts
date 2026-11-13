import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { addDays, stockholmDate } from "@/lib/dates";
import type { ActivityTotals } from "@/lib/program/engine";
import type {
  Activity,
  ChecklistItem,
  DailyCheckin,
  Injection,
  IntakeLog,
  Message,
  Playlist,
  Profile,
  ProgramProposal,
  ProgramState,
  Symptoms,
} from "@/lib/types";

/**
 * Who is signed in. getClaims() verifies the JWT locally (asymmetric signing
 * key, cached JWKS) instead of calling Supabase Auth — saves a network round
 * trip on every page render and server action.
 */
export const getAuth = cache(async () => {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const sub = data?.claims?.sub;
  if (!sub) redirect("/login");
  return { supabase, user: { id: sub } };
});

export const getSession = cache(async () => {
  const { supabase, user } = await getAuth();
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single<Profile>();
  if (!profile) redirect("/login");
  return { supabase, user, profile };
});

/** Mom-only pages. Admin is sent to /admin, unfinished onboarding to /valkommen. */
export async function requireMom(opts: { allowUnonboarded?: boolean } = {}) {
  const s = await getSession();
  if (s.profile.role === "admin") redirect("/admin");
  if (!opts.allowUnonboarded && !s.profile.onboarded_at) redirect("/valkommen");
  return s;
}

export async function requireAdmin() {
  const s = await getSession();
  if (s.profile.role !== "admin") redirect("/");
  return s;
}

/** The single mom account (admin view). */
export async function getMomProfile(): Promise<Profile | null> {
  const { supabase } = await requireAdmin();
  const { data } = await supabase.from("profiles").select("*").eq("role", "mom").order("created_at").limit(1);
  return (data?.[0] as Profile) ?? null;
}

export const DEFAULT_STATE = (userId: string, today: string): ProgramState => ({
  user_id: userId,
  phase: 0,
  phase_started_on: today,
  last_increase_on: null,
  last_deload_on: null,
});

/** Everything the Idag-screen (and admin overview) needs for one user. */
export async function loadDashboard(userId: string) {
  const { supabase } = await getAuth();
  const today = stockholmDate();
  const since = addDays(today, -90);

  const [
    stateRes,
    levelsRes,
    activitiesRes,
    checkinRes,
    symptomsRes,
    injectionsRes,
    intakeRes,
    messagesRes,
    proposalsRes,
    playlistsRes,
    checklistRes,
    totalsRes,
  ] = await Promise.all([
    supabase.from("program_state").select("*").eq("user_id", userId).maybeSingle<ProgramState>(),
    supabase.from("exercise_levels").select("exercise_key, level").eq("user_id", userId),
    supabase
      .from("activities")
      .select("id, date, kind, minutes, songs, title, feel_before, feel_after, outdoor, created_at")
      .eq("user_id", userId)
      .gte("date", since)
      .order("created_at", { ascending: false }),
    supabase.from("daily_checkins").select("*").eq("user_id", userId).eq("date", today).maybeSingle<DailyCheckin>(),
    supabase.from("symptoms").select("*").eq("user_id", userId).gte("date", addDays(today, -3)),
    supabase.from("injections").select("*").eq("user_id", userId).gte("date", since).order("date"),
    supabase.from("intake_logs").select("*").eq("user_id", userId).eq("date", today).order("created_at"),
    supabase
      .from("messages")
      .select("*")
      .eq("to_user", userId)
      .not("released_at", "is", null)
      .is("read_at", null)
      .order("released_at", { ascending: false })
      .limit(1),
    supabase.from("program_proposals").select("*").eq("user_id", userId).eq("status", "pending").order("created_at"),
    supabase.from("playlists").select("*").eq("user_id", userId).order("created_at"),
    supabase.from("checklist_items").select("*").eq("user_id", userId).order("created_at"),
    supabase.from("activity_summary").select("*").eq("user_id", userId).maybeSingle<ActivityTotals>(),
  ]);

  const levels: Record<string, number> = {};
  for (const l of levelsRes.data ?? []) levels[l.exercise_key] = l.level;

  return {
    today,
    state: stateRes.data ?? DEFAULT_STATE(userId, today),
    levels,
    activities: (activitiesRes.data ?? []) as Pick<
      Activity,
      "id" | "date" | "kind" | "minutes" | "songs" | "title" | "feel_before" | "feel_after" | "outdoor" | "created_at"
    >[],
    checkin: checkinRes.data,
    symptoms: (symptomsRes.data ?? []) as Symptoms[],
    injections: (injectionsRes.data ?? []) as Injection[],
    intake: (intakeRes.data ?? []) as IntakeLog[],
    message: ((messagesRes.data ?? [])[0] as Message) ?? null,
    proposals: (proposalsRes.data ?? []) as ProgramProposal[],
    playlists: (playlistsRes.data ?? []) as Playlist[],
    checklist: (checklistRes.data ?? []) as ChecklistItem[],
    totals: totalsRes.data ?? null,
  };
}

export type Dashboard = Awaited<ReturnType<typeof loadDashboard>>;
