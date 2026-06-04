import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, BadRequestException, UseGuards } from '@nestjs/common';
import { RoomsService } from './rooms.service';
import { CreateRoomDto } from './dto/create-room.dto';
import { SessionGuard } from '../users/guards/session.guard';



@UseGuards(SessionGuard)
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

    // @Patch(':id')
    // update(@Param('id') id: string, @Body() updateRoomDto: UpdateRoomDto) {
    //   return this.roomsService.update(+id, updateRoomDto);
    // }

    // @Delete(':id')
    // remove(@Param('id') id: string) {
    //   return this.roomsService.remove(+id);
    // }
}
