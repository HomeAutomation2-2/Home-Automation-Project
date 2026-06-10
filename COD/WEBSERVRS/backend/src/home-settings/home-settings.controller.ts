import { Controller, Get, Patch, Body, UseGuards } from '@nestjs/common';
import { HomeSettingsService } from './home-settings.service';
import { SessionGuard } from '../users/guards/session.guard';
import { AdminSessionGuard } from '../users/guards/admin-session.guard';
import { UpdateHomeSettingsDto } from './dto/update-home-settings.dto';

@Controller('home-settings')
export class HomeSettingsController
{
    constructor(private readonly settingsService: HomeSettingsService) {}

    @Get()
    @UseGuards(SessionGuard)
    async getSettings()
    {
        const settings = await this.settingsService.getSettings()
        return {
            histerezis: Number(settings.hysteresis),
            antifreeze: Number(settings.antifreezeTemp),
            sampling_period: settings.samplingPeriod,
            boiler_state: settings.boilerState,
            fire_alert_celsius: Number(settings.fireAlertCelsius),
        }
    }

    @Patch()
    @UseGuards(AdminSessionGuard)
    async updateSettings(@Body() body: UpdateHomeSettingsDto)
    {
        const saved = await this.settingsService.updateSettings({
            hysteresis: body.histerezis,
            antifreezeTemp: body.antifreeze,
            samplingPeriod: body.sampling_period,
            fireAlertCelsius: body.fire_alert_celsius,
        })
        return {
            histerezis: Number(saved.hysteresis),
            antifreeze: Number(saved.antifreezeTemp),
            sampling_period: saved.samplingPeriod,
            boiler_state: saved.boilerState,
            fire_alert_celsius: Number(saved.fireAlertCelsius),
        }
    }
}