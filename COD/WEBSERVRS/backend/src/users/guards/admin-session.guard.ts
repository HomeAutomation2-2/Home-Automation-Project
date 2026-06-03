import { Injectable, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { SessionGuard } from './session.guard';



@Injectable()
export class AdminSessionGuard extends SessionGuard 
{
    async canActivate(context: ExecutionContext): Promise<boolean> 
    {
        const isAuthenticated = await super.canActivate(context)

        if (!isAuthenticated) 
            return false

        const request = context.switchToHttp().getRequest()
        const user = request.user

        if (!user || !user.isAdmin) 
        {
            throw new UnauthorizedException('Access denied. Administrator privileges required.')
        }

        return true;
    }
}