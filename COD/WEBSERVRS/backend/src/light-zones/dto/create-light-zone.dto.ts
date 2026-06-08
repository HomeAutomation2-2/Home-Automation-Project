import { Type } from "class-transformer";
import { IsNotEmpty, IsNumber, IsString } from "class-validator";



export class CreateLightZoneDto
{
    @IsNumber()
    @IsNotEmpty()
    @Type(() => Number)
    room_id!: number

    @IsString()
    @IsNotEmpty()
    name!: string
}