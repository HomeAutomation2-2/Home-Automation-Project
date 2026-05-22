import { Module } from '@nestjs/common';
import { HeatingLoopsService } from './heating-loops.service';
import { HeatingLoopsController } from './heating-loops.controller';

@Module({
  controllers: [HeatingLoopsController],
  providers: [HeatingLoopsService],
})
export class HeatingLoopsModule {}
