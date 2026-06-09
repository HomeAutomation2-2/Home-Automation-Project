/** Formatează ora curentă în română (HH:MM). */
export function formatHeatingClock(now: Date): string {
  return now.toLocaleTimeString("ro-RO", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

/** Eticheta „Actualizat la HH:MM” pentru ultimul fetch reușit. */
export function formatHeatingLastUpdated(at: Date): string {
  return `Actualizat la ${formatHeatingClock(at)}`;
}

/** Normalizează „HH:MM:SS” sau „HH:MM” la „HH:MM”. */
export function normalizeSlotTime(time: string): string {
  const parts = time.split(":");
  if (parts.length < 2) return time;
  return `${parts[0].padStart(2, "0")}:${parts[1].padStart(2, "0")}`;
}
