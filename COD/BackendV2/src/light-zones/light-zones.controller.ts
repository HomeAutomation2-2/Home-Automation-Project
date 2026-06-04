import { Body, Controller, Get, Param, ParseIntPipe, Patch, Post, Query } from '@nestjs/common';
import { CreateLightZoneDto } from './dto/create-light-zone.dto';
import { UpdateLightZoneDto } from './dto/update-light-zone.dto';
import { LightZoneResponse } from './light-zone.presenter';
import { LightZonesService } from './light-zones.service';

@Controller('light-zones')
export class LightZonesController {
  constructor(private readonly lightZonesService: LightZonesService) {}

  @Get(':id')
  getZone(@Param('id', ParseIntPipe) id: number): Promise<LightZoneResponse> {
    return this.lightZonesService.getZone(id);
  }

  @Get()
  getZones(@Query('room_id') roomId?: string): Promise<LightZoneResponse[]> {
    return this.lightZonesService.getZones(
      roomId !== undefined ? Number(roomId) : undefined,
    );
  }

  @Patch(':id')
  updateZone(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateRequest: UpdateLightZoneDto,
  ): Promise<LightZoneResponse> {
    return this.lightZonesService.updateZone(id, updateRequest);
  }

  @Post()
  createZone(@Body() createZoneRequest: CreateLightZoneDto): Promise<LightZoneResponse> {
    return this.lightZonesService.createZone(createZoneRequest);
  }
}
