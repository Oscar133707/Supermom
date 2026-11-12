import { ToastProvider } from "@/components/ui/toast";
import { CelebrationProvider } from "@/components/app/celebration";
import { requireMom } from "@/lib/data";

export default async function FocusLayout({ children }: { children: React.ReactNode }) {
  await requireMom();
  return (
    <ToastProvider>
      <CelebrationProvider>{children}</CelebrationProvider>
    </ToastProvider>
  );
}
