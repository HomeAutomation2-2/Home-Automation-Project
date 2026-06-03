import { Module } from '@nestjs/common';
import { TemperatureReadingsService } from './temperature-readings.service';
import { TemperatureReadingsController } from './temperature-readings.controller';

@Module({
  controllers: [TemperatureReadingsController],
  providers: [TemperatureReadingsService],
})
export class TemperatureReadingsModule {}
