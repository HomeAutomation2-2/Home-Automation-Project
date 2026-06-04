import { Module } from '@nestjs/common';
import { AdminSessionGuard } from './admin-session.guard';
import { AuthSessionsController } from './auth-sessions.controller';
import { AuthSessionsService } from './auth-sessions.service';
import { SessionGuard } from './session.guard';

@Module({
  controllers: [AuthSessionsController],
  providers: [AuthSessionsService, SessionGuard, AdminSessionGuard],
  exports: [AuthSessionsService, SessionGuard, AdminSessionGuard],
})
export class AuthSessionsModule {}
