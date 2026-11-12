"use client";

import { useEffect, useRef, useState } from "react";

/** Håller skärmen tänd medan `active`; återtar låset när sidan blir synlig igen. */
export function useWakeLock(active: boolean) {
  const lock = useRef<WakeLockSentinel | null>(null);
  const [supported, setSupported] = useState(false);

  useEffect(() => {
    setSupported("wakeLock" in navigator);
  }, []);

  useEffect(() => {
    if (!active || !supported) return;
    let cancelled = false;
    const request = async () => {
      try {
        if (document.visibilityState !== "visible") return;
        lock.current = await navigator.wakeLock.request("screen");
      } catch {
        /* t.ex. batterisparläge */
      }
    };
    void request();
    const onVis = () => {
      if (!cancelled && document.visibilityState === "visible") void request();
    };
    document.addEventListener("visibilitychange", onVis);
    return () => {
      cancelled = true;
      document.removeEventListener("visibilitychange", onVis);
      void lock.current?.release().catch(() => {});
      lock.current = null;
    };
  }, [active, supported]);

  return supported;
}
