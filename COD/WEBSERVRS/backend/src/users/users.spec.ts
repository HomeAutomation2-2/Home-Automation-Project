import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException, UnauthorizedException } from '@nestjs/common';
import { describe, it, beforeEach, expect, jest } from '@jest/globals';
import { UsersService } from './users.service';
import { User } from './entities/user.entity';
import { LoginUserDto } from './dto/login-user.dto';



jest.mock('bcrypt', () => 
({
    compare: async (plain: string, hash: string) => 
    {
        return plain.includes('corecta');
    }
}))


describe('UsersService - loginUser', () => 
{
    let service: UsersService;
    let repositoryMock: any;

    const mockUserRepository = {
        findOne: jest.fn(),
    };


    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                UsersService,
                {
                    provide: getRepositoryToken(User),
                    useValue: mockUserRepository,
                },
            ],
        }).compile()

        service = module.get<UsersService>(UsersService)
        repositoryMock = module.get(getRepositoryToken(User))
    })


    afterEach(() => {
        jest.clearAllMocks()
    })




    it('ar trebui să autentifice utilizatorul și să returneze datele fără passwordHash', async () => 
    {
        const loginDto: LoginUserDto = { phone: '0799888777', password_plaintext: 'parola_corecta' }
        
        const dbUser = {
            id: 1,
            phone: '0799888777',
            passwordHash: 'hashed_password',
            firstName: 'Mihai',
            isSuspended: false,
            sessions: [],
        }

        repositoryMock.findOne.mockResolvedValue(dbUser)
        const result = await service.loginUser(loginDto)

        expect(repositoryMock.findOne).toHaveBeenCalledTimes(1)
        expect(result).toHaveProperty('id')
        expect(result).toHaveProperty('firstName')
        expect(result).not.toHaveProperty('passwordHash')
        expect(result).not.toHaveProperty('sessions')
    })

    
    it('ar trebui să arunce NotFoundException dacă numărul de telefon nu există', async () => 
    {
        const loginDto = { phone: '0700000000', password_plaintext: 'orice' }
        
        repositoryMock.findOne.mockResolvedValue(null)

        await expect(service.loginUser(loginDto)).rejects.toThrow(NotFoundException)
    })


    it('ar trebui să arunce UnauthorizedException dacă parola este incorectă', async () => 
    {
        const loginDto = { phone: '0799888777', password_plaintext: 'parola_gresita' }
        const dbUser = { id: 1, phone: '0799888777', passwordHash: 'hashed_password' }

        repositoryMock.findOne.mockResolvedValue(dbUser)

        await expect(service.loginUser(loginDto)).rejects.toThrow(UnauthorizedException)
    })


    it('ar trebui să arunce UnauthorizedException dacă contul este suspendat', async () => 
    {
        const loginDto = { phone: '0799888777', password_plaintext: 'parola_corecta' };
        
        const dbUser = { 
            id: 1, 
            phone: '0799888777', 
            passwordHash: 'hashed_password',
            isSuspended: true
        };

        repositoryMock.findOne.mockResolvedValue(dbUser)

        await expect(service.loginUser(loginDto)).rejects.toThrow(new UnauthorizedException("Account suspended"))
    })
})