import { Body, Controller, Logger, Post } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginUserDto } from './dto/login-user.dto';



@Controller('users')
export class UsersController 
{
    private readonly logger = new Logger(UsersController.name)


    constructor(private readonly usersService: UsersService)
    {}


    @Post("register")
    async registre(@Body() user_data: CreateUserDto)
    {
        this.logger.log(`Regiester request for user: ${user_data}`)

        return await this.usersService.registerAccount(user_data)
    }


    @Post("login")
    async login(@Body() user_data: LoginUserDto)
    {
        this.logger.log(`Login request for user: ${user_data}`)
        
        return await this.usersService.loginUser(user_data)
    }
}
