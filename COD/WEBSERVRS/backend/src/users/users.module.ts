import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { SessionGuard } from './guards/session.guard';
import { AuthSession } from '../auth-sessions/entities/auth-session.entity';
import { AccessEvent } from '../events/entities/access-event.entity';
import { AdminSessionGuard } from './guards/admin-session.guard';



@Module({
    imports: [TypeOrmModule.forFeature([User, AuthSession, AccessEvent])],
    controllers: [UsersController],
    providers: [
        UsersService, 
        SessionGuard,
        AdminSessionGuard,
    ],
    exports: [
        UsersService,
        SessionGuard,
        AdminSessionGuard,
        TypeOrmModule,
    ],
})

export class UsersModule {}
