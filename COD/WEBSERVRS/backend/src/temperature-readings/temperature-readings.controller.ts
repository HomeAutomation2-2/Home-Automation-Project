import { Controller } from '@nestjs/common';
import { TemperatureReadingsService } from './temperature-readings.service';

@Controller('temperature-readings')
export class TemperatureReadingsController {
  constructor(private readonly temperatureReadingsService: TemperatureReadingsService) {}
}
