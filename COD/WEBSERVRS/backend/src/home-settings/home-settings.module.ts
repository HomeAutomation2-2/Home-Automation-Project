import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HomeSettingsService } from './home-settings.service';
import { HomeSettingsController } from './home-settings.controller';
import { HomeSettings } from './entities/home-settings.entity';
import { UsersModule } from '../users/users.module';
import { SessionGuard } from '../users/guards/session.guard';
import { AuthSession } from '../auth-sessions/entities/auth-session.entity';



@Module({
    imports: [
        TypeOrmModule.forFeature([HomeSettings, AuthSession]),
        UsersModule,
    ],
    controllers: [HomeSettingsController],
    providers: [HomeSettingsService, SessionGuard],
})
export class HomeSettingsModule {}