"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut } from "lucide-react";
import { cn } from "@/lib/cn";
import { LogoMark } from "@/components/brand/logo";

const TABS = [
  { href: "/admin", label: "Översikt" },
  { href: "/admin/meddelanden", label: "Meddelanden" },
  { href: "/admin/program", label: "Program" },
  { href: "/admin/ovningar", label: "Övningar" },
];

export function AdminNav() {
  const path = usePathname();
  return (
    <div className="sticky top-0 z-30 bg-canvas/90 px-4 pb-3 pt-4 backdrop-blur">
      <div className="mb-3 flex items-center gap-2.5">
        <LogoMark size={30} />
        <span className="flex-1 font-semibold">Supermom · Admin</span>
        <form action="/auth/signout" method="post">
          <button type="submit" aria-label="Logga ut" className="flex h-11 w-11 items-center justify-center rounded-full text-ink-2">
            <LogOut size={18} />
          </button>
        </form>
      </div>
      <nav className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4">
        {TABS.map((t) => {
          const active = t.href === "/admin" ? path === "/admin" : path.startsWith(t.href);
          return (
            <Link
              key={t.href}
              href={t.href}
              className={cn(
                "flex h-10 shrink-0 items-center rounded-full px-4 text-sm font-semibold",
                active ? "bg-ink text-canvas" : "bg-surface text-ink-2 shadow-card",
              )}
            >
              {t.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
