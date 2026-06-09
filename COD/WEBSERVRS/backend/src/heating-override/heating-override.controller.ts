import { Body, Controller, Delete, Get, Post } from '@nestjs/common';
import { CreateHeatingOverrideDto } from './dto/create-heating-override.dto';
import { HeatingOverrideService } from './heating-override.service';

@Controller('heating')
export class HeatingOverrideController {
    constructor(private readonly heatingOverrideService: HeatingOverrideService) {}

    @Get('override')
    getOverrideStatus() {
        return this.heatingOverrideService.getStatus();
    }

    @Post('override')
    activateOverride(@Body() body: CreateHeatingOverrideDto) {
        return this.heatingOverrideService.activate(body);
    }

    @Delete('override')
    deactivateOverride() {
        return this.heatingOverrideService.deactivate();
    }
}
