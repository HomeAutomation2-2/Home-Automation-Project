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


// mock repository
const createMockRepository = () => ({
    create: jest.fn(),
    save: jest.fn(),
});


describe('EventsService', () => {
    let service: EventsService;
    let accessEventRepo: any;


    beforeEach(async () => {
        const mockAccessEventRepo = createMockRepository();

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                EventsService,
                { provide: getRepositoryToken(AccessEvent), useValue: mockAccessEventRepo },
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
            accessEventRepo.save.mockResolvedValue([]);  // not interested in what save returns

            // act
            const result = await service.syncEvents(inputDtos, userId);

            // assert

            // verify that `create` was called 2 times (one call per event)
            expect(accessEventRepo.create).toHaveBeenCalledTimes(2);

            // verify first call - "in" event
            expect(accessEventRepo.create).toHaveBeenCalledWith({
                userId: 7,
                direction: 'in',
                occurredAt: new Date('2026-06-04T08:00:00Z'),  // string '2026-06-04T08:00:00Z' -> Date
            });

            // verify second call - "out" event
            expect(accessEventRepo.create).toHaveBeenCalledWith({
                userId: 7,
                direction: 'out',
                occurredAt: new Date('2026-06-04T12:30:00Z'),
            });

            // verify if save was called ONCE with an array (bulk save)
            expect(accessEventRepo.save).toHaveBeenCalledTimes(1);

            expect(result).toEqual({ synced: 2 });
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
            accessEventRepo.save.mockResolvedValue([]);

            // act
            const result = await service.syncEvents([], 1);

            // assert
            expect(accessEventRepo.create).not.toHaveBeenCalled();  // with an empty array, map() never calls create
            expect(accessEventRepo.save).toHaveBeenCalledWith([]);  // save - gets an empty array
            expect(result).toEqual({ synced: 0 });  // result - synced count is 0
        });
    });
});
