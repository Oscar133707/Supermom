"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Dumbbell, LayoutGrid, LogOut, MessageCircleHeart, PlayCircle } from "lucide-react";
import { cn } from "@/lib/cn";
import { LogoMark } from "@/components/brand/logo";

const TABS = [
  { href: "/admin", label: "Översikt", icon: LayoutGrid },
  { href: "/admin/meddelanden", label: "Meddelanden", icon: MessageCircleHeart },
  { href: "/admin/program", label: "Program", icon: Dumbbell },
  { href: "/admin/ovningar", label: "Övningar", icon: PlayCircle },
];

/** Compact top bar: logo, title, sign out. Sticks below the phone's status bar. */
export function AdminHeader() {
  return (
    <div className="sticky top-0 z-30 bg-canvas/90 backdrop-blur [padding-top:env(safe-area-inset-top)]">
      <div className="flex h-14 items-center gap-2.5 px-4">
        <LogoMark size={28} />
        <span className="flex-1 font-semibold">Supermom · Admin</span>
        <form action="/auth/signout" method="post">
          <button
            type="submit"
            aria-label="Logga ut"
            className="-mr-2 flex h-11 w-11 items-center justify-center rounded-full text-ink-2"
          >
            <LogOut size={18} />
          </button>
        </form>
      </div>
    </div>
  );
}

/** Bottom tab bar – all four sections always visible and within thumb reach. */
export function AdminTabBar() {
  const path = usePathname();
  return (
    <nav
      className="safe-bottom fixed inset-x-0 bottom-0 z-40 border-t border-line bg-[var(--tabbar)] backdrop-blur-xl"
      aria-label="Adminmeny"
    >
      <div className="mx-auto grid max-w-lg grid-cols-4">
        {TABS.map((t) => {
          const active = t.href === "/admin" ? path === "/admin" : path.startsWith(t.href);
          const Icon = t.icon;
          return (
            <Link
              key={t.href}
              href={t.href}
              prefetch={true}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex h-16 flex-col items-center justify-center gap-1 text-[11px] font-medium transition-colors",
                active ? "text-ink" : "text-ink-3",
              )}
            >
              <Icon size={22} strokeWidth={active ? 2.4 : 1.9} />
              {t.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
