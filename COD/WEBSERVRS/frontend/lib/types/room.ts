export type Room = {
  id: number;
  name: string;
  is_heating: boolean;
  offset_value: number;
  current_temp: number;
  temp_program_id: number | null;
};
