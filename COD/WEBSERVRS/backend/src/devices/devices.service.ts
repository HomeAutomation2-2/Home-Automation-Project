import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Not, Repository } from 'typeorm';
import { Device } from './entities/device.entity';
import { RegisterDeviceDto } from './dto/create-device.dto';
import { User } from '../users/entities/user.entity';
import { HomeSettings } from '../home-settings/entities/home-settings.entity';
import { SensorDataDto } from './dto/sensors-data.dto';
import { Room } from '../rooms/entities/room.entity';
import { TemperatureReading } from '../temperature-readings/entities/temperature-reading.entity';
import { BoilerEvent } from '../events/entities/boiler-event.entity';
import { Period, TimeSlot } from '../temperature-programs/entities/temperature-program.entity';
import { Cron, CronExpression } from '@nestjs/schedule';



type TempProgram = {
    id: number
    name: string
    schedule: Period[]
}



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

        @InjectRepository(BoilerEvent)
        private boilerEventsRepository: Repository<BoilerEvent>,
    ) {}


    /**
     * Register a new ESP device with the server.
     */
    async register(dto: RegisterDeviceDto): Promise<any> 
    {
        console.log(`secret: ${process.env.DEVICE_SECRET}`)

        if (dto.secret !== process.env.DEVICE_SECRET) 
        {
            console.log("[REGISTER-DEVICE] secret invalid!")
            throw new UnauthorizedException('Secret invalid')
        }

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

        console.log(`[REGISTER-DEVICE] device registered on ${dto.ip}`)

        return {
            status: 'ok',
            hysteresis: settings?.hysteresis || 0,
            bt_codes: btCodes,
            sampling_period: settings?.samplingPeriod || 60,
            lights: lights.map(lz => ({
                zone_id: lz.zone_id,
                state: lz.state
            })),
            rooms: rooms.map(r => ({
                id:          r.id,
                target_temp: 0,
                offset:      Number(r.offset_value),
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

        const settings = await this.settingsRepository.findOne({ where: { id: 1 } })
        const rooms = await this.roomsRepository.find({
            order: { id: 'ASC' },
            take: 2,
            relations: { tempProgram: true }
        })

        const payload = {
            rooms: rooms.map(room => ({
                id: room.id,
                target_temp: this.resolveTargetTemp(room, room.tempProgram, settings?.antifreezeTemp || 0),
                offset: Number(room.offset_value),
            }))
        }

        console.log('[TARGET-TEMP] Pushing:', payload)

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


    private resolveTargetTemp(
        room: Room,
        program: TempProgram | null,
        antifreezeTemp: number,
    ): number {
        if (!program) return 0

        const now   = new Date()
        const today = now.getDay() // 0=Sun, 6=Sat
        const nowMinutes = now.getHours() * 60 + now.getMinutes()

        const toMinutes = (time: string) => {
            const [h, m] = time.split(':').map(Number)
            return h * 60 + m
        }

        // Find period for today
        let period = program.schedule.find(p => p.days.includes(today))

        // Active slot = last slot whose time <= now
        const findActiveSlot = (p: Period): TimeSlot | null => {
            const sorted = [...p.slots].sort((a, b) => toMinutes(a.time) - toMinutes(b.time))
            let active: TimeSlot | null = null
            for (const slot of sorted) {
                if (toMinutes(slot.time) <= nowMinutes) active = slot
            }
            return active
        }

        let activeSlot: TimeSlot | null = period ? findActiveSlot(period) : null

        // If no active slot (before first slot today), walk back through previous days
        if (!activeSlot) {
            for (let i = 1; i <= 6; i++) {
                const prevDay = ((today - i) + 7) % 7
                const prevPeriod = program.schedule.find(p => p.days.includes(prevDay))
                if (prevPeriod) {
                    const sorted = [...prevPeriod.slots].sort(
                        (a, b) => toMinutes(a.time) - toMinutes(b.time)
                    )
                    activeSlot = sorted[sorted.length - 1] ?? null
                    if (activeSlot) break
                }
            }
        }

        if (!activeSlot) return 0

        if (activeSlot.temp === 'off')        return 0
        if (activeSlot.temp === 'antifreeze') return Number(antifreezeTemp)
        return Number(activeSlot.temp)
    }


    async getHomeSettings(): Promise<HomeSettings> 
    {
        const s = await this.settingsRepository.findOne({ where: { id: 1 } })
        if (!s) throw new Error('No home_settings row found')
        return s
    }

    /**
     * Updates the BT codes on the ESP when a user was created/suspended/reactivated/deleted.
     */
    async pushBtCodes(): Promise<void> 
    {
        const devices = await this.devicesRepository.find({
            order: { lastSeen: 'DESC' },
            take: 1,
        })
        const device = devices[0]

        if (!device) 
        {
            console.log('[BT-CODES] No device registered.')
            return
        }

        const users = await this.usersRepository.find({
            where: { 
                isSuspended: false, 
                btCodeHash: Not(IsNull()) 
            },
            select: { btCodeHash: true },
        })

        const payload = { bt_codes: users.map(u => u.btCodeHash!) }

        console.log(`[BT-CODES] Pushing ${payload.bt_codes.length} codes`)

        try {
            const controller = new AbortController()
            const timeoutId = setTimeout(() => controller.abort(), 5000)

            const response = await fetch(`http://${device.ip}/update-codes`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'x-device-secret': process.env.DEVICE_SECRET ?? ""
                },
                body: JSON.stringify(payload),
                signal: controller.signal
            })

            clearTimeout(timeoutId)

            if (!response.ok)
                throw new Error(`HTTP status ${response.status}`)

            const resBody = await response.json().catch(() => ({}));
            console.log('[BT-CODES] Push OK. ESP Response:', resBody);
        } 
        catch (err) {
            const message = err instanceof Error && err.name === 'AbortError' 
                ? 'Request timed out after 5000ms' 
                : (err as Error).message

            console.warn('[BT-CODES] ESP unreachable:', message)
        }
    }
}