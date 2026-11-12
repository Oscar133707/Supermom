import { getMomProfile, loadDashboard, requireAdmin } from "@/lib/data";
import { shortDate } from "@/lib/dates";
import { weeksInPhase } from "@/lib/program/engine";
import { getExercise } from "@/lib/program/exercises";
import { getPhase } from "@/lib/program/phases";
import { Card, SectionTitle } from "@/components/ui/card";
import { DeleteProposalButton, LevelProposal, PhaseProposal } from "@/components/admin/proposal-form";

export default async function AdminProgramPage() {
  const { supabase } = await requireAdmin();
  const mom = await getMomProfile();
  if (!mom) return <main className="px-4">Inget mamma-konto.</main>;
  const d = await loadDashboard(mom.id);
  const phase = getPhase(d.state.phase);
  const { data: history } = await supabase
    .from("program_proposals")
    .select("*")
    .eq("user_id", mom.id)
    .neq("status", "pending")
    .order("decided_at", { ascending: false })
    .limit(10);

  const describe = (p: { kind: string; exercise_key: string | null; to_value: number }) =>
    p.kind.startsWith("phase")
      ? `${getPhase(p.to_value).short}: ${getPhase(p.to_value).name}`
      : `${p.exercise_key ? getExercise(p.exercise_key).name : ""} → nivå ${p.to_value}`;

  return (
    <main className="flex flex-col gap-6 px-4 pt-2">
      <h1 className="px-1 text-3xl font-semibold tracking-tight">Program</h1>
      <Card>
        <p className="text-sm text-ink-2">Nuvarande fas</p>
        <p className="text-2xl font-semibold">
          {phase.short}: {phase.name}
        </p>
        <p className="mt-1 text-sm text-ink-2">
          Sedan {shortDate(d.state.phase_started_on)} · vecka {weeksInPhase(d.state, d.today) + 1}
        </p>
        <ul className="mt-3 space-y-1 text-sm text-ink-2">
          {phase.criteria.map((c) => (
            <li key={c}>• {c}</li>
          ))}
        </ul>
        <div className="mt-4">
          <PhaseProposal phase={d.state.phase} />
        </div>
        <p className="mt-3 text-xs text-ink-3">
          Allt du föreslår visas som ett kort hos henne. Inget ändras förrän hon själv trycker ”Ja”.
        </p>
      </Card>

      {d.proposals.length > 0 && (
        <div>
          <SectionTitle>Väntar på hennes svar</SectionTitle>
          <Card className="flex flex-col divide-y divide-line p-0">
            {d.proposals.map((p) => (
              <div key={p.id} className="flex items-center gap-2 py-2 pl-5 pr-2">
                <p className="flex-1 text-sm">{describe(p)}</p>
                <DeleteProposalButton id={p.id} />
              </div>
            ))}
          </Card>
        </div>
      )}

      <div>
        <SectionTitle>Övningsnivåer</SectionTitle>
        <Card className="py-1">
          <LevelProposal levels={d.levels} />
        </Card>
      </div>

      {(history ?? []).length > 0 && (
        <div>
          <SectionTitle>Tidigare förslag</SectionTitle>
          <Card className="flex flex-col gap-2">
            {(history ?? []).map((p) => (
              <p key={p.id} className="text-sm text-ink-2">
                {p.status === "accepted" ? "✓" : "–"} {describe(p)}
                {p.status === "declined" && " (inte än)"}
              </p>
            ))}
          </Card>
        </div>
      )}
    </main>
  );
}
