import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AuthSession } from './entities/auth-session.entity';
import { Repository } from 'typeorm';
import { UsersService } from '../users/users.service';
import * as crypto from "crypto"
import * as bcrypt from "bcrypt"



@Injectable()
export class AuthSessionsService 
{
    constructor(
        @InjectRepository(AuthSession)
        private readonly session_repository: Repository<AuthSession>,

        private readonly user_service: UsersService
    ) {}


    /**
     * Log in using an existing account.
     * @param phone_number The phone number acting as the username.
     * @param password_plaintext The password for the account in plaintext.
     * @returns The new session token.
     */
    async login(phone_number: string, password_plaintext: string)
    {
        const error_message = "Invalid credentials or suspended account"
        const user = await this.user_service.findByPhone(phone_number)
        
        if (!user)
            throw new UnauthorizedException(error_message)
        
        const password_match = await bcrypt.compare(password_plaintext, user.passwordHash)

        if (!user || !password_match || user.isSuspended)
            throw new UnauthorizedException(error_message)

        /* invalidate all other sessions */
        await this.session_repository.update(
            { userId: user.id, isActive: true },
            { isActive: false }
        )

        const new_session_token = crypto
            .randomBytes(32)
            .toString("hex")
        const session_token_hash = crypto
            .createHash("sha256")
            .update(new_session_token)
            .digest("hex")
        const session_expires_at = new Date()
        session_expires_at.setHours(session_expires_at.getHours() + 24)

        const new_session = this.session_repository.create({
            userId: user.id,
            tokenHash: session_token_hash,
            isActive: true,
            expiresAt: session_expires_at
        })

        await this.session_repository.save(new_session)

        return { token: new_session_token }
    }
}
