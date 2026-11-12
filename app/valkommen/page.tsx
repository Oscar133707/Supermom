import { redirect } from "next/navigation";
import { requireMom } from "@/lib/data";
import { Onboarding } from "./onboarding";

export const metadata = { title: "Välkommen · Supermom" };

export default async function WelcomePage() {
  const { profile } = await requireMom({ allowUnonboarded: true });
  if (profile.onboarded_at) redirect("/");
  return <Onboarding initialName={profile.display_name ?? ""} />;
}
