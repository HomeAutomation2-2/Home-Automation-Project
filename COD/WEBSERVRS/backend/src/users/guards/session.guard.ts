import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuthSession } from '../../auth-sessions/entities/auth-session.entity';
import * as crypto from 'crypto';



@Injectable()
export class SessionGuard implements CanActivate {
    constructor(
        @InjectRepository(AuthSession)
        private sessionRepository: Repository<AuthSession>,
    ) {}

    
    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        
        const authHeader = request.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            throw new UnauthorizedException('Missing or invalid session token');
        }

        const rawToken = authHeader.split(' ')[1];

        // 1. Transformăm token-ul brut într-un hash SHA-256 (la fel cum face backend-ul la login)
        const tokenHash = crypto
            .createHash('sha256')
            .update(rawToken)
            .digest('hex');

        // 2. Căutăm în DB folosind hash-ul obținut și numele corect al coloanei
        const session = await this.sessionRepository.findOne({ 
            where: { 
                tokenHash: tokenHash, // <--- Folosim hash-ul criptat
                isActive: true        // <--- Opțional: ne asigurăm că sesiunea e încă activă
            }, 
            relations: { user: true }
        });

        if (!session || !session.user) {
            throw new UnauthorizedException('Invalid or expired session');
        }

        if (session.user.isSuspended) {
            throw new UnauthorizedException('User account is suspended');
        }

        request.user = session.user;
        return true;
    }
}