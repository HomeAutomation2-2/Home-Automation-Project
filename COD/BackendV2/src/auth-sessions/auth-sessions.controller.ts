import { Body, Controller, Post } from '@nestjs/common';
import { AuthSessionsService } from './auth-sessions.service';
import { LoginSessionDto } from './dto/login-session.dto';

@Controller('auth-sessions')
export class AuthSessionsController {
  constructor(private readonly authSessionsService: AuthSessionsService) {}

  @Post('login')
  login(@Body() body: LoginSessionDto): Promise<{ token: string }> {
    return this.authSessionsService.login(
      body.phone_number,
      body.password_plaintext,
    );
  }
}
