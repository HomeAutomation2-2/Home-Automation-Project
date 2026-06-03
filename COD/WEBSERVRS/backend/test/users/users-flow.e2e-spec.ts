import { INestApplication, ValidationPipe } from "@nestjs/common";
import { TestingModule, Test } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import { describe, it, beforeEach, afterEach, expect } from "@jest/globals";
import { AppModule } from "../../src/app.module";
import { AuthSession } from "../../src/auth-sessions/entities/auth-session.entity";
import { User } from "../../src/users/entities/user.entity";
import request from 'supertest';

describe('Flux Utilizatori & Autentificare (E2E)', () => 
{
    let app: INestApplication;
    let userRepository: any;
    let sessionRepository: any;

    beforeEach(async () => 
    {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        app = moduleFixture.createNestApplication();
        app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
        await app.init();

        userRepository = moduleFixture.get(getRepositoryToken(User));
        sessionRepository = moduleFixture.get(getRepositoryToken(AuthSession));

        // Curățare forțată folosind o comandă nativă PostgreSQL care ignoră temporar constrângerile
        const dataSource = userRepository.manager.connection;
        await dataSource.query('TRUNCATE TABLE "auth_sessions", "users" CASCADE;');
    });

    afterEach(async () => {
        if (app) {
            const dataSource = userRepository.manager.connection;
            await dataSource.query('TRUNCATE TABLE "auth_sessions", "users" CASCADE;');
            await app.close();
        }
    });

    // --- GRUPA 1: TESTE DE VALIDARE DATE ---
    describe('POST /users/register - Validare câmpuri', () => {
        it('ar trebui să returneze 400 Bad Request dacă trimitem un body gol', async () => {
            const response = await request(app.getHttpServer())
                .post('/users/register')
                .send({});

            expect(response.status).toBe(400);
            expect(response.body.message).toBeDefined();
        });

        it('ar trebui să returneze 400 dacă CNP-ul nu are fix 13 caractere sau e de alt tip', async () => {
            const response = await request(app.getHttpServer())
                .post('/users/register')
                .send({
                    firstName: 'Paul',
                    lastName: 'Nistor',
                    cnp: '123',
                    phone: '0744111222',
                    password_plaintext: 'parola123'
                });

            expect(response.status).toBe(400);
        });
    });


    describe('Flux complet: Înregistrare -> Login', () => 
    {
        const userValid = {
            firstName: 'Mihai',
            lastName: 'Gheorghe',
            cnp: '1900505123456',
            phone: '0799888777',
            password_plaintext: 'secret_pass'
        };

        it("ar trebui să înregistreze cu succes un user valid, să salveze hash-ul și să permită login", async () => 
        {
            const registerRes = await request(app.getHttpServer())
                .post('/users/register')
                .send(userValid);

            expect(registerRes.status).toBe(201);
            expect(registerRes.body.id).toBeDefined();
            expect(registerRes.body.passwordHash).toBeUndefined();

            const loginRes = await request(app.getHttpServer())
                .post('/auth-sessions/login')
                .send({
                    phone_number: userValid.phone,
                    password_plaintext: userValid.password_plaintext 
                });

            expect(loginRes.status).toBe(201);
            expect(loginRes.body).toHaveProperty('token');
        });
    });
});