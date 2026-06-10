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
import { User } from '../users/entities/user.entity';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([
            AccessEvent,
            LightEvent,
            BoilerEvent,
            AuthSession,
            User
        ]),
        UsersModule,
        NotificationsModule,
    ],
  controllers: [EventsController],
  providers: [
    EventsService,
    SessionGuard,
  ],
})


export class EventsModule {}
