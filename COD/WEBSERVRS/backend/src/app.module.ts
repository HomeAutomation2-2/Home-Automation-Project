import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
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
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST ?? 'localhost',
      port: Number(process.env.DB_PORT ?? 5432),
      username: process.env.DB_USERNAME ?? 'postgres',
      password: process.env.DB_PASSWORD ?? 'mysecretpassword',
      database: process.env.DB_DATABASE ?? 'home_automation',
      autoLoadEntities: true,
      synchronize: false,
    }),
    RoomsModule,
    UsersModule,
    AuthSessionsModule,
    LightZonesModule,
    TemperatureProgramsModule,
    TemperatureReadingsModule,
    EventsModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
