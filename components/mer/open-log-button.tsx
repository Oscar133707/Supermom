"use client";

import { Button } from "@/components/ui/button";
import { useLogSheet } from "@/components/log/log-context";
import type { LogPanel } from "@/components/log/log-context";

export function OpenLogButton({ panel, label }: { panel: LogPanel; label: string }) {
  const { open } = useLogSheet();
  return (
    <Button size="lg" className="w-full" onClick={() => open(panel)}>
      {label}
    </Button>
  );
}
