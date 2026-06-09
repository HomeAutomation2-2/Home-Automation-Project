import { IsInt, IsNumber, IsOptional, Max, Min } from 'class-validator';

export class UpdateRoomDto {
    @IsOptional()
    @IsNumber()
    @Min(-5)
    @Max(5)
    offset_value?: number;

    @IsOptional()
    @IsInt()
    @Min(1)
    @Max(60)
    sampling_minutes?: number;
}
