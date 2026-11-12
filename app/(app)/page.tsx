import { loadDashboard, requireMom } from "@/lib/data";
import { TodayView } from "@/components/today/today-view";

export default async function TodayPage() {
  const { user, profile } = await requireMom();
  const d = await loadDashboard(user.id);
  return <TodayView profile={profile} d={d} />;
}
