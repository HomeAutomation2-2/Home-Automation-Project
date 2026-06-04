import { IsBoolean, IsOptional, IsString, MinLength } from 'class-validator';

export class UpdateLightZoneDto {
  @IsBoolean()
  @IsOptional()
  is_on?: boolean;

  @IsString()
  @MinLength(1)
  @IsOptional()
  name?: string;
}
