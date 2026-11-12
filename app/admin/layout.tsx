import { requireAdmin } from "@/lib/data";
import { ToastProvider } from "@/components/ui/toast";
import { AdminNav } from "@/components/admin/admin-nav";

export const metadata = { title: "Admin · Supermom" };

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();
  return (
    <ToastProvider>
      <div className="safe-top mx-auto min-h-dvh max-w-lg pb-16">
        <AdminNav />
        {children}
      </div>
    </ToastProvider>
  );
}
