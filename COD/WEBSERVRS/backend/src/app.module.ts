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
import { HomeSettingsModule } from './home-settings/home-settings.module';
import { DevicesModule } from './devices/device.module';
import { NotificationsModule } from './notifications/notifications.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST ?? 'localhost',
      port: Number(process.env.DB_PORT ?? 5432),
      username: process.env.DB_USER ?? 'postgres',
      password: process.env.DB_PASSWORD ?? 'mysecretpassword',
      database: process.env.DB_NAME ?? 'home_automation',
      autoLoadEntities: true, // Încarcă automat entitățile pe care le definim în cod
      synchronize: false, // Rămâne false; baza de date este creată prin scriptul SQL din DATABASE
    }),
    RoomsModule,
    UsersModule,
    AuthSessionsModule,
    LightZonesModule,
    TemperatureProgramsModule,
    TemperatureReadingsModule,
    EventsModule,
    HomeSettingsModule,
    DevicesModule,
    NotificationsModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
