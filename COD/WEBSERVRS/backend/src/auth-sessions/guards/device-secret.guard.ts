import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';



@Injectable()
export class DeviceSecretGuard implements CanActivate 
{
    canActivate(context: ExecutionContext): boolean 
    {
        const req = context.switchToHttp().getRequest();
        const secret = req.headers['x-device-secret'];

        if (!secret || secret !== process.env.DEVICE_SECRET) 
            {
            throw new UnauthorizedException('Invalid device secret.');
        }

        return true;
    }
}