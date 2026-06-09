import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, BadRequestException, UseGuards } from '@nestjs/common';
import { RoomsService } from './rooms.service';
import { CreateRoomDto } from './dto/create-room.dto';
import { SessionGuard } from '../users/guards/session.guard';



@Controller('rooms')
export class RoomsController 
{
    constructor(private readonly roomsService: RoomsService) {}


    @Post()
    @UseGuards(SessionGuard)
    create(@Body() room_request: CreateRoomDto) 
    {
        return this.roomsService.createRoom(room_request)
    }


    @Get()
    @UseGuards(SessionGuard)
    findAll() 
    {
        return this.roomsService.findAll()
    }


    @Get(':id')
    @UseGuards(SessionGuard)
    findOne(@Param('id', ParseIntPipe) id: number) 
    {
        return this.roomsService.getRoom(id)
    }


    /* Update the room temp program ID */
    @Patch(":id/temp-program")
    @UseGuards(SessionGuard)
    setTempProgramId(
        @Param("id", ParseIntPipe) id: number,
        @Body("temp_program_id") program_id: number | null, 
    ) {
        if (program_id !== null && isNaN(Number(program_id))) 
            throw new BadRequestException('`temp_program_id` must be a number or null')

        const clean_program_id = program_id !== null ? Number(program_id) : null
        
        return this.roomsService.setTempProgramId(id, clean_program_id)
    }

    
    @Patch(':id/offset')
    @UseGuards(SessionGuard)
    async updateRoomOffset(
        @Param('id', ParseIntPipe) roomId: number,
        @Body('offset') offset: number
    ) {
        return this.roomsService.updateOffset(roomId, offset);
    }
}
