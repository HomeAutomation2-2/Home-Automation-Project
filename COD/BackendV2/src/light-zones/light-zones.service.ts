import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { loadAppConfig } from '../config/app-config';
import { LightEvent, LightZone, PendingDeviceSync, Room } from '../database/entities';
import { EspGatewayService } from '../esp-gateway/esp-gateway.service';
import { CreateLightZoneDto } from './dto/create-light-zone.dto';
import { UpdateLightZoneDto } from './dto/update-light-zone.dto';
import { LightZoneResponse, presentLightZone } from './light-zone.presenter';

@Injectable()
export class LightZonesService {
  private readonly appConfig = loadAppConfig();

  constructor(
    @InjectRepository(LightZone)
    private readonly zoneRepository: Repository<LightZone>,
    @InjectRepository(Room)
    private readonly roomRepository: Repository<Room>,
    @InjectRepository(LightEvent)
    private readonly lightEventRepository: Repository<LightEvent>,
    @InjectRepository(PendingDeviceSync)
    private readonly pendingSyncRepository: Repository<PendingDeviceSync>,
    private readonly espGatewayService: EspGatewayService,
  ) {}

  async getZone(zoneId: number): Promise<LightZoneResponse> {
    return presentLightZone(await this.findZoneOrThrow(zoneId));
  }

  async getZones(roomId?: number): Promise<LightZoneResponse[]> {
    if (roomId !== undefined) {
      const roomExists = await this.roomRepository.exists({ where: { id: roomId } });

      if (!roomExists) {
        throw new NotFoundException('The specified room does not exist');
      }
    }

    const zones = await this.zoneRepository.find({
      where: roomId !== undefined ? { roomId } : {},
      order: { id: 'ASC' },
    });

    return zones.map(presentLightZone);
  }

  async createZone(dto: CreateLightZoneDto): Promise<LightZoneResponse> {
    const room = await this.roomRepository.findOne({ where: { id: dto.room_id } });

    if (!room) {
      throw new BadRequestException('The parent room does not exist');
    }

    const existingZone = await this.zoneRepository.findOne({
      where: { name: dto.name, roomId: dto.room_id },
    });

    if (existingZone) {
      throw new ConflictException('A zone with this name exists in this room');
    }

    const zone = await this.zoneRepository.save(
      this.zoneRepository.create({
        roomId: dto.room_id,
        name: dto.name,
        isOn: false,
      }),
    );

    return presentLightZone(zone);
  }

  async updateZone(id: number, dto: UpdateLightZoneDto): Promise<LightZoneResponse> {
    const zone = await this.findZoneOrThrow(id);

    if (dto.name !== undefined) {
      zone.name = dto.name;
    }

    if (dto.is_on !== undefined && dto.is_on !== zone.isOn) {
      const room = await this.roomRepository.findOne({ where: { id: zone.roomId } });

      if (!room) {
        throw new BadRequestException('The parent room does not exist');
      }

      const delivered = await this.espGatewayService.sendLightCommand(
        room.hardwareCode,
        dto.is_on,
      );

      if (!delivered) {
        await this.createPendingSync('light', {
          zone_id: zone.id,
          room_code: room.hardwareCode,
          is_on: dto.is_on,
        });
      }

      zone.isOn = dto.is_on;
      await this.lightEventRepository.save(
        this.lightEventRepository.create({
          zoneId: zone.id,
          userId: null,
          newState: zone.isOn,
        }),
      );
    }

    return presentLightZone(await this.zoneRepository.save(zone));
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

  private async findZoneOrThrow(zoneId: number): Promise<LightZone> {
    const zone = await this.zoneRepository.findOne({ where: { id: zoneId } });

    if (!zone) {
      throw new NotFoundException(`Light zone with ID ${zoneId} not found`);
    }

    return zone;
  }
}
