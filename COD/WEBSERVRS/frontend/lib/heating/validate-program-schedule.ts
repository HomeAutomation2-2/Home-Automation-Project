import type { Period } from "@/lib/types/period";

function timeToMinutes(timeStr: string): number {
  const [hours, minutes] = timeStr.split(":").map(Number);
  return hours * 60 + minutes;
}

export function validateProgramSchedule(
  name: string,
  periods: Period[],
): string | null {
  if (!name.trim()) return "Introdu numele programului.";

  if (periods.length === 0) return "Adaugă cel puțin o perioadă.";

  for (let i = 0; i < periods.length; i += 1) {
    const period = periods[i];
    if (period.days.length === 0) {
      return `Perioada ${i + 1}: selectează cel puțin o zi.`;
    }
    if (period.slots.length === 0) {
      return `Perioada ${i + 1}: adaugă cel puțin un interval orar.`;
    }
    if (period.slots.length > 4) {
      return `Perioada ${i + 1}: maximum 4 intervale pe grup de zile.`;
    }

    const times = period.slots.map((s) => s.time);
    const hasDuplicates = times.some((t, idx) => times.indexOf(t) !== idx);
    if (hasDuplicates) {
      return `Perioada ${i + 1}: intervalele orare trebuie să fie diferite.`;
    }

    for (const slot of period.slots) {
      if (!slot.time.match(/^\d{2}:\d{2}$/)) {
        return `Perioada ${i + 1}: format oră invalid (HH:MM).`;
      }
      if (
        slot.temp !== "off" &&
        slot.temp !== "antifreeze" &&
        (typeof slot.temp !== "number" || Number.isNaN(slot.temp))
      ) {
        return `Perioada ${i + 1}: temperatura este obligatorie.`;
      }
    }

    const sorted = [...period.slots].sort(
      (a, b) => timeToMinutes(a.time) - timeToMinutes(b.time),
    );
    for (let s = 1; s < sorted.length; s += 1) {
      if (timeToMinutes(sorted[s].time) === timeToMinutes(sorted[s - 1].time)) {
        return `Perioada ${i + 1}: intervale orare suprapuse.`;
      }
    }
  }

  return null;
}

export function defaultWeekdayPeriod(): Period {
  return {
    days: [0, 1, 2, 3, 4],
    slots: [
      { time: "06:00", temp: 21 },
      { time: "22:00", temp: 19 },
    ],
  };
}
