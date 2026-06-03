import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { EventsService } from './events.service';
import { SessionGuard } from '../users/guards/session.guard';
import { CreateAccessEventDto } from './dto/create-access-event.dto';
import { GetUser } from '../users/decorators/get-user.decorator';



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
}
