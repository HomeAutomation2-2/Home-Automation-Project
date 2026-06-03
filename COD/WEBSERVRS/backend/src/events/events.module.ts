import { Module } from '@nestjs/common';
import { EventsService } from './events.service';
import { EventsController } from './events.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AccessEvent } from './entities/access-event.entity';
import { LightEvent } from './entities/light-event.entity';
import { BoilerEvent } from './entities/boiler-event.entity';



@Module({
  imports: [
    TypeOrmModule.forFeature([AccessEvent, LightEvent, BoilerEvent])
  ],
  controllers: [EventsController],
  providers: [EventsService],
  exports: [TypeOrmModule, EventsService]
})
export class EventsModule {}
