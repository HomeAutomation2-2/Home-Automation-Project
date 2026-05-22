import { ConflictException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import * as bcrypt from "bcrypt"
import { CreateUserDto } from './dto/create-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { UserResponse } from './dto/user-response.dto';


@Injectable()
export class UsersService 
{
    constructor(
        @InjectRepository(User)
        private readonly user_repository: Repository<User>,
    ) {}


    /**
     * Search for a user by their phone number.
     * @param phone_number The phone number of the user.
     * @returns The user with the phone number or `null`.
     */
    async findByPhone(phone_number: string): Promise<User|null>
    {
        return await this.user_repository.findOne({
            where: { phone: phone_number }
        })
    }


    /**
     * Create a new user.
     * @param new_user An object containing the new user data.
     * @returns The new user.
     */
    async registerAccount(new_user: CreateUserDto): Promise<UserResponse>
    {
        const existing_user = await this.user_repository.findOne({
            where: [{ phone: new_user.phone }, { cnp: new_user.cnp }]
        })

        if (existing_user)
            throw new ConflictException("A user with this phone number of CNP already exists")

        const salt = await bcrypt.genSalt()
        const hashed_password = await bcrypt.hash(new_user.password_plaintext, salt)

        const user = this.user_repository.create({
            ...new_user,
            passwordHash: hashed_password
        })
        
        const saved_user = await this.user_repository.save(user)
        const { passwordHash, ...user_without_hash } = saved_user
        
        return user_without_hash as UserResponse
    }


    /**
     * Log in a user.
     * @param user_data The user's phone number and password.
     * @returns The user data.
     */
    async loginUser(user_data: LoginUserDto): Promise<UserResponse>
    {
        const existing_user = await this.user_repository.findOne({
            where: [{ phone: user_data.phone }]
        })

        if (!existing_user)
            throw new NotFoundException("Could not find a user with this phone number")

        const is_password_valid = await bcrypt.compare(user_data.password_plaintext, existing_user.passwordHash)

        if (!is_password_valid)
            throw new UnauthorizedException("Invalid credentials")

        if (existing_user.isSuspended)
            throw new UnauthorizedException("Account suspended")

        const { passwordHash, sessions, ...user_without_hash } = existing_user
        
        return user_without_hash as UserResponse
    }
}
