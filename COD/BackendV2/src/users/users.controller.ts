import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AdminSessionGuard } from '../auth-sessions/admin-session.guard';
import { SessionGuard } from '../auth-sessions/session.guard';
import { User } from '../database/entities';
import { CurrentUser } from './current-user.decorator';
import { CreateUserDto } from './dto/create-user.dto';
import { UserPresenceResponse, UserProfileResponse } from './user.presenter';
import { UnifiedLogResponse, UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('register')
  register(@Body() userData: CreateUserDto): Promise<UserProfileResponse> {
    return this.usersService.registerAccount(userData);
  }

  @Get('me')
  @UseGuards(SessionGuard)
  getMe(@CurrentUser() user: User): Promise<UserProfileResponse> {
    return this.usersService.getMe(user);
  }

  @Get('presence')
  @UseGuards(SessionGuard)
  getUsersPresence(): Promise<UserPresenceResponse[]> {
    return this.usersService.getAllUsersPresence();
  }

  @Get('logs')
  @UseGuards(SessionGuard)
  getSystemLogs(@CurrentUser() user: User): Promise<UnifiedLogResponse[]> {
    return this.usersService.getUnifiedLogs(user);
  }

  @Get(':id')
  @UseGuards(AdminSessionGuard)
  getUserDetailsForAdmin(
    @Param('id', ParseIntPipe) targetUserId: number,
  ): Promise<UserProfileResponse> {
    return this.usersService.getDetailedProfileForAdmin(targetUserId);
  }

  @Patch(':id/suspend')
  @UseGuards(AdminSessionGuard)
  suspendUser(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<{ message: string; is_suspended: boolean }> {
    return this.usersService.suspendUser(id);
  }

  @Delete(':id')
  @UseGuards(AdminSessionGuard)
  deleteUser(@Param('id', ParseIntPipe) id: number): Promise<{ message: string }> {
    return this.usersService.deleteUser(id);
  }
}
