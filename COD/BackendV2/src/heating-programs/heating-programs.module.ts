import { Module } from '@nestjs/common';
import { HeatingProgramsController } from './heating-programs.controller';
import { HeatingProgramsService } from './heating-programs.service';

@Module({
  controllers: [HeatingProgramsController],
  providers: [HeatingProgramsService],
  exports: [HeatingProgramsService],
})
export class HeatingProgramsModule {}
