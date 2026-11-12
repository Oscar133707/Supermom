import { NextResponse, type NextRequest } from "next/server";
import * as webpush from "web-push";
import { createServiceClient } from "@/lib/supabase/server";
import { addDays, daysBetween, stockholmDate, stockholmTime } from "@/lib/dates";
import { moveMessage, nutritionMessage } from "@/lib/push/messages";

// Anropas av Supabase pg_cron var 5:e minut (se supabase/cron.sql).
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret || req.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const pub = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const priv = process.env.VAPID_PRIVATE_KEY;
  if (!pub || !priv) return NextResponse.json({ error: "vapid not configured" }, { status: 500 });
  webpush.setVapidDetails(process.env.VAPID_SUBJECT ?? "mailto:supermom@example.com", pub, priv);

  const db = createServiceClient();
  const today = stockholmDate();
  const now = stockholmTime(); // HH:MM
  const hour = Number(now.slice(0, 2));
  if (hour < 9 || hour >= 21) return NextResponse.json({ sent: 0, reason: "quiet hours" });

  const { data: due } = await db
    .from("reminders")
    .select("user_id, kind, time_local, last_sent_on")
    .eq("enabled", true)
    .lte("time_local", now + ":59");

  let sent = 0;
  for (const r of due ?? []) {
    if (r.last_sent_on === today) continue;
    // Skicka inte gamla påminnelser (t.ex. efter driftstopp): högst 45 min sent.
    const [h, m] = (r.time_local as string).split(":").map(Number);
    const [nh, nm] = now.split(":").map(Number);
    if (nh * 60 + nm - (h * 60 + m) > 45) continue;

    const { data: profile } = await db
      .from("profiles")
      .select("why_text, paused_until, protein_goal_g, water_goal_glasses")
      .eq("id", r.user_id)
      .single();
    if (!profile || (profile.paused_until && profile.paused_until >= today)) continue;

    let payload: { title: string; body: string; url: string; tag: string } | null = null;
    const seed = Number(today.replaceAll("-", "")) + (r.kind === "move" ? 0 : 7);

    if (r.kind === "move") {
      const { data: acts } = await db
        .from("activities")
        .select("date")
        .eq("user_id", r.user_id)
        .gte("date", addDays(today, -60))
        .order("date", { ascending: false })
        .limit(1);
      const last = acts?.[0]?.date as string | undefined;
      if (last === today) continue; // redan rört sig idag → ingen påminnelse
      const gap = last ? daysBetween(last, today) : 0;
      const comeback = gap >= 3;
      // Comeback-knuff efter 2 inaktiva dagar, sedan högst var 3:e dag.
      if (comeback && (gap - 3) % 3 !== 0) continue;
      const msg = moveMessage(seed, profile.why_text, comeback);
      payload = { ...msg, url: "/", tag: "move" };
    } else {
      const { data: intake } = await db
        .from("intake_logs")
        .select("kind, amount")
        .eq("user_id", r.user_id)
        .eq("date", today);
      const p = (intake ?? []).filter((i) => i.kind === "protein").reduce((s, i) => s + Number(i.amount), 0);
      const w = (intake ?? []).filter((i) => i.kind === "water").reduce((s, i) => s + Number(i.amount), 0);
      if (p >= profile.protein_goal_g * 0.6 && w >= profile.water_goal_glasses * 0.6) continue;
      payload = { ...nutritionMessage(seed), url: "/", tag: "nutrition" };
    }

    const { data: subs } = await db.from("push_subscriptions").select("id, endpoint, p256dh, auth").eq("user_id", r.user_id);
    for (const s of subs ?? []) {
      try {
        await webpush.sendNotification(
          { endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } },
          JSON.stringify(payload),
          { TTL: 60 * 60, urgency: "normal" },
        );
        sent++;
      } catch (err) {
        const code = (err as { statusCode?: number }).statusCode;
        if (code === 404 || code === 410) await db.from("push_subscriptions").delete().eq("id", s.id);
      }
    }
    await db.from("reminders").update({ last_sent_on: today }).eq("user_id", r.user_id).eq("kind", r.kind);
  }

  return NextResponse.json({ sent });
}
