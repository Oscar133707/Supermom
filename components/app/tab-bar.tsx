"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, LineChart, Menu, Plus } from "lucide-react";
import { cn } from "@/lib/cn";
import { useLogSheet } from "@/components/log/log-context";

const tabs = [
  { href: "/", label: "Idag", icon: Home },
  { href: "/framsteg", label: "Framsteg", icon: LineChart },
  { href: "/mer", label: "Mer", icon: Menu },
];

export function TabBar() {
  const path = usePathname();
  const { open } = useLogSheet();
  const isActive = (href: string) => (href === "/" ? path === "/" : path.startsWith(href));

  const item = (t: (typeof tabs)[number]) => {
    const Icon = t.icon;
    const active = isActive(t.href);
    return (
      <Link
        key={t.href}
        href={t.href}
        // Prefetch the full page (not just the loading shell) so a tap switches instantly.
        prefetch={true}
        className={cn(
          "flex h-16 flex-1 flex-col items-center justify-center gap-1 text-xs font-medium transition-colors",
          active ? "text-ink" : "text-ink-3",
        )}
        aria-current={active ? "page" : undefined}
      >
        <Icon size={24} strokeWidth={active ? 2.4 : 1.9} />
        {t.label}
      </Link>
    );
  };

  return (
    <nav
      className="safe-bottom fixed inset-x-0 bottom-0 z-40 border-t border-line bg-[var(--tabbar)] backdrop-blur-xl"
      aria-label="Huvudmeny"
    >
      <div className="mx-auto flex max-w-lg items-center px-2">
        {item(tabs[0])}
        <div className="flex flex-1 justify-center">
          <button
            type="button"
            onClick={() => open()}
            aria-label="Logga"
            className="flex h-14 w-14 items-center justify-center rounded-full bg-lime text-lime-ink shadow-card transition-transform active:scale-95"
          >
            <Plus size={28} strokeWidth={2.6} />
          </button>
        </div>
        {item(tabs[1])}
        {item(tabs[2])}
      </div>
    </nav>
  );
}
