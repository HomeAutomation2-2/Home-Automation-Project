import { Module } from '@nestjs/common';
import { EventsService } from './events.service';
import { EventsController } from './events.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AccessEvent } from './entities/access-event.entity';
import { LightEvent } from './entities/light-event.entity';
import { BoilerEvent } from './entities/boiler-event.entity';
import { UsersService } from '../users/users.service';
import { SessionGuard } from '../users/guards/session.guard';
import { UsersModule } from '../users/users.module';
import { AuthSession } from '../auth-sessions/entities/auth-session.entity';



@Module({
  imports: [
    TypeOrmModule.forFeature([
      AccessEvent,
      LightEvent,
      BoilerEvent,
      AuthSession,
    ]),
    UsersModule,
  ],
  providers: [
    EventsService,
    SessionGuard,
  ],
})


export class EventsModule {}
