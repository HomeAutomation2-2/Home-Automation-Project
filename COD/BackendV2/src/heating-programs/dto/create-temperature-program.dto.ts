import { IsArray, IsNotEmpty, IsString } from 'class-validator';
import { ProgramPeriod } from '../../database/entities';

export class CreateTemperatureProgramDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsArray()
  schedule!: ProgramPeriod[];
}
