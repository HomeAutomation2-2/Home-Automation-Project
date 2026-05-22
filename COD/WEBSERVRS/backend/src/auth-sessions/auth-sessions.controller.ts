import { Body, Controller, Post } from '@nestjs/common';
import { AuthSessionsService } from './auth-sessions.service';



@Controller('auth-sessions')
export class AuthSessionsController 
{
    constructor(private readonly authSessionsService: AuthSessionsService) {}


    @Post("login")
    async login(@Body() body: { phone_number: string, password_plaintext: string }
    ) 
    {
        return await this.authSessionsService.login(body.phone_number, body.password_plaintext)
    }
}
