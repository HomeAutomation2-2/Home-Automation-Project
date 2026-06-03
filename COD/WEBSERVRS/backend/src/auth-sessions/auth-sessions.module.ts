import { Module } from '@nestjs/common';
import { AuthSessionsService } from './auth-sessions.service';
import { AuthSessionsController } from './auth-sessions.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthSession } from './entities/auth-session.entity';
import { UsersModule } from '../users/users.module';



@Module({
    imports: [
        TypeOrmModule.forFeature([AuthSession]),
        UsersModule,
    ],
    controllers: [AuthSessionsController],
    providers: [AuthSessionsService],
})

export class AuthSessionsModule {}
