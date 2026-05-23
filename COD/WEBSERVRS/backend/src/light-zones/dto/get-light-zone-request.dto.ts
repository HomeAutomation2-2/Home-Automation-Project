import { Type } from "class-transformer";
import { IsNotEmpty, IsNumber } from "class-validator";



export class GetLightZoneRequestDto
{
    @IsNumber()
    @IsNotEmpty()
    @Type(() => Number)
    id!: number
}