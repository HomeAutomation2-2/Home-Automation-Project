import { Body, Controller, Get, Param, ParseIntPipe, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { LightZonesService } from './light-zones.service';
import { GetLightZoneRequestDto } from './dto/get-light-zone-request.dto';
import { GetLightZonesRequestDto } from './dto/get-light-zones-request.dto';
import { UpdateLightZoneDto } from './dto/update-light-zone.dto';
import { CreateLightZoneDto } from './dto/create-light-zone.dto';
import { GetUser } from '../users/decorators/get-user.decorator';
import { User } from '../users/entities/user.entity';
import { SessionGuard } from '../users/guards/session.guard';



@Controller('light-zones')
export class LightZonesController 
{
    constructor(private readonly lightZonesService: LightZonesService) {}


    @Get(":id")
    getZone(@Param() zone_request: GetLightZoneRequestDto)
    {
        return this.lightZonesService.getZone(zone_request)
    }


    @Get()
    getZones(@Query() zones_request: GetLightZonesRequestDto)
    {
        return this.lightZonesService.getZones(zones_request)
    }


    @Patch(":id")
    @UseGuards(SessionGuard)
    updateZone(
        @Param("id", ParseIntPipe) id: number,
        @Body() update_request: UpdateLightZoneDto,
        @GetUser() user: User,
    ) {
        return this.lightZonesService.updateZone(id, update_request, user);
    }

    @Post()
    createZone(@Body() create_zone_request: CreateLightZoneDto)
    {
        return this.lightZonesService.createZone(create_zone_request)
    }
}
