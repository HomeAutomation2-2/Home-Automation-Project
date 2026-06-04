import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { loadAppConfig } from '../config/app-config';
import {
  BoilerEvent,
  Device,
  HomeSettings,
  LightEvent,
  LightZone,
  PendingDeviceSync,
  Room,
  TemperatureReading,
} from '../database/entities';
import {
  BoilerEventDto,
  HeartbeatDto,
  LightEventDto,
  RegisterDeviceDto,
  SyncAckDto,
  TemperatureReadingDto,
} from './dto/embedded.dto';

type RegisterResponse = {
  device_token: string;
  sample_interval_ms: number;
  hysteresis: number;
  nodes: {
    light_node_ip: string;
    boiler_node_ip: string;
  };
  rooms: Array<{ id: number; code: string; target_temp: number }>;
  light_zones: Array<{ id: number; room_code: string; is_on: boolean }>;
};

@Injectable()
export class EmbeddedService {
  private readonly appConfig = loadAppConfig();

  constructor(
    @InjectRepository(Device)
    private readonly deviceRepository: Repository<Device>,
    @InjectRepository(Room)
    private readonly roomRepository: Repository<Room>,
    @InjectRepository(LightZone)
    private readonly lightZoneRepository: Repository<LightZone>,
    @InjectRepository(HomeSettings)
    private readonly homeSettingsRepository: Repository<HomeSettings>,
    @InjectRepository(TemperatureReading)
    private readonly readingRepository: Repository<TemperatureReading>,
    @InjectRepository(LightEvent)
    private readonly lightEventRepository: Repository<LightEvent>,
    @InjectRepository(BoilerEvent)
    private readonly boilerEventRepository: Repository<BoilerEvent>,
    @InjectRepository(PendingDeviceSync)
    private readonly pendingSyncRepository: Repository<PendingDeviceSync>,
  ) {}

  async register(dto: RegisterDeviceDto): Promise<RegisterResponse> {
    const device = await this.upsertDevice({
      deviceId: dto.device_id,
      deviceType: dto.device_type,
      firmwareVersion: dto.firmware_version ?? null,
      ipAddress: dto.ip_address ?? null,
      isOnline: true,
    });

    return this.buildRegisterResponse(device.deviceToken);
  }

  async heartbeat(dto: HeartbeatDto): Promise<{ status: 'ok' }> {
    await this.upsertDevice({
      deviceId: dto.device_id,
      deviceType: 'gateway',
      firmwareVersion: dto.firmware_version ?? null,
      ipAddress: dto.ip_address ?? null,
      isOnline: true,
    });

    return { status: 'ok' };
  }

  async recordTemperature(dto: TemperatureReadingDto): Promise<{ status: 'ok' }> {
    const room = await this.roomRepository.findOne({
      where: { hardwareCode: dto.room_code },
    });

    if (!room) {
      throw new BadRequestException(`Unknown room code ${dto.room_code}`);
    }

    room.currentTemp = dto.value;
    await this.roomRepository.save(room);
    await this.readingRepository.save(
      this.readingRepository.create({
        roomId: room.id,
        value: dto.value,
        humidity: dto.humidity ?? null,
      }),
    );

    return { status: 'ok' };
  }

  async recordLightEvent(dto: LightEventDto): Promise<{ status: 'ok' }> {
    await this.lightEventRepository.save(
      this.lightEventRepository.create({
        zoneId: dto.zone_id ?? null,
        userId: null,
        newState: dto.new_state,
      }),
    );

    return { status: 'ok' };
  }

  async recordBoilerEvent(dto: BoilerEventDto): Promise<{ status: 'ok' }> {
    await this.boilerEventRepository.save(
      this.boilerEventRepository.create({
        newState: dto.new_state,
      }),
    );

    return { status: 'ok' };
  }

  async getPendingSync(deviceId: string): Promise<PendingDeviceSync[]> {
    return this.pendingSyncRepository.find({
      where: { deviceId, isApplied: false },
      order: { createdAt: 'ASC' },
    });
  }

  async ackPendingSync(deviceId: string, dto: SyncAckDto): Promise<{ status: 'ok' }> {
    if (dto.ids.length === 0) {
      return { status: 'ok' };
    }

    await this.pendingSyncRepository.update(
      { deviceId, id: In(dto.ids) },
      { isApplied: true, appliedAt: new Date() },
    );

    return { status: 'ok' };
  }

  private async upsertDevice(input: {
    deviceId: string;
    deviceType: string;
    firmwareVersion: string | null;
    ipAddress: string | null;
    isOnline: boolean;
  }): Promise<Device> {
    const existing = await this.deviceRepository.findOne({
      where: { deviceId: input.deviceId },
    });

    if (existing) {
      existing.deviceType = input.deviceType;
      existing.firmwareVersion = input.firmwareVersion;
      existing.ipAddress = input.ipAddress;
      existing.isOnline = input.isOnline;
      existing.lastSeenAt = new Date();
      return this.deviceRepository.save(existing);
    }

    return this.deviceRepository.save(
      this.deviceRepository.create({
        deviceId: input.deviceId,
        deviceType: input.deviceType,
        firmwareVersion: input.firmwareVersion,
        ipAddress: input.ipAddress,
        isOnline: input.isOnline,
        deviceToken: 'dev-device-token',
        lastSeenAt: new Date(),
      }),
    );
  }

  private async buildRegisterResponse(deviceToken: string): Promise<RegisterResponse> {
    const [settings, rooms, zones] = await Promise.all([
      this.homeSettingsRepository.findOne({ where: {} }),
      this.roomRepository.find({ order: { id: 'ASC' } }),
      this.lightZoneRepository.find({ order: { id: 'ASC' } }),
    ]);
    const roomsById = new Map(rooms.map((room) => [room.id, room]));

    return {
      device_token: deviceToken,
      sample_interval_ms:
        settings?.sampleIntervalMs ?? this.appConfig.esp32.defaultSampleIntervalMs,
      hysteresis: Number(settings?.hysteresis ?? this.appConfig.esp32.defaultHysteresis),
      nodes: {
        light_node_ip: this.appConfig.esp32.lightNodeIp,
        boiler_node_ip: this.appConfig.esp32.boilerNodeIp,
      },
      rooms: rooms.map((room) => ({
        id: room.id,
        code: room.hardwareCode,
        target_temp: 21,
      })),
      light_zones: zones.map((zone) => ({
        id: zone.id,
        room_code: roomsById.get(zone.roomId)?.hardwareCode ?? 'UNKNOWN',
        is_on: zone.isOn,
      })),
    };
  }
}
