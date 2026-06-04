import { LightZone } from '../database/entities';

export type LightZoneResponse = {
  id: number;
  room_id: number;
  name: string;
  is_on: boolean;
};

export function presentLightZone(zone: LightZone): LightZoneResponse {
  return {
    id: zone.id,
    room_id: zone.roomId,
    name: zone.name,
    is_on: zone.isOn,
  };
}
