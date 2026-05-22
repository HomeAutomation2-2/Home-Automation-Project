import { ConflictException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import * as bcrypt from "bcrypt"
import { CreateUserDto } from './dto/create-user.dto';


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
    async registerAccount(new_user: CreateUserDto): Promise<Omit<User, 'passwordHash'>>
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
        
        return user_without_hash
    }
}
