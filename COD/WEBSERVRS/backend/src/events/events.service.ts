import { Injectable } from '@nestjs/common';
import { CreateAccessEventDto } from './dto/create-access-event.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { AccessEvent } from './entities/access-event.entity';
import { Repository } from 'typeorm';

@Injectable()
export class EventsService 
{
    constructor(
        @InjectRepository(AccessEvent)
        private readonly access_events_repository: Repository<AccessEvent>,
    ) {}


    /**
     * Sync a list of access events with the server's database.
     * @param events A list of access events.
     * @param userId The ID of the user sending the events.
     * @returns The number of events added to the table.
     */
    async syncEvents(events: CreateAccessEventDto[], userId: number) 
    {
        const entities = events.map(e => this.access_events_repository.create({
            userId,
            direction: e.direction,
            occurredAt: new Date(e.occurred_at)
        }))

        await this.access_events_repository.save(entities)

        return { synced: entities.length }
    }
}
