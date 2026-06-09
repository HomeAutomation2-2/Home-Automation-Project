import { normalizeSlotTime } from "@/lib/heating/format-heating-time";
import type { Room } from "@/lib/types/room";
import type { TempProgram } from "@/lib/types/temp-program";
import type { TimeSlot } from "@/lib/types/time-slot";

export type RoomForDisplay = Room & {
  program_name: string | null;
  target_temp: number | null;
  /** Ora de start a intervalului activ din program (HH:MM). */
  active_slot_since: string | null;
  /** Următoarea schimbare de țintă astăzi (HH:MM), dacă există. */
  next_change_at: string | null;
};

export type SlotScheduleInfo = {
  active_slot_since: string | null;
  next_change_at: string | null;
};

export const DAY_NAMES = ["Lun", "Mar", "Mie", "Joi", "Vin", "Sâm", "Dum"];

function timeToMinutes(timeStr: string): number {
  const [hours, minutes] = timeStr.split(":").map(Number);
  return hours * 60 + minutes;
}

function parseTemp(t: number | "off" | "antifreeze"): number {
  if (t === "off") return 4.0;
  if (t === "antifreeze") return 7.0;
  return t;
}

function getCurrentDayIndex(now: Date): number {
  const jsDay = now.getDay();
  return jsDay === 0 ? 6 : jsDay - 1;
}

function getActiveSlot(program: TempProgram, now: Date): TimeSlot | null {
  const currentDay = getCurrentDayIndex(now);
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const period = program.schedule.find((p) => p.days.includes(currentDay));
  if (!period || period.slots.length === 0) return null;

  const sortedSlots = [...period.slots].sort(
    (a, b) => timeToMinutes(a.time) - timeToMinutes(b.time),
  );

  let activeIndex = sortedSlots.length - 1;
  for (let i = sortedSlots.length - 1; i >= 0; i -= 1) {
    if (timeToMinutes(sortedSlots[i].time) <= currentMinutes) {
      activeIndex = i;
      break;
    }
  }

  return sortedSlots[activeIndex];
}

export function getSlotScheduleInfo(
  program: TempProgram,
  now = new Date(),
): SlotScheduleInfo {
  const currentDay = getCurrentDayIndex(now);
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const period = program.schedule.find((p) => p.days.includes(currentDay));
  if (!period || period.slots.length === 0) {
    return { active_slot_since: null, next_change_at: null };
  }

  const sortedSlots = [...period.slots].sort(
    (a, b) => timeToMinutes(a.time) - timeToMinutes(b.time),
  );

  let activeIndex = sortedSlots.length - 1;
  for (let i = sortedSlots.length - 1; i >= 0; i -= 1) {
    if (timeToMinutes(sortedSlots[i].time) <= currentMinutes) {
      activeIndex = i;
      break;
    }
  }

  const active_slot_since = normalizeSlotTime(sortedSlots[activeIndex].time);
  const next_change_at =
    activeIndex < sortedSlots.length - 1
      ? normalizeSlotTime(sortedSlots[activeIndex + 1].time)
      : null;

  return { active_slot_since, next_change_at };
}

export function formatDisplayTemp(value: number): string {
  return Number.isFinite(value) ? `${value.toFixed(1)}°C` : "—";
}

export function getCurrentProgramTemp(
  program: TempProgram,
  now = new Date(),
): number | null {
  const slot = getActiveSlot(program, now);
  return slot ? parseTemp(slot.temp) : null;
}

export function getProgramName(
  programs: TempProgram[],
  programId: number | null,
): string | null {
  if (programId === null) return null;
  return programs.find((p) => p.id === programId)?.name ?? null;
}

export function joinRoomsWithPrograms(
  rooms: Room[],
  programs: TempProgram[],
  now = new Date(),
): RoomForDisplay[] {
  return rooms.map((room) => {
    const program =
      room.temp_program_id !== null
        ? programs.find((p) => p.id === room.temp_program_id)
        : undefined;

    if (!program) {
      return {
        ...room,
        current_temp: Number(room.current_temp),
        offset_value: Number(room.offset_value),
        program_name: null,
        target_temp: null,
        active_slot_since: null,
        next_change_at: null,
      };
    }

    const schedule = getSlotScheduleInfo(program, now);

    return {
      ...room,
      current_temp: Number(room.current_temp),
      offset_value: Number(room.offset_value),
      program_name: program.name,
      target_temp: getCurrentProgramTemp(program, now),
      active_slot_since: schedule.active_slot_since,
      next_change_at: schedule.next_change_at,
    };
  });
}
