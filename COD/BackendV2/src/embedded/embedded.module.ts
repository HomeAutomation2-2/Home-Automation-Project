import { Module } from '@nestjs/common';
import { EmbeddedController } from './embedded.controller';
import { EmbeddedService } from './embedded.service';

@Module({
  controllers: [EmbeddedController],
  providers: [EmbeddedService],
})
export class EmbeddedModule {}
