import { Controller, Get, Patch, Body, UseGuards } from '@nestjs/common';
import { HomeSettingsService } from './home-settings.service';
import { SessionGuard } from '../users/guards/session.guard';



@Controller('home-settings')
export class HomeSettingsController 
{
    constructor(private readonly settingsService: HomeSettingsService) {}


    @Get()
    @UseGuards(SessionGuard)
    async getSettings() 
    {
        return this.settingsService.getSettings()
    }


    @Patch()
    @UseGuards(SessionGuard)
    async updateSettings(
        @Body('histerezis') hysteresis: number,
        @Body('antifreeze') antifreezeTemp: number,
    ) {
        return this.settingsService.updateSettings(hysteresis, antifreezeTemp)
    }
}