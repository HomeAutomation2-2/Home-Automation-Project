import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';
import { describe, it, beforeEach, afterEach, expect, jest } from '@jest/globals';
import { TemperatureProgramsService } from './temperature-programs.service';
import { TemperatureProgram } from './entities/temperature-program.entity';



/* ─── Factory pentru Mock Repository ─── */

const createMockRepository = () => ({
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    remove: jest.fn(),
});



/* ══════════════════════════════════════════════════════════════════════════════
   TemperatureProgramsService — Unit Tests
   ══════════════════════════════════════════════════════════════════════════════ */

describe('TemperatureProgramsService', () => 
{
    let service: TemperatureProgramsService;
    let programRepo: any;


    beforeEach(async () => 
    {
        const mockProgramRepo = createMockRepository();

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                TemperatureProgramsService,
                { provide: getRepositoryToken(TemperatureProgram), useValue: mockProgramRepo },
            ],
        }).compile();

        service = module.get<TemperatureProgramsService>(TemperatureProgramsService);
        programRepo = module.get(getRepositoryToken(TemperatureProgram));
    });


    afterEach(() => {
        jest.clearAllMocks();
    });



    /* ─────────────────────── findAll ─────────────────────── */

    describe('findAll', () => 
    {
        it('ar trebui să returneze toate programele ordonate după id', async () => 
        {
            const programs = [
                { id: 1, name: 'Iarnă', schedule: [] },
                { id: 2, name: 'Vară', schedule: [] },
            ];
            programRepo.find.mockResolvedValue(programs);

            const result = await service.findAll();

            expect(programRepo.find).toHaveBeenCalledWith({ order: { id: 'ASC' } });
            expect(result).toEqual(programs);
        });
    });



    /* ─────────────────────── create ─────────────────────── */

    describe('create', () => 
    {
        it('ar trebui să creeze și să returneze un program nou', async () => 
        {
            const createDto = {
                name: 'Program Noapte',
                schedule: [
                    { days: [0, 1, 2, 3, 4], slots: [{ time: '22:00', temp: 18 }] }
                ],
            };
            
            const newProgram = { id: 3, ...createDto };
            programRepo.create.mockReturnValue(newProgram);
            programRepo.save.mockResolvedValue(newProgram);

            const result = await service.create(createDto);

            expect(programRepo.create).toHaveBeenCalledWith(createDto);
            expect(programRepo.save).toHaveBeenCalledWith(newProgram);
            expect(result).toEqual(newProgram);
        });
    });



    /* ─────────────────────── remove ─────────────────────── */

    describe('remove', () => 
    {
        it('ar trebui să șteargă programul cu succes', async () => 
        {
            const program = { id: 1, name: 'Iarnă', schedule: [] };
            programRepo.findOne.mockResolvedValue(program);
            programRepo.remove.mockResolvedValue(program);

            const result = await service.remove(1);

            expect(programRepo.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
            expect(programRepo.remove).toHaveBeenCalledWith(program);
            expect(result).toEqual({ success: true });
        });

        it('ar trebui să arunce NotFoundException dacă programul nu există', async () => 
        {
            programRepo.findOne.mockResolvedValue(null);

            await expect(service.remove(999)).rejects.toThrow(NotFoundException);
        });
    });
});
