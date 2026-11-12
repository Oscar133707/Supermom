import { requireMom, loadDashboard } from "@/lib/data";
import { EXERCISES } from "@/lib/program/exercises";
import { getPhase } from "@/lib/program/phases";
import { SubHeader } from "@/components/mer/sub-header";
import { Card, SectionTitle } from "@/components/ui/card";
import { ExerciseRow } from "@/components/mer/exercise-row";

export default async function ProgramPage() {
  const { supabase, user } = await requireMom();
  const d = await loadDashboard(user.id);
  const phase = getPhase(d.state.phase);
  const { data: media } = await supabase.from("exercise_media").select("exercise_key, video_url");
  const video = Object.fromEntries((media ?? []).filter((m) => m.video_url).map((m) => [m.exercise_key, m.video_url as string]));

  return (
    <main className="flex flex-col gap-6 px-4 pt-4">
      <SubHeader title="Mina övningar" lead={`${phase.short}: ${phase.name}. ${phase.sets} set × ${phase.repMin}–${phase.repMax}. ${phase.effort}.`} />
      <div>
        <SectionTitle>Alla övningar</SectionTitle>
        <Card className="flex flex-col divide-y divide-line p-0">
          {EXERCISES.map((e) => (
            <ExerciseRow
              key={e.key}
              exKey={e.key}
              level={d.levels[e.key] ?? 1}
              locked={e.minPhase > d.state.phase}
              video={video[e.key]}
            />
          ))}
        </Card>
      </div>
      <p className="px-1 text-sm text-ink-2">
        Lättare nivå gäller direkt. Svårare nivåer föreslås av appen när du klarat en övning fint två pass i rad – och
        bara om du själv säger ja.
      </p>
    </main>
  );
}
