"use client";

import { useEffect, useRef } from "react";

type UsePollingOptions = {
  /** Oprește intervalul când tab-ul e ascuns; reia + un tick la revenire */
  pauseWhenHidden?: boolean;
  enabled?: boolean;
};

/**
 * Apelează `callback` la fiecare `intervalMs` ms.
 * Evită tick-uri suprapuse dacă callback-ul durează mai mult decât intervalul.
 */
export function usePolling(
  callback: () => void | Promise<void>,
  intervalMs: number,
  options: UsePollingOptions = {},
): void {
  const { pauseWhenHidden = true, enabled = true } = options;
  const callbackRef = useRef(callback);
  const inFlightRef = useRef(false);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  useEffect(() => {
    if (!enabled || intervalMs <= 0) return;

    let intervalId: ReturnType<typeof setInterval> | undefined;

    const run = async () => {
      if (pauseWhenHidden && document.hidden) return;
      if (inFlightRef.current) return;
      inFlightRef.current = true;
      try {
        await callbackRef.current();
      } finally {
        inFlightRef.current = false;
      }
    };

    intervalId = setInterval(() => {
      void run();
    }, intervalMs);

    if (pauseWhenHidden) {
      const onVisibilityChange = () => {
        if (!document.hidden) void run();
      };
      document.addEventListener("visibilitychange", onVisibilityChange);
      return () => {
        clearInterval(intervalId);
        document.removeEventListener("visibilitychange", onVisibilityChange);
      };
    }

    return () => {
      clearInterval(intervalId);
    };
  }, [enabled, intervalMs, pauseWhenHidden]);
}
