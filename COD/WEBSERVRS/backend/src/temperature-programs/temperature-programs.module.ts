import { Module } from '@nestjs/common';
import { TemperatureProgramsService } from './temperature-programs.service';
import { TemperatureProgramsController } from './temperature-programs.controller';

@Module({
  controllers: [TemperatureProgramsController],
  providers: [TemperatureProgramsService],
})
export class TemperatureProgramsModule {}
