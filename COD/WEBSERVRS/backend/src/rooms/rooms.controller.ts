import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, BadRequestException } from '@nestjs/common';
import { RoomsService } from './rooms.service';
import { CreateRoomDto } from './dto/create-room.dto';
import { UpdateRoomDto } from './dto/update-room.dto';



@Controller('rooms')
export class RoomsController 
{
    constructor(private readonly roomsService: RoomsService) {}


    @Post()
    create(@Body() room_request: CreateRoomDto) 
    {
        return this.roomsService.createRoom(room_request)
    }


    @Get()
    findAll() 
    {
        return this.roomsService.findAll()
    }


    @Get(':id')
    findOne(@Param('id', ParseIntPipe) id: number) 
    {
        return this.roomsService.getRoom(id)
    }


    /* Update the room temp program ID */
    @Patch(":id/temp-program")
    setTempProgramId(
        @Param("id", ParseIntPipe) id: number,
        @Body("temp_program_id") program_id: number | null, 
    ) {
        if (program_id !== null && isNaN(Number(program_id))) 
            throw new BadRequestException('`temp_program_id` must be a number or null')

        const clean_program_id = program_id !== null ? Number(program_id) : null
        
        return this.roomsService.setTempProgramId(id, clean_program_id)
    }

    @Patch(':id')
    update(@Param('id', ParseIntPipe) id: number, @Body() updateRoomDto: UpdateRoomDto) {
        return this.roomsService.updateRoom(id, updateRoomDto);
    }
}
