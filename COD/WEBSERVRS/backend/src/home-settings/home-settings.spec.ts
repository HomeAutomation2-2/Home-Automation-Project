/**
 *  HomeSettingsService — Unit Tests
 * 
 *  TESTS:
 *  HomeSettingsService has 2 methods:
 *    1. getSettings()      — returns existing settings OR creates defaults if missing
 *    2. updateSettings()   — updates existing settings OR creates row if missing
 * 
 *  TEST STRUCTURE:
 *    1. ARRANGE  — Prepare data and configure mocks (what they return)
 *    2. ACT      — Call the method we are testing
 *    3. ASSERT   — Verify the result is what we expected
 */

import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { describe, it, beforeEach, afterEach, expect, jest } from '@jest/globals';
import { HomeSettingsService } from './home-settings.service';
import { HomeSettings } from './entities/home-settings.entity';



/* ─── STEP 1: Create a "factory" for mock repository ───
 *
 * A real TypeORM Repository has methods like: find, findOne, create, save, etc.
 * We create an object with the same method names, but each one is a `jest.fn()`.
 * 
 * `jest.fn()` is a "spy" function — it doesn't do anything real, but:
 *   - Can be programmed to return what we want (with .mockResolvedValue)
 *   - Records every call (with what arguments it was called)
 *   - Allows us to verify if it was called correctly (with expect().toHaveBeenCalledWith)
 */
const createMockRepository = () => ({
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
});



describe('HomeSettingsService', () => {
    let service: HomeSettingsService;
    let settingsRepo: any;


    /* STEP 2: beforeEach — Configuring tests 
     *
     * `beforeEach` runs BEFORE each test (`it`).
     * 
     * What Test.createTestingModule does:
     *   - Creates a mini NestJS container just for the test
     *   - We replace the REAL repository with our mock using `provide/useValue`
     *   - `getRepositoryToken(HomeSettings)` returns the token that NestJS
     *     uses internally for @InjectRepository(HomeSettings)
     */
    beforeEach(async () => {
        const mockSettingsRepo = createMockRepository();

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                HomeSettingsService,                                         // the real service we're testing
                { provide: getRepositoryToken(HomeSettings), useValue: mockSettingsRepo },  // the fake repo
            ],
        }).compile();

        service = module.get<HomeSettingsService>(HomeSettingsService);
        settingsRepo = module.get(getRepositoryToken(HomeSettings));
    });


    /* STEP 3: afterEach — Cleaning after each test 
     *
     * `jest.clearAllMocks()` resets the counters and return values
     * of all mocks, so that tests don't influence each other.
     */
    afterEach(() => {
        jest.clearAllMocks();
    });



    /* getSettings() — Testing both logic branches
     *
     *  We have 2 branches to test:
     *    Test 1: findOne returns an object → create/save are NOT called
     *    Test 2: findOne returns null      → create + save are called with default values
     */
    describe('getSettings', () => {
        it('ar trebui să returneze setările existente dacă rândul există deja', async () => {

            const existingSettings = { id: 1, hysteresis: 1.50, antifreezeTemp: 5.00 };
            settingsRepo.findOne.mockResolvedValue(existingSettings);

            const result = await service.getSettings();

            expect(settingsRepo.findOne).toHaveBeenCalledWith({ where: { id: 1 } }); // verify if it searched for id: 1

            expect(result).toEqual(existingSettings); // verify if it returned the object found in DB

            expect(settingsRepo.create).not.toHaveBeenCalled(); // verify it did NOT create a new row (one already existed)
            expect(settingsRepo.save).not.toHaveBeenCalled(); // verify it did NOT save (no changes needed)
        });


        it('ar trebui să creeze setări implicite dacă nu există niciun rând (auto-seed)', async () => {
            settingsRepo.findOne.mockResolvedValue(null);

            const defaultSettings = { id: 1, hysteresis: 0.00, antifreezeTemp: 7.00 };
            settingsRepo.create.mockReturnValue(defaultSettings);
            settingsRepo.save.mockResolvedValue(defaultSettings);

            const result = await service.getSettings();

            expect(settingsRepo.create).toHaveBeenCalledWith({
                id: 1,
                hysteresis: 0.00,
                antifreezeTemp: 7.00
            });

            expect(settingsRepo.save).toHaveBeenCalledWith(defaultSettings);

            expect(result).toEqual(defaultSettings);
        });
    });



    /* updateSettings() — Testing both branches (update existing vs upsert)
     */
    describe('updateSettings', () => {
        it('ar trebui să actualizeze setările existente cu valorile noi', async () => {
            const existingSettings = { id: 1, hysteresis: 0.50, antifreezeTemp: 5.00 };
            settingsRepo.findOne.mockResolvedValue(existingSettings);

            const updatedSettings = { id: 1, hysteresis: 2.00, antifreezeTemp: 8.00 };
            settingsRepo.save.mockResolvedValue(updatedSettings);

            const result = await service.updateSettings(2.00, 8.00);

            expect(settingsRepo.create).not.toHaveBeenCalled(); // verify it did NOT create a new row (updated in-place)

            expect(settingsRepo.save).toHaveBeenCalled(); // verify it saved the updated settings

            expect(result).toEqual(updatedSettings);
        });


        it('ar trebui să creeze setări noi dacă rândul nu există (comportament upsert)', async () => {
            settingsRepo.findOne.mockResolvedValue(null);

            const newSettings = { id: 1, hysteresis: 1.50, antifreezeTemp: 6.00 };
            settingsRepo.create.mockReturnValue(newSettings);
            settingsRepo.save.mockResolvedValue(newSettings);

            const result = await service.updateSettings(1.50, 6.00);

            expect(settingsRepo.create).toHaveBeenCalledWith({
                id: 1,
                hysteresis: 1.50,
                antifreezeTemp: 6.00
            });

            expect(settingsRepo.save).toHaveBeenCalledWith(newSettings);
            expect(result).toEqual(newSettings);
        });
    });
});
