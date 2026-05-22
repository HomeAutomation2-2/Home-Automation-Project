import { Module } from '@nestjs/common';
import { LightZonesService } from './light-zones.service';
import { LightZonesController } from './light-zones.controller';

@Module({
  controllers: [LightZonesController],
  providers: [LightZonesService],
})
export class LightZonesModule {}
