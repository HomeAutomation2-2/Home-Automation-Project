import { Controller } from '@nestjs/common';
import { HeatingLoopsService } from './heating-loops.service';

@Controller('heating-loops')
export class HeatingLoopsController {
  constructor(private readonly heatingLoopsService: HeatingLoopsService) {}
}
