import { IsNumber, IsOptional, Min } from 'class-validator';

export class UpdateHomeSettingsDto
{
    @IsOptional()
    @IsNumber()
    @Min(0)
    histerezis?: number;

    @IsOptional()
    @IsNumber()
    @Min(0)
    antifreeze?: number;

    @IsOptional()
    @IsNumber()
    @Min(1)
    sampling_period?: number;

    @IsOptional()
    @IsNumber()
    @Min(1)
    fire_alert_celsius?: number;
}
