import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Device } from './entities/device.entity';
import { RegisterDeviceDto } from './dto/create-device.dto';
import { User } from '../users/entities/user.entity';
import { HomeSettings } from '../home-settings/entities/home-settings.entity';
import { SensorDataDto } from './dto/sensors-data.dto';
import { Room } from '../rooms/entities/room.entity';
import { TemperatureReading } from '../temperature-readings/entities/temperature-reading.entity';
import { LightZone } from '../light-zones/entities/light-zone.entity';
import { BoilerEvent } from '../events/entities/boiler-event.entity';



@Injectable()
export class DevicesService 
{
    constructor(
        @InjectRepository(Device)
        private devicesRepository: Repository<Device>,

        @InjectRepository(User)
        private usersRepository: Repository<User>,
        
        @InjectRepository(HomeSettings)
        private settingsRepository: Repository<HomeSettings>,

        @InjectRepository(Room)
        private roomsRepository: Repository<Room>,

        @InjectRepository(TemperatureReading)
        private temperatureReadingsRepository: Repository<TemperatureReading>,

        @InjectRepository(LightZone)
        private lightZonesRepository: Repository<LightZone>,

        @InjectRepository(BoilerEvent)
        private boilerEventsRepository: Repository<BoilerEvent>,
    ) {}


    /**
     * Register a new ESP device with the server.
     */
    async register(dto: RegisterDeviceDto): Promise<any> 
    {
        if (dto.secret !== process.env.DEVICE_SECRET) 
            throw new UnauthorizedException('Secret invalid')

        const device = this.devicesRepository.create({ ip: dto.ip })
        await this.devicesRepository.save(device)

        const activeUsers = await this.usersRepository.find({
            where: { isSuspended: false },
            select: {
                btCodeHash: true,
                btCodeEpoch: true,
            },
        })

        const btCodes = activeUsers
            .filter(user => user.btCodeHash)
            .map(user => user.btCodeHash)

        const settings = await this.settingsRepository.findOne({ where: {} });
        
        const rooms = await this.roomsRepository.find({
            order: { id: 'ASC' },
            take: 2,
            relations: { lightZones: true }
        })

        const lights = rooms.map(room => {
            const zone = room.lightZones.sort((a, b) => a.id - b.id)[0]
            return { zone_id: zone.id, state: zone.is_on }
        })

        return {
            status: 'ok',
            hysteresis: settings?.hysteresis || 0,
            bt_codes: btCodes,
            sampling_period: settings?.samplingPeriod || 60,
            lights: lights.map(lz => ({
                zone_id: lz.zone_id,
                state: lz.state
            }))
        }  
    }


    async updateSensorData(dto: SensorDataDto): Promise<void> 
    {
        for (const reading of dto.rooms) 
        {
            await this.roomsRepository.update(reading.id, {
                current_temp: reading.current_temp,
                is_heating:   reading.heating,
            })

            await this.temperatureReadingsRepository.insert({
                loopId: reading.id,
                value:  reading.current_temp,
            })
        }

        const settings = await this.settingsRepository.findOne({ where: {} })
        const previousBoilerState = settings?.boilerState ?? false
        const newBoilerState = dto.boiler

        if (newBoilerState !== previousBoilerState) 
        {
            await this.settingsRepository.update({}, { boilerState: newBoilerState })
            await this.boilerEventsRepository.insert({ newState: newBoilerState })
            console.log(`[BOILER] State changed → ${newBoilerState ? 'ON' : 'OFF'}`)
        }
    }
}