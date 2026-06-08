import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateAccessEventDto } from './dto/create-access-event.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { AccessEvent } from './entities/access-event.entity';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';

@Injectable()
export class EventsService 
{
    constructor(
        @InjectRepository(AccessEvent)
        private readonly access_events_repository: Repository<AccessEvent>,

        @InjectRepository(User)
        private readonly usersRepository: Repository<User>,
    ) {}


    /**
     * Sync a list of access events with the server's database.
     * @param events A list of access events.
     * @param userId The ID of the user sending the events.
     * @returns The number of events added to the table.
     */
    async syncEvents(events: CreateAccessEventDto[], userId: number) 
    {
        console.log(`[DOOR-EVENTS] syncing ${events.length} events`)

        let lastId: number | null = null

        for (const e of events) 
        {
            const event = this.access_events_repository.create({
                id: userId,
                direction: e.direction,
                occurredAt: new Date(e.occurred_at),
            })

            const saved = await this.access_events_repository.save(event)
            lastId = saved.id
        }

        const last = events[events.length - 1]

        await this.usersRepository.update(userId, {
            isHome: last.direction === 'in',
        })

        return { id: lastId! }
    }


    /**
     * Update the user's movement direction.
     */
    async correctAccessEvent(
        eventId: number,
        userId: number,
        direction: 'in' | 'out',
    ): Promise<void> 
    {
        const event = await this.access_events_repository.findOne({
            where: { id: eventId, userId: userId },
        })

        if (!event) 
            throw new NotFoundException('Event not found')

        event.direction = direction
        
        await this.access_events_repository.save(event)
        await this.usersRepository.update(userId, {
            isHome: direction === 'in',
        })
    }
}
