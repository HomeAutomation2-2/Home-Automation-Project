import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import {
  BoilerEventDto,
  HeartbeatDto,
  LightEventDto,
  RegisterDeviceDto,
  SyncAckDto,
  TemperatureReadingDto,
} from './dto/embedded.dto';
import { EmbeddedService } from './embedded.service';

@Controller('embedded')
export class EmbeddedController {
  constructor(private readonly embeddedService: EmbeddedService) {}

  @Post('register')
  register(@Body() body: RegisterDeviceDto) {
    return this.embeddedService.register(body);
  }

  @Post('heartbeat')
  heartbeat(@Body() body: HeartbeatDto): Promise<{ status: 'ok' }> {
    return this.embeddedService.heartbeat(body);
  }

  @Post('readings/temperature')
  recordTemperature(@Body() body: TemperatureReadingDto): Promise<{ status: 'ok' }> {
    return this.embeddedService.recordTemperature(body);
  }

  @Post('events/light')
  recordLightEvent(@Body() body: LightEventDto): Promise<{ status: 'ok' }> {
    return this.embeddedService.recordLightEvent(body);
  }

  @Post('events/boiler')
  recordBoilerEvent(@Body() body: BoilerEventDto): Promise<{ status: 'ok' }> {
    return this.embeddedService.recordBoilerEvent(body);
  }

  @Get('sync/:deviceId')
  getPendingSync(@Param('deviceId') deviceId: string) {
    return this.embeddedService.getPendingSync(deviceId);
  }

  @Post('sync/:deviceId/ack')
  ackPendingSync(
    @Param('deviceId') deviceId: string,
    @Body() body: SyncAckDto,
  ): Promise<{ status: 'ok' }> {
    return this.embeddedService.ackPendingSync(deviceId, body);
  }
}
