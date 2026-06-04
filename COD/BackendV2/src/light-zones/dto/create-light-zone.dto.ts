import { IsInt, IsString, MinLength } from 'class-validator';

export class CreateLightZoneDto {
  @IsString()
  @MinLength(1)
  name!: string;

  @IsInt()
  room_id!: number;
}
