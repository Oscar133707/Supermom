import Link from "next/link";
import {
  Bell,
  BookOpen,
  ChevronRight,
  Dumbbell,
  HeartHandshake,
  LifeBuoy,
  LogOut,
  Music,
  Sparkles,
  Stethoscope,
  Syringe,
} from "lucide-react";
import { requireMom } from "@/lib/data";
import { shortDate, stockholmDate } from "@/lib/dates";
import { Card, SectionTitle } from "@/components/ui/card";
import { PauseControl, ThemeControl } from "@/components/mer/settings-controls";

export const metadata = { title: "Mer · Supermom" };

const ROWS = [
  { href: "/mer/varfor", label: "Mitt varför & mina planer", icon: Sparkles },
  { href: "/mer/musik", label: "Mina spellistor", icon: Music },
  { href: "/mer/paminnelser", label: "Påminnelser", icon: Bell },
  { href: "/mer/spruta", label: "Spruta & dos", icon: Syringe },
  { href: "/mer/program", label: "Mina övningar", icon: Dumbbell },
  { href: "/mer/lakare", label: "Att ta upp med vården", icon: Stethoscope },
  { href: "/mer/kunskap", label: "Bra att veta", icon: BookOpen },
];

export default async function MorePage() {
  const { profile } = await requireMom();
  const today = stockholmDate();
  const paused = profile.paused_until && profile.paused_until >= today ? profile.paused_until : null;

  return (
    <main className="flex flex-col gap-6 px-4 pt-6">
      <h1 className="px-1 text-3xl font-semibold tracking-tight">Mer</h1>

      <Card className="flex flex-col divide-y divide-line p-0">
        {ROWS.map(({ href, label, icon: Icon }) => (
          <Link key={href} href={href} className="flex min-h-16 items-center gap-4 px-5 active:bg-surface-2">
            <Icon size={22} className="text-ink-2" />
            <span className="flex-1 font-medium">{label}</span>
            <ChevronRight size={20} className="text-ink-3" />
          </Link>
        ))}
      </Card>

      <Link
        href="/mer/stod"
        className="flex min-h-16 items-center gap-4 rounded-[1.5rem] bg-surface px-5 shadow-card active:bg-surface-2"
      >
        <LifeBuoy size={22} className="text-ink-2" />
        <span className="flex-1 font-medium">Behöver du stöd nu?</span>
        <ChevronRight size={20} className="text-ink-3" />
      </Link>

      <div>
        <SectionTitle>Utseende</SectionTitle>
        <ThemeControl value={profile.theme} />
      </div>

      <div>
        <SectionTitle>Pausläge</SectionTitle>
        <Card>
          <div className="mb-4 flex gap-3">
            <HeartHandshake size={22} className="shrink-0 text-ink-2" />
            <p className="text-sm text-ink-2">
              {paused
                ? `Pausat till ${shortDate(paused)}. Inga påminnelser och inga mål under tiden.`
                : "Behöver du vila från allt? Pausa påminnelser och mål – utan att något går förlorat."}
            </p>
          </div>
          <PauseControl pausedUntil={paused} />
        </Card>
      </div>

      <form action="/auth/signout" method="post">
        <button
          type="submit"
          className="flex min-h-14 w-full items-center justify-center gap-2 rounded-[1.5rem] text-ink-2 active:bg-surface-2"
        >
          <LogOut size={18} /> Logga ut
        </button>
      </form>
      <p className="pb-4 text-center text-xs text-ink-3">
        Supermom är ett stöd i vardagen – inte vård. Vid frågor om hälsa och medicin: prata med din vårdkontakt.
      </p>
    </main>
  );
}
