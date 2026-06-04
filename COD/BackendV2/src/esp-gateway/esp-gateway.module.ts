import { Global, Module } from '@nestjs/common';
import { EspGatewayService } from './esp-gateway.service';

@Global()
@Module({
  providers: [EspGatewayService],
  exports: [EspGatewayService],
})
export class EspGatewayModule {}
