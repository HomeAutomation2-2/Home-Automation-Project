import type { TemperaturePoint } from "@/lib/temperature/types";
import type { Room } from "@/lib/types/room";

/**
 * MVP: un singur punct din `current_temp` când GET /temperature-readings lipsește.
 * Înlocuiește cu răspunsul API când endpoint-ul va fi expus.
 */
export function buildMvpTemperaturePoints(room: Room | null): TemperaturePoint[] {
  if (!room) return [];

  const now = new Date();
  return [
    {
      time: now.toISOString(),
      value: Number(room.current_temp),
      label: now.toLocaleString("ro-RO", {
        day: "numeric",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      }),
    },
  ];
}
