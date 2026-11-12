import { cn } from "@/lib/cn";
import type { ComponentProps } from "react";

export function Card({ className, ...props }: ComponentProps<"div">) {
  return <div className={cn("rounded-[1.5rem] bg-surface p-5 shadow-card", className)} {...props} />;
}

export function SectionTitle({ className, ...props }: ComponentProps<"h2">) {
  return <h2 className={cn("px-1 pb-2 text-sm font-semibold text-ink-2", className)} {...props} />;
}
