import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { loadAppConfig } from '../config/app-config';
import { PendingDeviceSync, ProgramPeriod, Room, TemperatureProgram } from '../database/entities';
import { EspGatewayService } from '../esp-gateway/esp-gateway.service';
import { CreateRoomDto } from './dto/create-room.dto';
import { presentRoom, RoomResponse } from './room.presenter';

@Injectable()
export class RoomsService {
  private readonly appConfig = loadAppConfig();

  constructor(
    @InjectRepository(Room)
    private readonly roomRepository: Repository<Room>,
    @InjectRepository(TemperatureProgram)
    private readonly programRepository: Repository<TemperatureProgram>,
    @InjectRepository(PendingDeviceSync)
    private readonly pendingSyncRepository: Repository<PendingDeviceSync>,
    private readonly espGatewayService: EspGatewayService,
  ) {}

  async findAll(): Promise<RoomResponse[]> {
    const rooms = await this.roomRepository.find({ order: { id: 'ASC' } });
    return rooms.map(presentRoom);
  }

  async createRoom(dto: CreateRoomDto): Promise<RoomResponse> {
    const existingRoom = await this.roomRepository.findOne({
      where: { name: dto.name },
    });

    if (existingRoom) {
      throw new ConflictException('A room with this name already exists');
    }

    const room = await this.roomRepository.save(
      this.roomRepository.create({
        name: dto.name,
        hardwareCode: dto.hardware_code ?? dto.name,
        tempProgramId: null,
        isHeating: false,
        offsetValue: 0,
        currentTemp: 0,
      }),
    );

    return presentRoom(room);
  }

  async getRoom(roomId: number): Promise<RoomResponse> {
    return presentRoom(await this.findRoomOrThrow(roomId));
  }

  async setTempProgramId(
    roomId: number,
    programId: number | null,
  ): Promise<{ success: true }> {
    if (programId !== null) {
      const program = await this.programRepository.findOne({ where: { id: programId } });

      if (!program) {
        throw new NotFoundException(`Program with ID ${programId} not found`);
      }
    }

    const room = await this.findRoomOrThrow(roomId);
    room.tempProgramId = programId;
    await this.roomRepository.save(room);

    if (programId !== null) {
      const program = await this.programRepository.findOne({ where: { id: programId } });
      const targetTemp = this.getCurrentTargetTemp(program?.schedule ?? []);
      const delivered = await this.espGatewayService.sendTemperatureTarget(
        room.hardwareCode,
        targetTemp,
      );

      if (!delivered) {
        await this.createPendingSync('temperature-target', {
          room_id: room.id,
          room_code: room.hardwareCode,
          target_temp: targetTemp,
        });
      }
    }

    return { success: true };
  }

  private async findRoomOrThrow(roomId: number): Promise<Room> {
    const room = await this.roomRepository.findOne({ where: { id: roomId } });

    if (!room) {
      throw new NotFoundException(`Room with ID ${roomId} not found`);
    }

    return room;
  }

  private getCurrentTargetTemp(schedule: ProgramPeriod[]): number {
    const now = new Date();
    const currentDay = now.getDay();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    const period = schedule.find((item) => item.days.includes(currentDay)) ?? schedule[0];

    if (!period || period.slots.length === 0) {
      return 21;
    }

    const sortedSlots = [...period.slots].sort(
      (left, right) => this.toMinutes(left.time) - this.toMinutes(right.time),
    );
    const activeSlot =
      [...sortedSlots].reverse().find((slot) => this.toMinutes(slot.time) <= currentMinutes) ??
      sortedSlots[sortedSlots.length - 1];

    if (typeof activeSlot.temp === 'number') {
      return activeSlot.temp;
    }

    return activeSlot.temp === 'antifreeze' ? 7 : 0;
  }

  private toMinutes(time: string): number {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  }

  private async createPendingSync(
    type: string,
    payload: Record<string, unknown>,
  ): Promise<void> {
    await this.pendingSyncRepository.save(
      this.pendingSyncRepository.create({
        deviceId: this.appConfig.esp32.deviceId,
        type,
        payload,
        isApplied: false,
        appliedAt: null,
      }),
    );
  }
}
