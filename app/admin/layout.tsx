import { requireAdmin } from "@/lib/data";
import { ToastProvider } from "@/components/ui/toast";
import { AdminHeader, AdminTabBar } from "@/components/admin/admin-nav";

export const metadata = { title: "Admin · Supermom" };

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();
  return (
    <ToastProvider>
      <div className="mx-auto min-h-dvh max-w-lg pb-32">
        <AdminHeader />
        {children}
      </div>
      <AdminTabBar />
    </ToastProvider>
  );
}
