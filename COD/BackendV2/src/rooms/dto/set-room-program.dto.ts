import { IsInt, IsOptional } from 'class-validator';

export class SetRoomProgramDto {
  @IsInt()
  @IsOptional()
  temp_program_id!: number | null;
}
