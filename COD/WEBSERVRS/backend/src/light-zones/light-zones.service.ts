import { BadRequestException, ConflictException, Injectable, NotFoundException, ServiceUnavailableException } from '@nestjs/common';
import { LightZone } from './entities/light-zone.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateLightZoneDto } from './dto/create-light-zone.dto';
import { Room } from '../rooms/entities/room.entity';
import { GetLightZoneRequestDto } from './dto/get-light-zone-request.dto';
import { GetLightZonesRequestDto } from './dto/get-light-zones-request.dto';
import { UpdateLightZoneDto } from './dto/update-light-zone.dto';
import { DevicesService } from '../devices/devices.service';
import { LightEvent } from '../events/entities/light-event.entity';
import { User } from '../users/entities/user.entity';



@Injectable()
export class LightZonesService 
{
    constructor(
        @InjectRepository(LightZone)
        private readonly zone_repository: Repository<LightZone>,

        @InjectRepository(Room)
        private readonly room_repository: Repository<Room>,

        @InjectRepository(LightEvent)
        private readonly light_event_repository: Repository<LightEvent>,

        private readonly devicesService: DevicesService
    ) {}


    async getZone(zone_request: GetLightZoneRequestDto)
    {
        const zone = await this.zone_repository.findOne({
            where: { id: zone_request.id }
        })

        if (!zone)
            throw new NotFoundException("Could not find light zone with this id")

        return zone
    }


    async getZones(zones_request: GetLightZonesRequestDto)
    {
        if (!zones_request.room_id)
            return this.zone_repository.find();

        const room_exists = await this.room_repository.exists({ 
            where: { id: zones_request.room_id } 
        })
    
        if (!room_exists) 
            throw new NotFoundException("The specified room does not exist")

        const rooms = this.zone_repository.find({
            where: { room_id: zones_request.room_id }
        })

        return rooms
    }


    async createZone(zone_request: CreateLightZoneDto)
    {
        const room = await this.room_repository.findOne({
            where: { id: zone_request.room_id }
        })

        if (!room)
            throw new BadRequestException("The parent room does not exist")

        const existing_zone = await this.zone_repository.findOne({
            where: {
                name: zone_request.name,
                room_id: zone_request.room_id
            }
        })

        if (existing_zone)
            throw new ConflictException("A zone with this name exists in this room")

        const zone = this.zone_repository.create(zone_request)
        const new_zone = await this.zone_repository.save(zone)

        return new_zone
    }


    async updateZone(id: number, update_request: UpdateLightZoneDto, user: User) 
    {
        const zone = await this.zone_repository.findOne({ where: { id } })

        if (!zone)
            throw new NotFoundException(`Light zone with ID ${id} not found`)

        const stateChanged = update_request.is_on !== undefined && update_request.is_on !== zone.is_on

        if (stateChanged) 
        {
            const success = await this.devicesService.pushLightCommand(id, update_request.is_on!)
            
            if (!success)
                throw new ServiceUnavailableException("Failed to communicate with the ESP. State not changed.")
        }

        this.zone_repository.merge(zone, update_request)
        const saved = await this.zone_repository.save(zone)

        if (stateChanged) 
        {
            await this.light_event_repository.save({
                zoneId: id,
                newState: update_request.is_on!,
                userId: user.id
            })
            console.log("Hardware updated and light event saved securely.")
        }

        return saved
    }


    async toggleZone(zoneId: number): Promise<void> 
    {
        const zone = await this.zone_repository.findOne({ where: { id: zoneId } })

        if (!zone)
            throw new NotFoundException('Zone not found')

        console.log(`[ESP-LIGHT-ZONE] light physically toggled`)

        zone.is_on = !zone.is_on
        zone.last_changed_at = new Date()
        await this.zone_repository.save(zone)

        await this.light_event_repository.save({
            zoneId: zoneId,
            userId: null,
            newState: zone.is_on
        })
    }
}

