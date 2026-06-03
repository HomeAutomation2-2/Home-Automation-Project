import { Module } from '@nestjs/common';
import { RoomsService } from './rooms.service';
import { RoomsController } from './rooms.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Room } from './entities/room.entity';
import { TemperatureProgram } from '../temperature-programs/entities/temperature-program.entity';



@Module({
    imports: [TypeOrmModule.forFeature([Room]), TypeOrmModule.forFeature([TemperatureProgram])],
    controllers: [RoomsController],
    providers: [RoomsService],
})


export class RoomsModule {}
