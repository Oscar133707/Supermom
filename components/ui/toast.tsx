"use client";

import { AnimatePresence, motion } from "motion/react";
import { createContext, useCallback, useContext, useRef, useState } from "react";
import { Check } from "lucide-react";

interface ToastItem {
  id: number;
  text: string;
  undo?: () => void | Promise<void>;
}

const ToastContext = createContext<(text: string, undo?: ToastItem["undo"]) => void>(() => {});

export function useToast() {
  return useContext(ToastContext);
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toast, setToast] = useState<ToastItem | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const show = useCallback((text: string, undo?: ToastItem["undo"]) => {
    if (timer.current) clearTimeout(timer.current);
    const item = { id: Date.now(), text, undo };
    setToast(item);
    timer.current = setTimeout(() => setToast((t) => (t?.id === item.id ? null : t)), 5500);
    if ("vibrate" in navigator) navigator.vibrate?.(10);
  }, []);

  return (
    <ToastContext.Provider value={show}>
      {children}
      <div className="pointer-events-none fixed inset-x-0 bottom-28 z-[60] flex justify-center px-4" aria-live="polite">
        <AnimatePresence>
          {toast && (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 16, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8 }}
              className="pointer-events-auto flex min-h-14 w-full max-w-md items-center gap-3 rounded-2xl bg-ink py-2 pl-4 pr-2 text-canvas shadow-card"
            >
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-lime text-lime-ink">
                <Check size={16} strokeWidth={3} />
              </span>
              <span className="flex-1 text-sm font-medium">{toast.text}</span>
              {toast.undo && (
                <button
                  type="button"
                  className="h-11 rounded-xl px-4 text-sm font-semibold text-lime"
                  onClick={async () => {
                    const u = toast.undo;
                    setToast(null);
                    await u?.();
                  }}
                >
                  Ångra
                </button>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}
