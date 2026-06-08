import { Type } from 'class-transformer';
import { IsArray, IsBoolean, IsInt, IsNumber, ValidateNested } from 'class-validator';



export class RoomReadingDto 
{
    @IsInt()
    id!: number;

    @IsNumber()
    current_temp!: number;

    @IsBoolean()
    heating!: boolean;
}



export class SensorDataDto 
{
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => RoomReadingDto)
    rooms!: RoomReadingDto[];

    @IsBoolean()
    boiler!: boolean
}