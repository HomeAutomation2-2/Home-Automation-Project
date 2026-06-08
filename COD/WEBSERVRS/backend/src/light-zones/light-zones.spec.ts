import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { BadRequestException, ConflictException, NotFoundException } from '@nestjs/common';
import { describe, it, beforeEach, afterEach, expect, jest } from '@jest/globals';
import { LightZonesService } from './light-zones.service';
import { LightZone } from './entities/light-zone.entity';
import { Room } from '../rooms/entities/room.entity';



/* ─── Factory pentru Mock-uri Repository ─── */

const createMockRepository = () => ({
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    exists: jest.fn(),
    merge: jest.fn(),
});



/* ══════════════════════════════════════════════════════════════════════════════
   LightZonesService — Unit Tests
   ══════════════════════════════════════════════════════════════════════════════ */

describe('LightZonesService', () => 
{
    let service: LightZonesService;
    let zoneRepo: any;
    let roomRepo: any;


    beforeEach(async () => 
    {
        const mockZoneRepo = createMockRepository();
        const mockRoomRepo = createMockRepository();

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                LightZonesService,
                { provide: getRepositoryToken(LightZone), useValue: mockZoneRepo },
                { provide: getRepositoryToken(Room), useValue: mockRoomRepo },
            ],
        }).compile();

        service = module.get<LightZonesService>(LightZonesService);
        zoneRepo = module.get(getRepositoryToken(LightZone));
        roomRepo = module.get(getRepositoryToken(Room));
    });


    afterEach(() => {
        jest.clearAllMocks();
    });



    /* ─────────────────────── getZone ─────────────────────── */

    describe('getZone', () => 
    {
        it('ar trebui să returneze zona dacă există', async () => 
        {
            const zone = { id: 1, name: 'Plafonieră', room_id: 1, is_on: false };
            zoneRepo.findOne.mockResolvedValue(zone);

            const result = await service.getZone({ id: 1 });

            expect(zoneRepo.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
            expect(result).toEqual(zone);
        });

        it('ar trebui să arunce NotFoundException dacă zona nu există', async () => 
        {
            zoneRepo.findOne.mockResolvedValue(null);

            await expect(service.getZone({ id: 999 })).rejects.toThrow(NotFoundException);
        });
    });



    /* ─────────────────────── getZones ─────────────────────── */

    describe('getZones', () => 
    {
        it('ar trebui să returneze toate zonele când nu se filtrează pe room_id', async () => 
        {
            const zones = [
                { id: 1, name: 'Plafonieră', room_id: 1 },
                { id: 2, name: 'Veioză', room_id: 2 },
            ];
            zoneRepo.find.mockResolvedValue(zones);

            const result = await service.getZones({ room_id: undefined as any });

            expect(zoneRepo.find).toHaveBeenCalledTimes(1);
            expect(result).toEqual(zones);
        });

        it('ar trebui să returneze zonele dintr-o cameră specifică', async () => 
        {
            const zonesInRoom = [{ id: 1, name: 'Plafonieră', room_id: 1 }];
            roomRepo.exists.mockResolvedValue(true);
            zoneRepo.find.mockResolvedValue(zonesInRoom);

            const result = await service.getZones({ room_id: 1 });

            expect(roomRepo.exists).toHaveBeenCalledWith({ where: { id: 1 } });
            expect(zoneRepo.find).toHaveBeenCalledWith({ where: { room_id: 1 } });
            expect(result).toEqual(zonesInRoom);
        });

        it('ar trebui să arunce NotFoundException dacă camera specificată nu există', async () => 
        {
            roomRepo.exists.mockResolvedValue(false);

            await expect(service.getZones({ room_id: 999 })).rejects.toThrow(NotFoundException);
        });
    });



    /* ─────────────────────── createZone ─────────────────────── */

    describe('createZone', () => 
    {
        const createDto = { room_id: 1, name: 'LED Band' };

        it('ar trebui să creeze zona cu succes', async () => 
        {
            roomRepo.findOne.mockResolvedValue({ id: 1, name: 'Living' });
            zoneRepo.findOne.mockResolvedValue(null); // nu există duplicate
            
            const newZone = { id: 3, ...createDto, is_on: false };
            zoneRepo.create.mockReturnValue(newZone);
            zoneRepo.save.mockResolvedValue(newZone);

            const result = await service.createZone(createDto);

            expect(roomRepo.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
            expect(result).toEqual(newZone);
        });

        it('ar trebui să arunce BadRequestException dacă camera părinte nu există', async () => 
        {
            roomRepo.findOne.mockResolvedValue(null);

            await expect(service.createZone(createDto)).rejects.toThrow(BadRequestException);
        });

        it('ar trebui să arunce ConflictException dacă numele zonei există deja în cameră', async () => 
        {
            roomRepo.findOne.mockResolvedValue({ id: 1, name: 'Living' });
            zoneRepo.findOne.mockResolvedValue({ id: 5, name: 'LED Band', room_id: 1 });

            await expect(service.createZone(createDto)).rejects.toThrow(ConflictException);
        });
    });



    /* ─────────────────────── updateZone ─────────────────────── */

    describe('updateZone', () => 
    {
        it('ar trebui să actualizeze și să returneze zona', async () => 
        {
            const existingZone = { id: 1, name: 'Plafonieră', room_id: 1, is_on: false };
            const updateDto = { is_on: true };

            zoneRepo.findOne.mockResolvedValue(existingZone);
            zoneRepo.merge.mockImplementation((entity: any, dto: any) => Object.assign(entity, dto));
            zoneRepo.save.mockResolvedValue({ ...existingZone, ...updateDto });

            const result = await service.updateZone(1, updateDto);

            expect(zoneRepo.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
            expect(zoneRepo.merge).toHaveBeenCalled();
            expect(result.is_on).toBe(true);
        });

        it('ar trebui să arunce NotFoundException dacă zona nu există', async () => 
        {
            zoneRepo.findOne.mockResolvedValue(null);

            await expect(service.updateZone(999, { is_on: true })).rejects.toThrow(NotFoundException);
        });
    });
});
