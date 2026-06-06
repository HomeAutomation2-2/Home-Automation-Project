import { Controller, Get, ParseIntPipe, Query } from '@nestjs/common';
import { TemperatureReadingsService } from './temperature-readings.service';



@Controller('temperature-readings')
export class TemperatureReadingsController 
{
    constructor(
        private readonly temperatureReadingsService: TemperatureReadingsService
    ) {}


    @Get()
    async getReadings(@Query('room_id', ParseIntPipe) roomId: number) 
    {
        return this.temperatureReadingsService.getReadings(roomId);
    }
}
