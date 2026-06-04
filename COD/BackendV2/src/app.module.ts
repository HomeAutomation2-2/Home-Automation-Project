import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthSessionsModule } from './auth-sessions/auth-sessions.module';
import { DatabaseModule } from './database/database.module';
import { EmbeddedModule } from './embedded/embedded.module';
import { EspGatewayModule } from './esp-gateway/esp-gateway.module';
import { EventsModule } from './events/events.module';
import { HealthModule } from './health/health.module';
import { HeatingProgramsModule } from './heating-programs/heating-programs.module';
import { LightZonesModule } from './light-zones/light-zones.module';
import { RoomsModule } from './rooms/rooms.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    DatabaseModule,
    EspGatewayModule,
    HealthModule,
    AuthSessionsModule,
    UsersModule,
    RoomsModule,
    LightZonesModule,
    HeatingProgramsModule,
    EventsModule,
    EmbeddedModule,
  ],
})
export class AppModule {}
