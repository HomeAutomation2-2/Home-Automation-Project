import { Controller } from '@nestjs/common';
import { LightZonesService } from './light-zones.service';

@Controller('light-zones')
export class LightZonesController {
  constructor(private readonly lightZonesService: LightZonesService) {}
}
