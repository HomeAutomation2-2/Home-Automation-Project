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
                antifreezeTemp: 7.00
            })

            await this.settingsRepository.save(settings)
        }
        
        return settings
    }


    async updateSettings(hysteresis: number, antifreezeTemp: number, samplingPeriod: number): Promise<HomeSettings> 
    {
        let settings = await this.settingsRepository.findOne({ where: { id: 1 } })

        if (!settings) 
        {
            settings = this.settingsRepository.create({ id: 1, hysteresis, antifreezeTemp, samplingPeriod })
        } 
        else 
        {
            settings.hysteresis     = hysteresis
            settings.antifreezeTemp = antifreezeTemp
            settings.samplingPeriod = samplingPeriod
        }

        const saved = await this.settingsRepository.save(settings)

        this.tempScheduler.restartInterval(saved.samplingPeriod)

        return saved
    }
}