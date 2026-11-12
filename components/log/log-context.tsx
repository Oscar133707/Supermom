"use client";

import { createContext, useContext } from "react";

export type LogPanel = "menu" | "protein" | "water" | "move" | "diary" | "injection" | "symptoms" | "body";

export const LogSheetContext = createContext<{ open: (panel?: LogPanel) => void }>({ open: () => {} });

export function useLogSheet() {
  return useContext(LogSheetContext);
}
