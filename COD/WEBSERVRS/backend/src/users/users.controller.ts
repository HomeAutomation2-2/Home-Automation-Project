import { Body, Controller, Delete, Get, HttpCode, Logger, Param, ParseIntPipe, Patch, Post, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { SessionGuard } from './guards/session.guard';
import { GetUser } from './decorators/get-user.decorator';
import { User } from './entities/user.entity';
import { AdminSessionGuard } from './guards/admin-session.guard';



@Controller('users')
export class UsersController 
{
    private readonly logger = new Logger(UsersController.name)


    constructor(private readonly usersService: UsersService)
    {}


    @Post("register")
    @UseGuards(AdminSessionGuard)
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

    @Get('me')
    @UseGuards(SessionGuard)
    getMe(@GetUser() user: User) 
    {
        const { passwordHash, sessions, btCodeHash, ...safeUser } = user;
        
        return safeUser;
    }

    /**
     * Get the info of all users on the server.
     */
    @Get('presence')
    @UseGuards(SessionGuard)
    async getUsersPresence() 
    {
        return this.usersService.getAllUsersPresence()
    }


    /**
     * Get all the logs. If the user session token is of an admin, they get back all logs for
     * all users, else only logs for that user.
     */
    @Get('logs')
    @UseGuards(SessionGuard)
    async getSystemLogs(@GetUser() user: User) 
    {
        return this.usersService.getUnifiedLogs(user);
    }


    /**
     * Device binding status (admin).
     */
    @Get(':id/device-binding')
    @UseGuards(AdminSessionGuard)
    async getDeviceBinding(@Param('id', ParseIntPipe) id: number) 
    {
        return this.usersService.getDeviceBinding(id);
    }

    @Post(':id/device-binding')
    @UseGuards(AdminSessionGuard)
    async initiateDeviceBinding(@Param('id', ParseIntPipe) id: number) 
    {
        return this.usersService.initiateDeviceBinding(id);
    }

    @Delete(':id/device-binding')
    @HttpCode(204)
    @UseGuards(AdminSessionGuard)
    async revokeDeviceBinding(@Param('id', ParseIntPipe) id: number) 
    {
        await this.usersService.revokeDeviceBinding(id);
    }

    /**
     * View details about a user. Only for admins.
     * @param target_user_id The ID of the user you want to see.
     * @returns The user data.
     */
    @Get(':id')
    @UseGuards(AdminSessionGuard)
    async getUserDetailsForAdmin(@Param('id', ParseIntPipe) target_user_id: number) 
    {
        return this.usersService.getDetailedProfileForAdmin(target_user_id)
    }

    /**
     * Update user profile fields (admin).
     */
    @Patch(':id')
    @UseGuards(AdminSessionGuard)
    async updateUser(
        @Param('id', ParseIntPipe) id: number,
        @Body() body: UpdateUserDto,
    ) 
    {
        return this.usersService.updateUser(id, body);
    }

    /**
     * Suspend a user.
     * @param id The ID of the user to suspend.
     * @returns The ID of the user suspended.
     */
    @Patch(':id/suspend')
    @UseGuards(AdminSessionGuard)
    async suspendUser(@Param('id', ParseIntPipe) id: number) 
    {
        return this.usersService.suspendUser(id)
    }


    /**
     * Delete a user.
     * @param id The ID of the user to delete.
     * @returns The ID of the user deleted.
     */
    @Delete(':id')
    @UseGuards(AdminSessionGuard)
    async deleteUser(@Param('id', ParseIntPipe) id: number) 
    {
        return this.usersService.deleteUser(id)
    }
}
