import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Device } from './entities/device.entity';
import { RegisterDeviceDto } from './dto/create-device.dto';



@Injectable()
export class DevicesService 
{
    constructor(
        @InjectRepository(Device)
        private devicesRepository: Repository<Device>,
    ) {}


    /**
     * Register a new ESP device with the server.
     */
    async register(dto: RegisterDeviceDto): Promise<Device> 
    {
        if (dto.secret !== process.env.DEVICE_SECRET) 
            throw new UnauthorizedException('Secret invalid')

        const device = this.devicesRepository.create({ ip: dto.ip })

        return this.devicesRepository.save(device)
    }
}