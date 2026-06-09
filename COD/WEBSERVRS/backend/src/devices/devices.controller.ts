import { Controller, Post, Body, UseGuards, HttpCode } from '@nestjs/common';
import { DevicesService } from './devices.service';
import { RegisterDeviceDto } from './dto/create-device.dto';
import { DeviceSecretGuard } from '../auth-sessions/guards/device-secret.guard';
import { SensorDataDto } from './dto/sensors-data.dto';



@Controller('devices')
export class DevicesController 
{
    constructor(private readonly devicesService: DevicesService) {}


    @Post('register')
    @UseGuards(DeviceSecretGuard)
    register(@Body() dto: RegisterDeviceDto) 
    {
        console.log(`device registration request: ${dto.ip}`)
        return this.devicesService.register(dto)
    }

    
    @Post('sensors')
    @UseGuards(DeviceSecretGuard)
    @HttpCode(200)
    async sensors(@Body() dto: SensorDataDto): Promise<void> 
    {
        await this.devicesService.updateSensorData(dto);
    }
}