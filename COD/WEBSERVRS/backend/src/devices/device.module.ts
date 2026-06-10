import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DevicesService } from './devices.service';
import { DevicesController } from './devices.controller';
import { Device } from './entities/device.entity';
import { User } from '../users/entities/user.entity';
import { HomeSettings } from '../home-settings/entities/home-settings.entity';
import { Room } from '../rooms/entities/room.entity';
import { TemperatureReading } from '../temperature-readings/entities/temperature-reading.entity';
import { LightZone } from '../light-zones/entities/light-zone.entity';
import { BoilerEvent } from '../events/entities/boiler-event.entity';
import { ScheduleModule } from '@nestjs/schedule'
import { TempSchedulerService } from './temp-scheduler.service';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([
            Device,
            User,
            HomeSettings,
            Room,
            TemperatureReading,
            LightZone,
            BoilerEvent
        ]),
        ScheduleModule.forRoot(),
        NotificationsModule,
    ],
    controllers: [DevicesController],
    providers: [DevicesService, TempSchedulerService],
    exports: [DevicesService, TempSchedulerService]
})


export class DevicesModule {}