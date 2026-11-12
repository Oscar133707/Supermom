import { LogoMark } from "@/components/brand/logo";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="safe-top mx-auto flex min-h-dvh max-w-md flex-col px-6 pb-10 pt-16">
      <div className="mb-10 flex items-center gap-3">
        <LogoMark size={44} />
        <span className="text-xl font-semibold tracking-tight">Supermom</span>
      </div>
      {children}
    </main>
  );
}
