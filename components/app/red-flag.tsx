"use client";

import { motion } from "motion/react";
import { Phone, TriangleAlert } from "lucide-react";
import { buttonClass } from "@/components/ui/button";

export function RedFlagScreen({ onClose, reason }: { onClose: () => void; reason?: string }) {
  return (
    <motion.div
      className="fixed inset-0 z-[80] flex flex-col bg-canvas"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      role="alertdialog"
      aria-modal="true"
      aria-label="Kontakta vården"
    >
      <div className="safe-top mx-auto flex w-full max-w-md flex-1 flex-col px-6 pb-8 pt-14">
        <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-danger-soft text-danger">
          <TriangleAlert size={32} />
        </div>
        <h1 className="text-3xl font-semibold tracking-tight">Stanna upp och kontakta vården</h1>
        <p className="mt-4 text-lg text-ink-2">
          {reason ??
            "Det du beskriver behöver bedömas av vården. Avbryt träningen, sätt dig ner och ring."}
        </p>
        <div className="mt-4 rounded-2xl bg-surface p-4 text-ink-2 shadow-card">
          Vid akut fara – bröstsmärta, svårt att andas eller medvetslöshet – ring <strong className="text-ink">112</strong>.
          Annars ringer du <strong className="text-ink">1177</strong> för råd dygnet runt.
        </div>
        <div className="mt-auto flex flex-col gap-3 pt-8">
          <a href="tel:112" className={buttonClass("danger", "lg", "w-full")}>
            <Phone size={20} /> Ring 112
          </a>
          <a href="tel:1177" className={buttonClass("dark", "lg", "w-full")}>
            <Phone size={20} /> Ring 1177
          </a>
          <button type="button" onClick={onClose} className={buttonClass("ghost", "md", "w-full")}>
            Stäng
          </button>
        </div>
      </div>
    </motion.div>
  );
}
