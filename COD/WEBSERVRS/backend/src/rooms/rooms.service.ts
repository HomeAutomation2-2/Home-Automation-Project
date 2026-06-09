import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateRoomDto } from './dto/create-room.dto';
import { UpdateRoomDto } from './dto/update-room.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Room } from './entities/room.entity';
import { Repository } from 'typeorm';
import { TemperatureProgram } from '../temperature-programs/entities/temperature-program.entity';



@Injectable()
export class RoomsService 
{
    constructor(
        @InjectRepository(Room)
        private readonly room_repository: Repository<Room>,

        @InjectRepository(TemperatureProgram)
        private readonly programRepository: Repository<TemperatureProgram>,
    ) {}


    /**
     * Get all rooms.
     * @returns A list of all rooms.
     */
    async findAll(): Promise<Room[]>
    {
        return this.room_repository.find()
    }


    /**
     * Create a new room.
     * @param room_request The new room data.
     * @returns The new room created.
     */
    async createRoom(room_request: CreateRoomDto)
    {
        const existing_room = await this.room_repository.findOne({
            where: { name: room_request.name}
        })

        if (existing_room)
            throw new ConflictException("A room with this name already exists")

        const room = this.room_repository.create(room_request)
        const new_room = await this.room_repository.save(room)

        return new_room
    }


    async getRoom(room_id: number)
    {
        const room = await this.room_repository.findOne({
            where: { id: room_id }
        })

        if (!room)
            throw new NotFoundException(`The room with ID ${room_id} does not exist`)

        return room
    }


    async setTempProgramId(room_id: number, program_id: number|null)
    {
        if (program_id !== null)
        {
            const program = await this.programRepository.findOne({ where: { id: program_id } })
    
            if (!program) 
                throw new NotFoundException(`Program with ID ${program_id} not found`)
        }

        const result = await this.room_repository.update(room_id, {
            temp_program_id: program_id
        })

        if (result.affected === 0)
            throw new NotFoundException(`Room with ID ${room_id} not found`)

        return { success: true }
    }

    async updateRoom(room_id: number, update: UpdateRoomDto): Promise<Room> {
        const room = await this.getRoom(room_id);

        if (update.offset_value !== undefined) {
            room.offset_value = update.offset_value;
        }
        if (update.sampling_minutes !== undefined) {
            room.sampling_minutes = update.sampling_minutes;
        }

        return this.room_repository.save(room);
    }
}
