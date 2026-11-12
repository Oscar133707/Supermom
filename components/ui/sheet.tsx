"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect } from "react";
import { X } from "lucide-react";

export function Sheet({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-label={title}>
          <motion.div
            className="absolute inset-0 bg-black/35"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            className="safe-bottom absolute inset-x-0 bottom-0 mx-auto max-h-[92dvh] max-w-lg overflow-y-auto rounded-t-[2rem] bg-canvas"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 34, stiffness: 380 }}
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0, bottom: 0.6 }}
            onDragEnd={(_, info) => {
              if (info.offset.y > 120 || info.velocity.y > 600) onClose();
            }}
          >
            <div className="sticky top-0 z-10 bg-canvas/95 px-5 pb-2 pt-3 backdrop-blur">
              <div className="mx-auto mb-3 h-1.5 w-10 rounded-full bg-surface-3" />
              <div className="flex min-h-11 items-center justify-between">
                <h2 className="text-lg font-semibold">{title}</h2>
                <button
                  type="button"
                  onClick={onClose}
                  aria-label="Stäng"
                  className="-mr-2 flex h-11 w-11 items-center justify-center rounded-full text-ink-2 hover:bg-surface-2"
                >
                  <X size={22} />
                </button>
              </div>
            </div>
            <div className="px-5 pb-8">{children}</div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
