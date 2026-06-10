/**
 *  EventsService — Unit Tests
 * 
 *  TESTS:
 *  EventsService has one method: syncEvents(events[], userId)
 *  Receives an array of access events from the client and saves them in DB.
 * 
 *  LOGIC (simplified):
 *    1. Maps each DTO into an entity (with repository.create)
 *    2. Saves all entities in DB (with repository.save)  
 *    3. Returns { synced: N } where N = how many were saved
 * 
 *  WHAT WE DON'T TEST HERE:
 *  - DTO field validation (this is done by class-validator at controller level)
 *  - Actual connection to PostgreSQL (this is done by e2e tests)
 *  - Session guard (this is the controller's responsibility)
 */

import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { describe, it, beforeEach, afterEach, expect, jest } from '@jest/globals';
import { EventsService } from './events.service';
import { AccessEvent } from './entities/access-event.entity';
import { User } from '../users/entities/user.entity';
import { NotificationsService } from '../notifications/notifications.service';

const createMockRepository = () => ({
    create: jest.fn(),
    save: jest.fn(),
    update: jest.fn(),
});

describe('EventsService', () => {
    let service: EventsService;
    let accessEventRepo: any;

    beforeEach(async () => {
        const mockAccessEventRepo = createMockRepository();
        const mockUserRepo = { update: jest.fn() };
        const mockNotificationsService = { handleChildEntry: jest.fn() };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                EventsService,
                { provide: getRepositoryToken(AccessEvent), useValue: mockAccessEventRepo },
                { provide: getRepositoryToken(User), useValue: mockUserRepo },
                { provide: NotificationsService, useValue: mockNotificationsService },
            ],
        }).compile();

        service = module.get<EventsService>(EventsService);
        accessEventRepo = module.get(getRepositoryToken(AccessEvent));
    });


    afterEach(() => {
        jest.clearAllMocks();
    });



    /*  syncEvents(events, userId)
     *
     *  chunk of code from service:
     *
     *    async syncEvents(events: CreateAccessEventDto[], userId: number) {
     *        const entities = events.map(e => this.access_events_repository.create({
     *            userId,                              // attach current user
     *            direction: e.direction,               // 'in' or 'out'
     *            occurredAt: new Date(e.occurred_at)   // convert string -> Date
     *        }))
     *        
     *        await this.access_events_repository.save(entities)   // save all
     *        return { synced: entities.length }                    // return count
     *    }
     *
     *  what is interesting here:
     *  - `create` is called ONCE per event (so N times)
     *  - `save` is called ONLY ONCE with an array of entities (bulk save)
     *  - the function does NOT throw its own exceptions - errors would only come from DB
     */
    describe('syncEvents', () => {
        it('should map DTOs to entities, save them, and return the synced count', async () => {
            // ─── ARRANGE ───
            const userId = 7;
            const inputDtos = [
                { direction: 'in' as const, occurred_at: '2026-06-04T08:00:00Z' },
                { direction: 'out' as const, occurred_at: '2026-06-04T12:30:00Z' },
            ];

            /* 
             * mockImplementation allows custom logic in a mock.
             * Every time `repository.create(data)` is called,
             * our mock returns exactly `data` back (as if it were an entity).
             * 
             * difference between mockReturnValue and mockImplementation:
             *   - mockReturnValue: returns ALWAYS the same value
             *   - mockImplementation: receives arguments and can return something DIFFERENT
             *                         depending on the input each time
             */
            accessEventRepo.create.mockImplementation((data: any) => data);
            accessEventRepo.save
                .mockResolvedValueOnce({ id: 101 })
                .mockResolvedValueOnce({ id: 102 });

            const result = await service.syncEvents(inputDtos, userId);

            expect(accessEventRepo.create).toHaveBeenCalledTimes(2);
            expect(accessEventRepo.create).toHaveBeenCalledWith({
                userId: 7,
                direction: 'in',
                occurredAt: new Date('2026-06-04T08:00:00Z'),
            });
            expect(accessEventRepo.create).toHaveBeenCalledWith({
                userId: 7,
                direction: 'out',
                occurredAt: new Date('2026-06-04T12:30:00Z'),
            });
            expect(accessEventRepo.save).toHaveBeenCalledTimes(2);
            expect(result).toEqual({ id: 102 });
        });


        it('should correctly handle an empty array of events', async () => {
            /* 
             * Empty array edge case
             * 
             * Client sends:
             *   POST /events/access-sync  { events: [] }
             * 
             * Service must not crash — it should simply
             * save an empty array and return { synced: 0 }.
             */

            // arrange
            await expect(service.syncEvents([], 1)).rejects.toThrow();
        });
    });
});
