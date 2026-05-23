import { Module } from '@nestjs/common';
import { TemperatureProgramsService } from './temperature-programs.service';
import { TemperatureProgramsController } from './temperature-programs.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TemperatureProgram } from './entities/temperature-program.entity';

@Module({
  controllers: [TemperatureProgramsController],
  providers: [TemperatureProgramsService],
  imports: [
    TypeOrmModule.forFeature([TemperatureProgram])
  ]
})
export class TemperatureProgramsModule {}
