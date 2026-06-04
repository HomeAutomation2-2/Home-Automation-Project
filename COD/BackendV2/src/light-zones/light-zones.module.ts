import { Module } from '@nestjs/common';
import { LightZonesController } from './light-zones.controller';
import { LightZonesService } from './light-zones.service';

@Module({
  controllers: [LightZonesController],
  providers: [LightZonesService],
  exports: [LightZonesService],
})
export class LightZonesModule {}
