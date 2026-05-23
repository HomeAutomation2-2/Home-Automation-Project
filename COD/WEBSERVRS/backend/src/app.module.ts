import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RoomsModule } from './rooms/rooms.module';
import { UsersModule } from './users/users.module';
import { AuthSessionsModule } from './auth-sessions/auth-sessions.module';
import { LightZonesModule } from './light-zones/light-zones.module';
import { TemperatureProgramsModule } from './temperature-programs/temperature-programs.module';
import { TemperatureReadingsModule } from './temperature-readings/temperature-readings.module';
import { EventsModule } from './events/events.module';
import { AppController } from './app.controller';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'postgres',
      password: 'mysecretpassword',
      database: 'home_automation',
      autoLoadEntities: true, // Încarcă automat entitățile pe care le definim în cod
      synchronize: false,    // Rămâne false; baza de date este creată prin scriptul SQL din DATABASE
    }),
    RoomsModule,
    UsersModule,
    AuthSessionsModule,
    LightZonesModule,
    TemperatureProgramsModule,
    TemperatureReadingsModule,
    EventsModule,
  ],
  controllers: [AppController]
})
export class AppModule {}