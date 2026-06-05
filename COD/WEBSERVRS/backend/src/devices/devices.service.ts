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
import { Period } from '../temperature-programs/entities/temperature-program.entity';
import { Cron, CronExpression } from '@nestjs/schedule';




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
            if (settings) 
            {
                settings.boilerState = newBoilerState;
                await this.settingsRepository.save(settings)
            } 
            else 
            {
                await this.settingsRepository.insert({ boilerState: newBoilerState })
            }

            await this.boilerEventsRepository.insert({ newState: newBoilerState })

            console.log(`[BOILER] State changed → ${newBoilerState ? 'ON' : 'OFF'}`)
        }
    }


    async pushTargetTemps(): Promise<void>
    {
        const devices = await this.devicesRepository.find({ 
            order: { lastSeen: 'DESC' },
            take: 1 
        })
        const device = devices[0]

        if (!device) 
        {
            console.log('[TARGET-TEMP] No device registered.')
            return
        }

        const settings = await this.settingsRepository.findOne({ where: {} })
        const rooms = await this.roomsRepository.find({
            order: { id: 'ASC' },
            take: 2,
            relations: { tempProgram: true }
        })

        const now = new Date()
        const payload = {
            rooms: rooms.map(room => ({
                id: room.id,
                target_temp: this.resolveTargetTemp(room, now, settings?.antifreezeTemp || 0)
            }))
        }

        try {
            const response = await fetch(`http://${device.ip}/target-temp`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'x-device-secret': process.env.DEVICE_SECRET ?? ""
                },
                body: JSON.stringify(payload)
            })

            const body = await response.json()
            console.log(`[TARGET-TEMP] ESP boiler state: ${body.boiler}`)
        } 
        catch (e) {
            console.log('[TARGET-TEMP] Failed to reach ESP:', (e as Error).message)
        }
    }


    private resolveTargetTemp(room: Room, now: Date, antifreezeTemp: number): number
    {
        if (!room.tempProgram?.schedule) return 0

        const day = now.getDay()  // 0 = Sunday
        const currentMinutes = now.getHours() * 60 + now.getMinutes()

        const periods: Period[] = room.tempProgram.schedule
        const todayPeriod = periods.find(p => p.days.includes(day))

        if (!todayPeriod) return 0

        // Find the last slot that started before now
        const slots = [...todayPeriod.slots].sort((a, b) => 
            this.timeToMinutes(a.time) - this.timeToMinutes(b.time)
        )

        let activeSlot = slots.findLast(slot => 
            this.timeToMinutes(slot.time) <= currentMinutes
        )

        if (!activeSlot) return 0

        if (activeSlot.temp === 'off')        return 0
        if (activeSlot.temp === 'antifreeze') return antifreezeTemp + room.offset_value
        
        return (activeSlot.temp as number) + room.offset_value
    }


    private timeToMinutes(time: string): number
    {
        const [h, m] = time.split(':').map(Number)
        return h * 60 + m
    }


    @Cron(CronExpression.EVERY_MINUTE)
    async handleTempCron(): Promise<void>
    {
        const settings = await this.settingsRepository.findOne({ where: {} })
        const period = settings?.samplingPeriod || 60

        const now = Math.floor(Date.now() / 1000)
        if (now % period === 0) 
        {
            await this.pushTargetTemps()
        }
    }


    async pushLightCommand(zoneId: number, state: boolean): Promise<boolean>
    {
        const devices = await this.devicesRepository.find({ 
            order: { lastSeen: 'DESC' },
            take: 1 
        })
        const device = devices[0]

        if (!device) {
            console.log('[LIGHT-CHANGE] No device registered.')
            return false
        }

        try {
            const response = await fetch(`http://${device.ip}/light`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'x-device-secret': process.env.DEVICE_SECRET ?? ""
                },
                body: JSON.stringify({ zone_id: zoneId, state })
            })

            const body = await response.json()
            console.log(`[LIGHT] ESP confirmed zone ${body.zone_id} → ${body.state}`)
            return true
        } 
        catch (e) {
            console.log('[LIGHT] Failed to reach ESP:', (e as Error).message)
            return false
        }
    }
}