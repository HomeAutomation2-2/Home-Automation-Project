import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { SessionGuard, AuthenticatedRequest } from './session.guard';

@Injectable()
export class AdminSessionGuard implements CanActivate {
  constructor(private readonly sessionGuard: SessionGuard) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    await this.sessionGuard.canActivate(context);
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();

    if (!request.user?.isAdmin) {
      throw new ForbiddenException('Admin privileges are required');
    }

    return true;
  }
}
