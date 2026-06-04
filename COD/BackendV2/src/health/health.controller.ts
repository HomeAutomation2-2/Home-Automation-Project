import { Controller, Get } from '@nestjs/common';
import { DataSource } from 'typeorm';

@Controller('health')
export class HealthController {
  constructor(private readonly dataSource: DataSource) {}

  @Get()
  checkHealth(): { status: string; name: string; database: string } {
    return {
      status: 'ok',
      name: 'BlueLock BackendV2',
      database: this.dataSource.isInitialized ? 'ok' : 'unavailable',
    };
  }
}
