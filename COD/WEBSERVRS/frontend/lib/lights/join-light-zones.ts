import type { LightZone } from "@/lib/types/light-zone";
import type { Room } from "@/lib/types/room";

export type LightZoneForDisplay = LightZone & {
  room_name: string;
};

export type LightZoneRoomGroup = {
  room_id: number;
  room_name: string;
  zones: LightZoneForDisplay[];
};

export function joinLightZonesWithRooms(
  zones: LightZone[],
  rooms: Room[],
): LightZoneForDisplay[] {
  const roomById = new Map(rooms.map((r) => [r.id, r.name]));

  return zones.map((zone) => ({
    ...zone,
    room_name: roomById.get(zone.room_id) ?? "Cameră necunoscută",
  }));
}

export function groupZonesByRoom(zones: LightZoneForDisplay[]): LightZoneRoomGroup[] {
  const byRoom = new Map<number, LightZoneForDisplay[]>();

  for (const zone of zones) {
    const list = byRoom.get(zone.room_id) ?? [];
    list.push(zone);
    byRoom.set(zone.room_id, list);
  }

  return [...byRoom.entries()]
    .map(([room_id, roomZones]) => ({
      room_id,
      room_name: roomZones[0]?.room_name ?? "Cameră necunoscută",
      zones: roomZones.sort((a, b) => a.name.localeCompare(b.name, "ro")),
    }))
    .sort((a, b) => a.room_name.localeCompare(b.room_name, "ro"));
}
