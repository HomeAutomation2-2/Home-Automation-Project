import { Module } from '@nestjs/common';
import { TemperatureProgramsService } from './temperature-programs.service';
import { TemperatureProgramsController } from './temperature-programs.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TemperatureProgram } from './entities/temperature-program.entity';
import { UsersModule } from '../users/users.module';

@Module({
  controllers: [TemperatureProgramsController],
  providers: [TemperatureProgramsService],
  imports: [
    TypeOrmModule.forFeature([TemperatureProgram]),
    UsersModule,
  ]
})
export class TemperatureProgramsModule {}
