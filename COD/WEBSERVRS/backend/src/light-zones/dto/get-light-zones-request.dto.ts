import { Type } from "class-transformer";
import { IsNotEmpty, IsNumber, IsOptional } from "class-validator";



export class GetLightZonesRequestDto
{
    @IsNumber()
    @IsOptional()
    @Type(() => Number)
    room_id!: number
}