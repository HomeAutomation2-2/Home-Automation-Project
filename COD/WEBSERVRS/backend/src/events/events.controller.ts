import { Body, Controller, Param, ParseIntPipe, Patch, Post, UseGuards } from '@nestjs/common';
import { EventsService } from './events.service';
import { SessionGuard } from '../users/guards/session.guard';
import { CreateAccessEventDto } from './dto/create-access-event.dto';
import { GetUser } from '../users/decorators/get-user.decorator';
import { User } from '../users/entities/user.entity';



@Controller('events')
export class EventsController 
{
    constructor(private readonly eventsService: EventsService) {}


    @Post('access-sync')
    @UseGuards(SessionGuard)
    async syncEvents(
        @Body() body: { events: CreateAccessEventDto[] }, 
        @GetUser() user) 
    {
        return this.eventsService.syncEvents(body.events, user.id)
    }


    @Patch('access/:id')
    @UseGuards(SessionGuard)
    async correctEvent(
        @Param('id', ParseIntPipe) id: number,
        @Body('direction') direction: 'in' | 'out',
        @GetUser() user: User,
    ) {
        await this.eventsService.correctAccessEvent(id, user.id, direction)
    }
}
