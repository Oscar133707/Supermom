import { getAuth, loadDashboard, requireMom } from "@/lib/data";
import { TodayView } from "@/components/today/today-view";

export default async function TodayPage() {
  const { user } = await getAuth();
  // Profile check and dashboard queries run in parallel instead of one after the other.
  const [{ profile }, d] = await Promise.all([requireMom(), loadDashboard(user.id)]);
  return <TodayView profile={profile} d={d} />;
}
