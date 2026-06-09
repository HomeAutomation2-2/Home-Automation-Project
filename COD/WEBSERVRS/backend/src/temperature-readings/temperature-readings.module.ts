import { Module } from '@nestjs/common';
import { TemperatureReadingsService } from './temperature-readings.service';
import { TemperatureReadingsController } from './temperature-readings.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TemperatureReading } from './entities/temperature-reading.entity';
import { UsersModule } from '../users/users.module';
import { User } from '../users/entities/user.entity';
import { AuthSession } from '../auth-sessions/entities/auth-session.entity';
import { SessionGuard } from '../users/guards/session.guard';


@Module({
  imports: [TypeOrmModule.forFeature([TemperatureReading, AuthSession, User]), UsersModule],
  controllers: [TemperatureReadingsController],
  providers: [TemperatureReadingsService, SessionGuard],
  exports: [TypeOrmModule]
})

export class TemperatureReadingsModule {}
