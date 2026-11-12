import { requireMom } from "@/lib/data";
import { SubHeader } from "@/components/mer/sub-header";
import { WhyForm } from "@/components/mer/why-form";

export default async function WhyPage() {
  const { profile } = await requireMom();
  return (
    <main className="flex flex-col gap-6 px-4 pt-4">
      <SubHeader title="Mitt varför" lead="Dina egna ord – de visas när du behöver dem." />
      <WhyForm
        name={profile.display_name ?? ""}
        why={profile.why_text ?? ""}
        anchor={profile.anchor_text ?? ""}
        heavy={profile.heavy_day_text ?? ""}
        lithium={profile.takes_lithium}
        proteinGoal={profile.protein_goal_g}
        waterGoal={profile.water_goal_glasses}
      />
    </main>
  );
}
