import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { describe, it, beforeEach, afterEach, expect, jest } from '@jest/globals';
import { RoomsService } from './rooms.service';
import { Room } from './entities/room.entity';
import { TemperatureProgram } from '../temperature-programs/entities/temperature-program.entity';



/* ─── Factory pentru Mock-uri Repository ─── */

const createMockRepository = () => ({
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    update: jest.fn(),
});



/* ══════════════════════════════════════════════════════════════════════════════
   RoomsService — Unit Tests
   ══════════════════════════════════════════════════════════════════════════════ */

describe('RoomsService', () => 
{
    let service: RoomsService;
    let roomRepo: any;
    let programRepo: any;


    beforeEach(async () => 
    {
        const mockRoomRepo = createMockRepository();
        const mockProgramRepo = createMockRepository();

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                RoomsService,
                { provide: getRepositoryToken(Room), useValue: mockRoomRepo },
                { provide: getRepositoryToken(TemperatureProgram), useValue: mockProgramRepo },
            ],
        }).compile();

        service = module.get<RoomsService>(RoomsService);
        roomRepo = module.get(getRepositoryToken(Room));
        programRepo = module.get(getRepositoryToken(TemperatureProgram));
    });


    afterEach(() => {
        jest.clearAllMocks();
    });



    /* ─────────────────────── findAll ─────────────────────── */

    describe('findAll', () => 
    {
        it('ar trebui să returneze toate camerele', async () => 
        {
            const rooms = [
                { id: 1, name: 'Living', is_heating: false },
                { id: 2, name: 'Dormitor', is_heating: true },
            ];
            roomRepo.find.mockResolvedValue(rooms);

            const result = await service.findAll();

            expect(roomRepo.find).toHaveBeenCalledTimes(1);
            expect(result).toEqual(rooms);
            expect(result).toHaveLength(2);
        });
    });



    /* ─────────────────────── createRoom ─────────────────────── */

    describe('createRoom', () => 
    {
        const createDto = { name: 'Bucătărie' };

        it('ar trebui să creeze și să returneze o cameră nouă', async () => 
        {
            roomRepo.findOne.mockResolvedValue(null); // nu există deja
            
            const newRoom = { id: 3, name: 'Bucătărie', is_heating: false };
            roomRepo.create.mockReturnValue(newRoom);
            roomRepo.save.mockResolvedValue(newRoom);

            const result = await service.createRoom(createDto);

            expect(roomRepo.findOne).toHaveBeenCalledWith({ where: { name: 'Bucătărie' } });
            expect(roomRepo.create).toHaveBeenCalledWith(createDto);
            expect(result).toEqual(newRoom);
        });

        it('ar trebui să arunce ConflictException dacă numele camerei există deja', async () => 
        {
            roomRepo.findOne.mockResolvedValue({ id: 1, name: 'Bucătărie' });

            await expect(service.createRoom(createDto)).rejects.toThrow(ConflictException);
        });
    });



    /* ─────────────────────── getRoom ─────────────────────── */

    describe('getRoom', () => 
    {
        it('ar trebui să returneze camera dacă există', async () => 
        {
            const room = { id: 1, name: 'Living', is_heating: false };
            roomRepo.findOne.mockResolvedValue(room);

            const result = await service.getRoom(1);

            expect(roomRepo.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
            expect(result).toEqual(room);
        });

        it('ar trebui să arunce NotFoundException dacă camera nu există', async () => 
        {
            roomRepo.findOne.mockResolvedValue(null);

            await expect(service.getRoom(999)).rejects.toThrow(NotFoundException);
        });
    });



    /* ─────────────────────── setTempProgramId ─────────────────────── */

    describe('setTempProgramId', () => 
    {
        it('ar trebui să actualizeze programul de temperatură al camerei', async () => 
        {
            programRepo.findOne.mockResolvedValue({ id: 5, name: 'Program Iarnă' });
            roomRepo.update.mockResolvedValue({ affected: 1 });

            const result = await service.setTempProgramId(1, 5);

            expect(programRepo.findOne).toHaveBeenCalledWith({ where: { id: 5 } });
            expect(roomRepo.update).toHaveBeenCalledWith(1, { temp_program_id: 5 });
            expect(result).toEqual({ success: true });
        });

        it('ar trebui să seteze program_id pe null (detașare)', async () => 
        {
            roomRepo.update.mockResolvedValue({ affected: 1 });

            const result = await service.setTempProgramId(1, null);

            // Când program_id e null, nu trebuie validat programul
            expect(programRepo.findOne).not.toHaveBeenCalled();
            expect(roomRepo.update).toHaveBeenCalledWith(1, { temp_program_id: null });
            expect(result).toEqual({ success: true });
        });

        it('ar trebui să arunce NotFoundException dacă programul nu există', async () => 
        {
            programRepo.findOne.mockResolvedValue(null);

            await expect(service.setTempProgramId(1, 999)).rejects.toThrow(NotFoundException);
        });

        it('ar trebui să arunce NotFoundException dacă camera nu există (affected=0)', async () => 
        {
            programRepo.findOne.mockResolvedValue({ id: 5 });
            roomRepo.update.mockResolvedValue({ affected: 0 });

            await expect(service.setTempProgramId(999, 5)).rejects.toThrow(NotFoundException);
        });
    });

    describe('updateRoom', () => {
        it('ar trebui să actualizeze offset și sampling', async () => {
            const room = {
                id: 1,
                name: 'Living',
                offset_value: 0,
                sampling_minutes: 5,
            };
            roomRepo.findOne.mockResolvedValue(room);
            roomRepo.save.mockImplementation(async (r: typeof room) => r);

            const result = await service.updateRoom(1, {
                offset_value: 1.5,
                sampling_minutes: 10,
            });

            expect(result.offset_value).toBe(1.5);
            expect(result.sampling_minutes).toBe(10);
        });
    });
});
