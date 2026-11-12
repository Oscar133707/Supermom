"use client";

import { AnimatePresence, motion } from "motion/react";
import { createContext, useCallback, useContext, useState } from "react";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Celebration } from "@/app/(app)/actions";
import { markMessageRead } from "@/app/(app)/actions";

const Ctx = createContext<(c: Celebration) => void>(() => {});
export const useCelebrate = () => useContext(Ctx);

function milestoneText(n: number) {
  if (n === 1) return { title: "Första rörelsedagen", body: "Det här är början. Varje dag du dyker upp bygger den du är på väg att bli." };
  if (n === 7) return { title: "7 rörelsedagar", body: "En vecka av dagar då du valde dig själv." };
  return { title: `${n} rörelsedagar`, body: "De räknas alla – och ingen av dem kan tas ifrån dig." };
}

export function CelebrationProvider({ children }: { children: React.ReactNode }) {
  const [c, setC] = useState<Celebration | null>(null);

  const celebrate = useCallback((cel: Celebration) => {
    if (cel.comeback || cel.milestone || cel.message) {
      setC(cel);
      if ("vibrate" in navigator) navigator.vibrate?.([12, 60, 12]);
    }
  }, []);

  const close = () => {
    if (c?.message) markMessageRead(c.message.id);
    setC(null);
  };

  let title = "";
  let body = "";
  if (c?.comeback) {
    title = "Välkommen tillbaka";
    body = "En paus raderar ingenting – allt du gjort finns kvar. Att komma tillbaka är det viktigaste av allt.";
  } else if (c?.milestone) {
    ({ title, body } = milestoneText(c.milestone));
  } else if (c?.message) {
    title = "Ett meddelande till dig";
  }

  return (
    <Ctx.Provider value={celebrate}>
      {children}
      <AnimatePresence>
        {c && (
          <motion.div
            className="fixed inset-0 z-[70] flex items-end justify-center bg-black/40 p-4 sm:items-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={close}
          >
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-label={title}
              className="safe-bottom w-full max-w-md rounded-[2rem] bg-canvas p-7 text-center"
              initial={{ y: 40, scale: 0.96 }}
              animate={{ y: 0, scale: 1 }}
              exit={{ y: 30, opacity: 0 }}
              transition={{ type: "spring", damping: 26, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
            >
              <motion.div
                className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-lime"
                initial={{ scale: 0.6 }}
                animate={{ scale: [0.6, 1.08, 1] }}
                transition={{ duration: 0.6 }}
              >
                <Heart size={34} className="text-lime-ink" fill="currentColor" />
              </motion.div>
              <h2 className="text-2xl font-semibold tracking-tight">{title}</h2>
              {body && <p className="mt-3 text-ink-2">{body}</p>}
              {c.message && (
                <div className="mt-5 rounded-2xl bg-surface p-5 text-left shadow-card">
                  <p className="text-sm font-semibold text-ink-2">Från Oscar</p>
                  <p className="mt-1 text-lg leading-relaxed">{c.message.body}</p>
                </div>
              )}
              <Button onClick={close} size="lg" className="mt-7 w-full">
                Tack
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </Ctx.Provider>
  );
}
