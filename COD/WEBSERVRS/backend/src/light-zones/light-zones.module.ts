import { Module } from '@nestjs/common';
import { LightZonesService } from './light-zones.service';
import { LightZonesController } from './light-zones.controller';
import { Room } from '../rooms/entities/room.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LightZone } from './entities/light-zone.entity';

@Module({
    controllers: [LightZonesController],
    providers: [LightZonesService],
    imports: [
      TypeOrmModule.forFeature([Room]),
      TypeOrmModule.forFeature([LightZone])
    ]
})
export class LightZonesModule {}
