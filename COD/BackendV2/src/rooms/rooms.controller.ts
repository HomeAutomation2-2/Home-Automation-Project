import { Body, Controller, Get, Param, ParseIntPipe, Patch, Post } from '@nestjs/common';
import { CreateRoomDto } from './dto/create-room.dto';
import { SetRoomProgramDto } from './dto/set-room-program.dto';
import { RoomResponse } from './room.presenter';
import { RoomsService } from './rooms.service';

@Controller('rooms')
export class RoomsController {
  constructor(private readonly roomsService: RoomsService) {}

  @Post()
  create(@Body() roomRequest: CreateRoomDto): Promise<RoomResponse> {
    return this.roomsService.createRoom(roomRequest);
  }

  @Get()
  findAll(): Promise<RoomResponse[]> {
    return this.roomsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number): Promise<RoomResponse> {
    return this.roomsService.getRoom(id);
  }

  @Patch(':id/temp-program')
  setTempProgramId(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: SetRoomProgramDto,
  ): Promise<{ success: true }> {
    return this.roomsService.setTempProgramId(id, body.temp_program_id ?? null);
  }
}
