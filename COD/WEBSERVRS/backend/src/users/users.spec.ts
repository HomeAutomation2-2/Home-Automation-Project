import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ConflictException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { describe, it, beforeEach, afterEach, expect, jest } from '@jest/globals';
import { UsersService } from './users.service';
import { User } from './entities/user.entity';
import { LoginUserDto } from './dto/login-user.dto';
import { AccessEvent } from '../events/entities/access-event.entity';
import { AuthSession } from '../auth-sessions/entities/auth-session.entity';
import { DataSource } from 'typeorm';



jest.mock('bcrypt', () => 
({
    compare: async (plain: string, hash: string) => 
    {
        return plain.includes('corecta');
    },
    genSalt: async () => 'mock_salt',
    hash: async (plain: string, salt: string) => `hashed_${plain}`,
}))



/* ─── Factory pentru Mock-uri Repository ─── */

const createMockRepository = () => ({
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    remove: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    exists: jest.fn(),
    createQueryBuilder: jest.fn(),
    merge: jest.fn(),
});

const createMockDataSource = () => ({
    query: jest.fn(),
});



/* ══════════════════════════════════════════════════════════════════════════════
   UsersService — Unit Tests
   ══════════════════════════════════════════════════════════════════════════════ */

describe('UsersService', () => 
{
    let service: UsersService;
    let userRepo: any;
    let accessEventRepo: any;
    let sessionRepo: any;
    let dataSource: any;


    beforeEach(async () => 
    {
        const mockUserRepo = createMockRepository();
        const mockAccessEventRepo = createMockRepository();
        const mockSessionRepo = createMockRepository();
        const mockDataSource = createMockDataSource();

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                UsersService,
                { provide: getRepositoryToken(User), useValue: mockUserRepo },
                { provide: getRepositoryToken(AccessEvent), useValue: mockAccessEventRepo },
                { provide: getRepositoryToken(AuthSession), useValue: mockSessionRepo },
                { provide: DataSource, useValue: mockDataSource },
            ],
        }).compile();

        service = module.get<UsersService>(UsersService);
        userRepo = module.get(getRepositoryToken(User));
        accessEventRepo = module.get(getRepositoryToken(AccessEvent));
        sessionRepo = module.get(getRepositoryToken(AuthSession));
        dataSource = mockDataSource;
    });


    afterEach(() => {
        jest.clearAllMocks();
    });



    /* ─────────────────────── findByPhone ─────────────────────── */

    describe('findByPhone', () => 
    {
        it('ar trebui să returneze utilizatorul dacă există', async () => 
        {
            const dbUser = { id: 1, phone: '0799888777', firstName: 'Mihai' };
            userRepo.findOne.mockResolvedValue(dbUser);

            const result = await service.findByPhone('0799888777');

            expect(userRepo.findOne).toHaveBeenCalledWith({ where: { phone: '0799888777' } });
            expect(result).toEqual(dbUser);
        });

        it('ar trebui să returneze null dacă utilizatorul nu există', async () => 
        {
            userRepo.findOne.mockResolvedValue(null);

            const result = await service.findByPhone('0700000000');

            expect(result).toBeNull();
        });
    });



    /* ─────────────────────── registerAccount ─────────────────────── */

    describe('registerAccount', () => 
    {
        const createDto = {
            firstName: 'Ion',
            lastName: 'Popescu',
            cnp: '1900101123456',
            phone: '0744111222',
            password_plaintext: 'parola_sigura',
            isAdmin: false,
        };

        it('ar trebui să creeze utilizatorul și să returneze datele fără passwordHash', async () => 
        {
            userRepo.findOne.mockResolvedValue(null); // niciun user existent
            
            const savedUser = {
                id: 1,
                ...createDto,
                passwordHash: 'hashed_parola_sigura',
            };
            userRepo.create.mockReturnValue(savedUser);
            userRepo.save.mockResolvedValue(savedUser);

            const result = await service.registerAccount(createDto);

            expect(userRepo.findOne).toHaveBeenCalledTimes(1);
            expect(userRepo.create).toHaveBeenCalled();
            expect(result).toHaveProperty('id');
            expect(result).not.toHaveProperty('passwordHash');
        });

        it('ar trebui să arunce ConflictException dacă telefonul sau CNP-ul există deja', async () => 
        {
            userRepo.findOne.mockResolvedValue({ id: 99, phone: createDto.phone });

            await expect(service.registerAccount(createDto)).rejects.toThrow(ConflictException);
        });

        it('ar trebui să hash-uieze parola înainte de a salva', async () => 
        {
            userRepo.findOne.mockResolvedValue(null);
            
            const savedUser = { id: 2, ...createDto, passwordHash: 'hashed_parola_sigura' };
            userRepo.create.mockReturnValue(savedUser);
            userRepo.save.mockResolvedValue(savedUser);

            await service.registerAccount(createDto);

            // Verificăm că `create` a fost apelat cu parola hash-uită, nu cea plaintext
            expect(userRepo.create).toHaveBeenCalledWith(
                expect.objectContaining({ passwordHash: 'hashed_parola_sigura' })
            );
        });
    });



    /* ─────────────────────── loginUser ─────────────────────── */

    describe('loginUser', () => 
    {
        it('ar trebui să autentifice utilizatorul și să returneze datele fără passwordHash', async () => 
        {
            const loginDto: LoginUserDto = { phone: '0799888777', password_plaintext: 'parola_corecta' };
            
            const dbUser = {
                id: 1,
                phone: '0799888777',
                passwordHash: 'hashed_password',
                firstName: 'Mihai',
                isSuspended: false,
                sessions: [],
            };

            userRepo.findOne.mockResolvedValue(dbUser);
            const result = await service.loginUser(loginDto);

            expect(userRepo.findOne).toHaveBeenCalledTimes(1);
            expect(result).toHaveProperty('id');
            expect(result).toHaveProperty('firstName');
            expect(result).not.toHaveProperty('passwordHash');
            expect(result).not.toHaveProperty('sessions');
        });

        
        it('ar trebui să arunce NotFoundException dacă numărul de telefon nu există', async () => 
        {
            const loginDto = { phone: '0700000000', password_plaintext: 'orice' };
            
            userRepo.findOne.mockResolvedValue(null);

            await expect(service.loginUser(loginDto)).rejects.toThrow(NotFoundException);
        });


        it('ar trebui să arunce UnauthorizedException dacă parola este incorectă', async () => 
        {
            const loginDto = { phone: '0799888777', password_plaintext: 'parola_gresita' };
            const dbUser = { id: 1, phone: '0799888777', passwordHash: 'hashed_password' };

            userRepo.findOne.mockResolvedValue(dbUser);

            await expect(service.loginUser(loginDto)).rejects.toThrow(UnauthorizedException);
        });


        it('ar trebui să arunce UnauthorizedException dacă contul este suspendat', async () => 
        {
            const loginDto = { phone: '0799888777', password_plaintext: 'parola_corecta' };
            
            const dbUser = { 
                id: 1, 
                phone: '0799888777', 
                passwordHash: 'hashed_password',
                isSuspended: true
            };

            userRepo.findOne.mockResolvedValue(dbUser);

            await expect(service.loginUser(loginDto)).rejects.toThrow(new UnauthorizedException("Account suspended"));
        });
    });



    /* ─────────────────────── getFormattedProfile ─────────────────────── */

    describe('getFormattedProfile', () => 
    {
        it('ar trebui să returneze profilul formatat cu ultimul eveniment de acces', async () => 
        {
            const user = { id: 1, firstName: 'Mihai', lastName: 'Ion', isHome: true, isSuspended: false };
            const lastEvent = { 
                userId: 1, 
                direction: 'in', 
                occurredAt: new Date('2026-05-30T10:30:00') 
            };

            userRepo.findOne.mockResolvedValue(user);
            accessEventRepo.findOne.mockResolvedValue(lastEvent);

            const result = await service.getFormattedProfile(1);

            expect(result.first_name).toBe('Mihai');
            expect(result.last_name).toBe('Ion');
            expect(result.is_home).toBe(true);
            expect(result.last_access_event).toContain('Entered');
        });

        it('ar trebui să returneze "No access history" dacă nu există evenimente', async () => 
        {
            const user = { id: 2, firstName: 'Ana', lastName: 'Pop', isHome: false, isSuspended: false };

            userRepo.findOne.mockResolvedValue(user);
            accessEventRepo.findOne.mockResolvedValue(null);

            const result = await service.getFormattedProfile(2);

            expect(result.last_access_event).toBe('No access history');
        });

        it('ar trebui să arunce NotFoundException dacă utilizatorul nu există', async () => 
        {
            userRepo.findOne.mockResolvedValue(null);

            await expect(service.getFormattedProfile(999)).rejects.toThrow(NotFoundException);
        });
    });



    /* ─────────────────────── getDetailedProfileForAdmin ─────────────────────── */

    describe('getDetailedProfileForAdmin', () => 
    {
        it('ar trebui să returneze profilul detaliat al utilizatorului', async () => 
        {
            const user = {
                id: 1,
                firstName: 'Mihai',
                lastName: 'Ion',
                phone: '0799888777',
                cnp: '1900101123456',
                isHome: true,
                isAdmin: false,
                isSuspended: false,
            };

            userRepo.findOne.mockResolvedValue(user);

            const result = await service.getDetailedProfileForAdmin(1);

            expect(result).toEqual({
                first_name: 'Mihai',
                last_name: 'Ion',
                phone: '0799888777',
                cnp: '1900101123456',
                is_home: true,
                is_admin: false,
                is_suspended: false,
            });
        });

        it('ar trebui să arunce NotFoundException dacă utilizatorul nu există', async () => 
        {
            userRepo.findOne.mockResolvedValue(null);

            await expect(service.getDetailedProfileForAdmin(999)).rejects.toThrow(NotFoundException);
        });
    });



    /* ─────────────────────── updateUser ─────────────────────── */

    describe('updateUser', () => 
    {
        it('ar trebui să actualizeze câmpurile utilizatorului', async () => 
        {
            const user = {
                id: 1,
                firstName: 'Mihai',
                lastName: 'Ion',
                phone: '0799888777',
                passwordHash: 'old',
                isAdmin: false,
            };
            userRepo.findOne
                .mockResolvedValueOnce(user)
                .mockResolvedValueOnce(user);
            userRepo.save.mockResolvedValue(user);

            const result = await service.updateUser(1, {
                firstName: 'Mihail',
                isAdmin: true,
            });

            expect(user.firstName).toBe('Mihail');
            expect(user.isAdmin).toBe(true);
            expect(result.first_name).toBe('Mihail');
        });

        it('ar trebui să arunce ConflictException dacă telefonul este deja folosit', async () => 
        {
            const user = { id: 1, phone: '0799888777' };
            userRepo.findOne
                .mockResolvedValueOnce(user)
                .mockResolvedValueOnce({ id: 2, phone: '0700111222' });

            await expect(
                service.updateUser(1, { phone: '0700111222' }),
            ).rejects.toThrow(ConflictException);
        });
    });



    /* ─────────────────────── device binding ─────────────────────── */

    describe('getDeviceBinding', () => 
    {
        it('ar trebui să raporteze bound=false când nu există hash', async () => 
        {
            userRepo.findOne.mockResolvedValue({
                id: 1,
                phone: '0799888777',
                btCodeHash: null,
                btCodeEpoch: null,
            });

            const result = await service.getDeviceBinding(1);

            expect(result.bound).toBe(false);
            expect(result.device_label).toBeNull();
        });

        it('ar trebui să raporteze bound=true când există hash', async () => 
        {
            userRepo.findOne.mockResolvedValue({
                id: 1,
                phone: '0799888777',
                btCodeHash: 'abc',
                btCodeEpoch: 1_700_000_000,
            });

            const result = await service.getDeviceBinding(1);

            expect(result.bound).toBe(true);
            expect(result.device_label).toContain('0799888777');
            expect(result.last_sync).not.toBeNull();
        });
    });



    /* ─────────────────────── suspendUser ─────────────────────── */

    describe('suspendUser', () => 
    {
        it('ar trebui să suspende utilizatorul și să invalideze sesiunile active', async () => 
        {
            const user = { id: 1, isSuspended: false };
            userRepo.findOne.mockResolvedValue(user);
            userRepo.save.mockResolvedValue({ ...user, isSuspended: true });
            sessionRepo.update.mockResolvedValue({ affected: 2 });

            const result = await service.suspendUser(1);

            expect(result.is_suspended).toBe(true);
            expect(sessionRepo.update).toHaveBeenCalledWith(
                { userId: 1, isActive: true },
                { isActive: false },
            );
        });

        it('ar trebui să reactiveze utilizatorul fără a invalida sesiunile', async () => 
        {
            const user = { id: 1, isSuspended: true };
            userRepo.findOne.mockResolvedValue(user);
            userRepo.save.mockResolvedValue({ ...user, isSuspended: false });

            const result = await service.suspendUser(1);

            expect(result.is_suspended).toBe(false);
            expect(sessionRepo.update).not.toHaveBeenCalled();
        });

        it('ar trebui să arunce NotFoundException dacă utilizatorul nu există', async () => 
        {
            userRepo.findOne.mockResolvedValue(null);

            await expect(service.suspendUser(999)).rejects.toThrow(NotFoundException);
        });
    });



    /* ─────────────────────── deleteUser ─────────────────────── */

    describe('deleteUser', () => 
    {
        it('ar trebui să șteargă sesiunile și apoi utilizatorul', async () => 
        {
            const user = { id: 5 };
            userRepo.findOne.mockResolvedValue(user);
            sessionRepo.delete.mockResolvedValue({ affected: 1 });
            userRepo.remove.mockResolvedValue(user);

            const result = await service.deleteUser(5);

            expect(sessionRepo.delete).toHaveBeenCalledWith({ userId: 5 });
            expect(userRepo.remove).toHaveBeenCalledWith(user);
            expect(result.message).toContain('5');
        });

        it('ar trebui să arunce NotFoundException dacă utilizatorul nu există', async () => 
        {
            userRepo.findOne.mockResolvedValue(null);

            await expect(service.deleteUser(999)).rejects.toThrow(NotFoundException);
        });
    });
});