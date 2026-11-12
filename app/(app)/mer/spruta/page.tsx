import { requireMom } from "@/lib/data";
import { daysBetween, shortDate, stockholmDate } from "@/lib/dates";
import { SITE_LABEL } from "@/lib/health";
import { lastDoseIncrease } from "@/lib/program/engine";
import { SubHeader } from "@/components/mer/sub-header";
import { Card, SectionTitle } from "@/components/ui/card";
import { OpenLogButton } from "@/components/mer/open-log-button";
import type { Injection } from "@/lib/types";

const mg = (n: number) => `${String(n).replace(".", ",")} mg`;

export default async function InjectionPage() {
  const { supabase, user, profile } = await requireMom();
  const today = stockholmDate();
  const { data } = await supabase.from("injections").select("*").eq("user_id", user.id).order("date", { ascending: false }).limit(52);
  const rows = (data ?? []) as Injection[];
  const last = rows[0];
  const inc = lastDoseIncrease(rows);
  const sameDose = last ? rows.filter((r) => Number(r.dose_mg) === Number(last.dose_mg)) : [];
  const weeksOnDose = sameDose.length ? Math.floor(daysBetween(sameDose[sameDose.length - 1].date, today) / 7) + 1 : 0;

  return (
    <main className="flex flex-col gap-6 px-4 pt-4">
      <SubHeader title="Spruta & dos" />
      {last ? (
        <Card>
          <p className="text-sm text-ink-2">Senaste sprutan</p>
          <p className="mt-1 text-3xl font-semibold tracking-tight">{mg(Number(last.dose_mg))}</p>
          <p className="mt-1 text-ink-2">
            {shortDate(last.date)} · dag {daysBetween(last.date, today)} efter sprutan · vecka {weeksOnDose} på denna dos
          </p>
          {inc && daysBetween(inc, today) <= 14 && (
            <p className="mt-4 rounded-2xl bg-lime-soft p-3 text-sm">
              Du höjde dosen {shortDate(inc)}. De första två veckorna kan magen kännas mer – dina förslag blir lättare de
              dagar du loggar illamående.
              {profile.takes_lithium === "yes" && " Kom ihåg att fråga om litiumprov."}
            </p>
          )}
        </Card>
      ) : (
        <Card>
          <p className="text-ink-2">Ingen spruta loggad än.</p>
        </Card>
      )}
      <OpenLogButton panel="injection" label="Logga spruta" />

      <Card>
        <p className="font-semibold">Så brukar doseringen se ut</p>
        <p className="mt-2 text-sm text-ink-2">
          Start med 2,5 mg i veckan i fyra veckor, sedan 5 mg. Därefter kan läkaren höja i steg om 2,5 mg tidigast var
          fjärde vecka, som mest till 15 mg. Följ alltid din egen ordination.
        </p>
      </Card>

      {rows.length > 0 && (
        <div>
          <SectionTitle>Historik</SectionTitle>
          <Card className="flex flex-col divide-y divide-line p-0">
            {rows.map((r) => (
              <div key={r.id} className="flex items-center justify-between px-5 py-3.5">
                <span className="font-medium">{shortDate(r.date)}</span>
                <span className="text-sm text-ink-2">
                  {mg(Number(r.dose_mg))}
                  {r.site && ` · ${SITE_LABEL[r.site]}`}
                </span>
              </div>
            ))}
          </Card>
        </div>
      )}
    </main>
  );
}
