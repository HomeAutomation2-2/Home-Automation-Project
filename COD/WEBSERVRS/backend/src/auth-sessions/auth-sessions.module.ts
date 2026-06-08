import { Module } from '@nestjs/common';
import { AuthSessionsService } from './auth-sessions.service';
import { AuthSessionsController } from './auth-sessions.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthSession } from './entities/auth-session.entity';
import { UsersModule } from '../users/users.module';
import { DevicesService } from '../devices/devices.service';
import { DevicesModule } from '../devices/device.module';



@Module({
    imports: [
        TypeOrmModule.forFeature([AuthSession]),
        UsersModule,
        DevicesModule,
    ],
    controllers: [AuthSessionsController],
    providers: [
        AuthSessionsService,
    ],
})

export class AuthSessionsModule {}
