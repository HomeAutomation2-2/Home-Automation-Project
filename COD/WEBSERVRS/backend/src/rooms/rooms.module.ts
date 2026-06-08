import { Module } from '@nestjs/common';
import { RoomsService } from './rooms.service';
import { RoomsController } from './rooms.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Room } from './entities/room.entity';
import { TemperatureProgram } from '../temperature-programs/entities/temperature-program.entity';
import { AuthSession } from '../auth-sessions/entities/auth-session.entity';
import { SessionGuard } from '../users/guards/session.guard';
import { AdminSessionGuard } from '../users/guards/admin-session.guard';



@Module({
    imports: [TypeOrmModule.forFeature([Room, TemperatureProgram, AuthSession])],
    controllers: [RoomsController],
    providers: [
        RoomsService,
        SessionGuard,
        AdminSessionGuard,
    ],
})


export class RoomsModule {}
