import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Notification } from './entities/notification.entity';
import { NotificationsService } from './notifications.service';
import { NotificationsController } from './notifications.controller';
import { User } from '../users/entities/user.entity';
import { SessionGuard } from '../users/guards/session.guard';
import { AdminSessionGuard } from '../users/guards/admin-session.guard';
import { AuthSession } from '../auth-sessions/entities/auth-session.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Notification, User, AuthSession]),
  ],
  controllers: [NotificationsController],
  providers: [NotificationsService, SessionGuard, AdminSessionGuard],
  exports: [NotificationsService],
})
export class NotificationsModule {}
