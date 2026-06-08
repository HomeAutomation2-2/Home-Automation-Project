import { IsIP, IsNotEmpty, IsString } from 'class-validator';



export class RegisterDeviceDto 
{
    @IsIP()
    @IsNotEmpty()
    ip!: string;

    @IsString()
    @IsNotEmpty()
    secret!: string;
}