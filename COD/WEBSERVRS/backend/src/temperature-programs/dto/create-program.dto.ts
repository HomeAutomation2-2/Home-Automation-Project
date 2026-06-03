import { Type } from 'class-transformer';
import { IsString, IsNumber, IsArray, IsNotEmpty, ValidateNested } from 'class-validator';



export class TimeSlotDto 
{
    @IsString()
    @IsNotEmpty()
    time!: string  // 06:00

    @IsNotEmpty()
    temp!: number | 'off' | 'antifreeze'
}


export class PeriodDto 
{
    @IsArray()
    @IsNumber({}, { each: true })
    days!: number[] // [0, 1, 2, 3, 4]

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => TimeSlotDto)
    slots!: TimeSlotDto[]
}


export class CreateTemperatureProgramDto 
{
    @IsString()
    @IsNotEmpty()
    name!: string

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => PeriodDto)
    schedule!: PeriodDto[]
}