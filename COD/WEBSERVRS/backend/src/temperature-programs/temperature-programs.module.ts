import { Module } from '@nestjs/common';
import { TemperatureProgramsService } from './temperature-programs.service';
import { TemperatureProgramsController } from './temperature-programs.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TemperatureProgram } from './entities/temperature-program.entity';
import { UsersModule } from '../users/users.module';
import { AuthSession } from '../auth-sessions/entities/auth-session.entity';
import { User } from '../users/entities/user.entity';
import { SessionGuard } from '../users/guards/session.guard';

@Module({
  controllers: [TemperatureProgramsController],
  providers: [TemperatureProgramsService, SessionGuard],
  imports: [
    TypeOrmModule.forFeature([TemperatureProgram, AuthSession, User]),
    UsersModule
  ]
})
export class TemperatureProgramsModule {}
