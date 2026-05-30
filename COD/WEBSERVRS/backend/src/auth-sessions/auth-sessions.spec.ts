import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UnauthorizedException } from '@nestjs/common';
import { describe, it, beforeEach, afterEach, expect, jest } from '@jest/globals';
import { AuthSessionsService } from './auth-sessions.service';
import { AuthSession } from './entities/auth-session.entity';
import { UsersService } from '../users/users.service';



jest.mock('bcrypt', () =>
({
    compare: async (plain: string, hash: string) => 
    {
        return plain.includes('corecta');
    },
}))



/* ─── Mock-uri ─── */

const createMockRepository = () => ({
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    update: jest.fn(),
});

const createMockUsersService = () => ({
    findByPhone: jest.fn(),
});



/* ══════════════════════════════════════════════════════════════════════════════
   AuthSessionsService — Unit Tests
   ══════════════════════════════════════════════════════════════════════════════ */

describe('AuthSessionsService', () => 
{
    let service: AuthSessionsService;
    let sessionRepo: any;
    let usersService: any;


    beforeEach(async () => 
    {
        const mockSessionRepo = createMockRepository();
        const mockUsersService = createMockUsersService();

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                AuthSessionsService,
                { provide: getRepositoryToken(AuthSession), useValue: mockSessionRepo },
                { provide: UsersService, useValue: mockUsersService },
            ],
        }).compile();

        service = module.get<AuthSessionsService>(AuthSessionsService);
        sessionRepo = module.get(getRepositoryToken(AuthSession));
        usersService = module.get(UsersService);
    });


    afterEach(() => {
        jest.clearAllMocks();
    });



    /* ─────────────────────── login ─────────────────────── */

    describe('login', () => 
    {
        const validUser = {
            id: 1,
            phone: '0799888777',
            passwordHash: 'hashed_password',
            isSuspended: false,
        };

        it('ar trebui să returneze un token de sesiune la autentificare reușită', async () => 
        {
            usersService.findByPhone.mockResolvedValue(validUser);
            sessionRepo.update.mockResolvedValue({ affected: 0 });
            sessionRepo.create.mockImplementation((data: any) => data);
            sessionRepo.save.mockResolvedValue({});

            const result = await service.login('0799888777', 'parola_corecta');

            expect(result).toHaveProperty('token');
            expect(typeof result.token).toBe('string');
            expect(result.token.length).toBeGreaterThan(0);
        });

        it('ar trebui să invalideze sesiunile active existente înainte de a crea una nouă', async () => 
        {
            usersService.findByPhone.mockResolvedValue(validUser);
            sessionRepo.update.mockResolvedValue({ affected: 2 });
            sessionRepo.create.mockImplementation((data: any) => data);
            sessionRepo.save.mockResolvedValue({});

            await service.login('0799888777', 'parola_corecta');

            expect(sessionRepo.update).toHaveBeenCalledWith(
                { userId: 1, isActive: true },
                { isActive: false },
            );
            expect(sessionRepo.create).toHaveBeenCalled();
            expect(sessionRepo.save).toHaveBeenCalled();
        });

        it('ar trebui să arunce UnauthorizedException dacă utilizatorul nu există', async () => 
        {
            usersService.findByPhone.mockResolvedValue(null);

            await expect(
                service.login('0700000000', 'orice')
            ).rejects.toThrow(UnauthorizedException);
        });

        it('ar trebui să arunce UnauthorizedException dacă parola e greșită sau contul e suspendat', async () => 
        {
            const suspendedUser = { ...validUser, isSuspended: true };
            usersService.findByPhone.mockResolvedValue(suspendedUser);

            await expect(
                service.login('0799888777', 'parola_corecta')
            ).rejects.toThrow(UnauthorizedException);
        });
    });
});
