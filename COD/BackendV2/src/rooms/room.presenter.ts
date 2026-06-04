import { Room } from '../database/entities';

export type RoomResponse = {
  id: number;
  name: string;
  is_heating: boolean;
  offset_value: number;
  current_temp: number;
  temp_program_id: number | null;
};

export function presentRoom(room: Room): RoomResponse {
  return {
    id: room.id,
    name: room.name,
    is_heating: room.isHeating,
    offset_value: Number(room.offsetValue),
    current_temp: Number(room.currentTemp),
    temp_program_id: room.tempProgramId,
  };
}
