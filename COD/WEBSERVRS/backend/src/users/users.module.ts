import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { SessionGuard } from './guards/session.guard';
import { AuthSession } from '../auth-sessions/entities/auth-session.entity';



@Module({
    imports: [TypeOrmModule.forFeature([User, AuthSession])],
    controllers: [UsersController],
    providers: [UsersService, SessionGuard],
    exports: [UsersService],
})

export class UsersModule {}
