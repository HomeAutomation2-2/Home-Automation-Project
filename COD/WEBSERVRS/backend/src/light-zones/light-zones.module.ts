import { Module } from '@nestjs/common';
import { LightZonesService } from './light-zones.service';
import { LightZonesController } from './light-zones.controller';
import { Room } from '../rooms/entities/room.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LightZone } from './entities/light-zone.entity';
import { DevicesModule } from '../devices/device.module';
import { LightEvent } from '../events/entities/light-event.entity';
import { UsersModule } from '../users/users.module';
import { AuthSession } from '../auth-sessions/entities/auth-session.entity';



@Module({
    controllers: [LightZonesController],
    providers: [LightZonesService],
    imports: [
      TypeOrmModule.forFeature([
        Room, 
        LightZone,
        LightEvent,
        AuthSession
      ]),
      DevicesModule,
      UsersModule
    ]
})
export class LightZonesModule {}
