import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { LightZone } from './entities/light-zone.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateLightZoneDto } from './dto/create-light-zone.dto';
import { Room } from '../rooms/entities/room.entity';
import { GetLightZoneRequestDto } from './dto/get-light-zone-request.dto';
import { GetLightZonesRequestDto } from './dto/get-light-zones-request.dto';
import { UpdateLightZoneDto } from './dto/update-light-zone.dto';



@Injectable()
export class LightZonesService 
{
    constructor(
        @InjectRepository(LightZone)
        private readonly zone_repository: Repository<LightZone>,

        @InjectRepository(Room)
        private readonly room_repository: Repository<Room>,
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


    async updateZone(id: number, update_request: UpdateLightZoneDto) 
    {
        const zone = await this.zone_repository.findOne({ where: { id } })

        if (!zone)
            throw new NotFoundException(`Light zone with ID ${id} not found`);

        this.zone_repository.merge(zone, update_request);
        zone.last_changed_at = new Date();

        return await this.zone_repository.save(zone);
    }
}
