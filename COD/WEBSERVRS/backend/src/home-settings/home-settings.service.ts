import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HomeSettings } from './entities/home-settings.entity';
import { TempSchedulerService } from '../devices/temp-scheduler.service';



@Injectable()
export class HomeSettingsService 
{
    constructor(
        @InjectRepository(HomeSettings)
        private readonly settingsRepository: Repository<HomeSettings>,

        private readonly tempScheduler: TempSchedulerService,
    ) {}


    async getSettings(): Promise<HomeSettings> 
    {
        let settings = await this.settingsRepository.findOne({ where: { id: 1 } })
        
        if (!settings) 
        {
            settings = this.settingsRepository.create({
                id: 1,
                hysteresis: 0.00,
                antifreezeTemp: 7.00,
                samplingPeriod: 60,
                boilerState: false,
                fireAlertCelsius: 45.00,
            })

            await this.settingsRepository.save(settings)
        }
        
        return settings
    }


    async updateSettings(data: {
        hysteresis?: number;
        antifreezeTemp?: number;
        samplingPeriod?: number;
        fireAlertCelsius?: number;
    }): Promise<HomeSettings>
    {
        let settings = await this.settingsRepository.findOne({ where: { id: 1 } })

        if (!settings)
        {
            settings = this.settingsRepository.create({
                id: 1,
                hysteresis: data.hysteresis ?? 0.00,
                antifreezeTemp: data.antifreezeTemp ?? 7.00,
                samplingPeriod: data.samplingPeriod ?? 60,
                boilerState: false,
                fireAlertCelsius: data.fireAlertCelsius ?? 45.00,
            })
        }
        else
        {
            if (data.hysteresis !== undefined)
                settings.hysteresis = data.hysteresis
            if (data.antifreezeTemp !== undefined)
                settings.antifreezeTemp = data.antifreezeTemp
            if (data.samplingPeriod !== undefined)
                settings.samplingPeriod = data.samplingPeriod
            if (data.fireAlertCelsius !== undefined)
                settings.fireAlertCelsius = data.fireAlertCelsius
        }

        const saved = await this.settingsRepository.save(settings)

        if (data.samplingPeriod !== undefined)
            this.tempScheduler.restartInterval(saved.samplingPeriod)

        return saved
    }
}