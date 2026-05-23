import { Body, Controller, Get, Param, ParseIntPipe, Patch, Post, Query } from '@nestjs/common';
import { LightZonesService } from './light-zones.service';
import { GetLightZoneRequestDto } from './dto/get-light-zone-request.dto';
import { GetLightZonesRequestDto } from './dto/get-light-zones-request.dto';
import { UpdateLightZoneDto } from './dto/update-light-zone.dto';
import { CreateLightZoneDto } from './dto/create-light-zone.dto';



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
    updateZone(
        @Param("id", ParseIntPipe) id: number,
        @Body() update_request: UpdateLightZoneDto,
    ) {
        return this.lightZonesService.updateZone(id, update_request);
    }

    @Post()
    createZone(@Body() create_zone_request: CreateLightZoneDto)
    {
        return this.lightZonesService.createZone(create_zone_request)
    }
}
