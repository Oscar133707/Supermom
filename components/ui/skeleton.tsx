import { cn } from "@/lib/cn";

/** Calm placeholder shown instantly while a page loads. No flashing; static if reduced motion. */
function Bar({ className }: { className?: string }) {
  return <div className={cn("rounded-full bg-surface-2", className)} />;
}

export function PageSkeleton({ cards = 3, tall = true }: { cards?: number; tall?: boolean }) {
  return (
    <div
      className="flex animate-pulse flex-col gap-6 px-4 pt-6 [animation-duration:2.4s] motion-reduce:animate-none"
      aria-busy="true"
      aria-label="Laddar"
    >
      <div className="flex flex-col gap-3 px-1">
        <Bar className="h-8 w-48" />
        <Bar className="h-4 w-32" />
      </div>
      {tall && <div className="h-44 rounded-[1.5rem] bg-surface shadow-card" />}
      {Array.from({ length: cards }).map((_, i) => (
        <div key={i} className="flex flex-col gap-3 rounded-[1.5rem] bg-surface p-5 shadow-card">
          <Bar className="h-4 w-2/5" />
          <Bar className="h-4 w-4/5" />
          <Bar className="h-4 w-3/5" />
        </div>
      ))}
    </div>
  );
}
