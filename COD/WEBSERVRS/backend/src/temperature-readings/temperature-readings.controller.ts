import { Controller, Get, ParseIntPipe, Query, UseGuards } from '@nestjs/common';
import { TemperatureReadingsService } from './temperature-readings.service';
import { SessionGuard } from '../users/guards/session.guard';



@Controller('temperature-readings')
export class TemperatureReadingsController 
{
    constructor(
        private readonly temperatureReadingsService: TemperatureReadingsService
    ) {}


    @Get()
    @UseGuards(SessionGuard)
    async getReadings(@Query('room_id', ParseIntPipe) roomId: number) 
    {
        return this.temperatureReadingsService.getReadings(roomId);
    }
}
