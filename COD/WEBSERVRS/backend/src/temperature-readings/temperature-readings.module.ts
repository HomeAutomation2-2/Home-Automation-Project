import { Module } from '@nestjs/common';
import { TemperatureReadingsService } from './temperature-readings.service';
import { TemperatureReadingsController } from './temperature-readings.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TemperatureReading } from './entities/temperature-reading.entity';


@Module({
  imports: [TypeOrmModule.forFeature([TemperatureReading])],
  controllers: [TemperatureReadingsController],
  providers: [TemperatureReadingsService],
  exports: [TypeOrmModule]
})
export class TemperatureReadingsModule {}
