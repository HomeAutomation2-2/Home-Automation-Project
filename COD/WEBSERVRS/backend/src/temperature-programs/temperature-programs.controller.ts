import { Controller } from '@nestjs/common';
import { TemperatureProgramsService } from './temperature-programs.service';

@Controller('temperature-programs')
export class TemperatureProgramsController {
  constructor(private readonly temperatureProgramsService: TemperatureProgramsService) {}
}
