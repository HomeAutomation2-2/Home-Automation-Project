import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { User } from '../database/entities';
import { AuthSessionsService } from './auth-sessions.service';

export interface AuthenticatedRequest extends Request {
  user?: User;
}

@Injectable()
export class SessionGuard implements CanActivate {
  constructor(private readonly authSessionsService: AuthSessionsService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const token = this.extractToken(request);

    if (!token) {
      throw new UnauthorizedException('Missing session token');
    }

    const user = await this.authSessionsService.getUserForToken(token);

    if (!user) {
      throw new UnauthorizedException('Invalid or expired session token');
    }

    request.user = user;
    return true;
  }

  private extractToken(request: Request): string | null {
    const authorization = request.headers.authorization;

    if (!authorization) {
      return null;
    }

    const [type, token] = authorization.split(' ');

    if (type !== 'Bearer' || !token) {
      return null;
    }

    return token;
  }
}
