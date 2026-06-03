import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HomeSettings } from './entities/home-settings.entity';



@Injectable()
export class HomeSettingsService 
{
    constructor(
        @InjectRepository(HomeSettings)
        private readonly settingsRepository: Repository<HomeSettings>,
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


    async updateSettings(hysteresis: number, antifreezeTemp: number): Promise<HomeSettings> 
    {
        let settings = await this.settingsRepository.findOne({ where: { id: 1 } })

        if (!settings) 
        {
            settings = this.settingsRepository.create({ id: 1, hysteresis, antifreezeTemp })
        } 
        else 
        {
            settings.hysteresis = hysteresis
            settings.antifreezeTemp = antifreezeTemp
        }

        return this.settingsRepository.save(settings)
    }
}