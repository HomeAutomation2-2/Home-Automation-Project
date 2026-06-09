import { IsInt, IsNumber, Min } from 'class-validator';

export class CreateHeatingOverrideDto {
    @IsNumber()
    @Min(1)
    program_id!: number;

    /** 0 = until cancelled */
    @IsInt()
    @Min(0)
    duration_minutes!: number;
}
