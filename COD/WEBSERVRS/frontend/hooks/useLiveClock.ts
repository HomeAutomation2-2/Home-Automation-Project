"use client";

import { useEffect, useState } from "react";

/**
 * Returnează data curentă, reîmprospătată la fiecare `tickMs` ms.
 * Folosit pentru recalculul programelor orare și afișarea orei live.
 */
export function useLiveClock(tickMs = 1_000): Date {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), tickMs);
    return () => clearInterval(id);
  }, [tickMs]);

  return now;
}
