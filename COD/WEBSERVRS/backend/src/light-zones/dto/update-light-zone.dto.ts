import { Type } from "class-transformer";
import { IsBoolean, IsOptional } from "class-validator";



export class UpdateLightZoneDto 
{
    @IsBoolean()
    @IsOptional()
    @Type(() => Boolean)
    is_on?: boolean;
}