import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HeatingOverrideController } from './heating-override.controller';
import { HeatingOverrideService } from './heating-override.service';
import { HeatingOverride } from './entities/heating-override.entity';
import { TemperatureProgram } from '../temperature-programs/entities/temperature-program.entity';

@Module({
    imports: [TypeOrmModule.forFeature([HeatingOverride, TemperatureProgram])],
    controllers: [HeatingOverrideController],
    providers: [HeatingOverrideService],
})
export class HeatingOverrideModule {}
