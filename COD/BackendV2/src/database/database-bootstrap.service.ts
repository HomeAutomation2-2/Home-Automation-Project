import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { DataSource } from 'typeorm';
import { loadAppConfig } from '../config/app-config';
import {
  Device,
  HomeSettings,
  LightZone,
  Room,
  TemperatureProgram,
  User,
} from './entities';

@Injectable()
export class DatabaseBootstrapService implements OnApplicationBootstrap {
  private readonly logger = new Logger(DatabaseBootstrapService.name);
  private readonly appConfig = loadAppConfig();

  constructor(private readonly dataSource: DataSource) {}

  async onApplicationBootstrap(): Promise<void> {
    await this.prepareSchema();
    await this.seedInitialData();
  }

  private async prepareSchema(): Promise<void> {
    if (this.appConfig.database.resetOnStart) {
      this.logger.warn('DB_RESET_ON_START=true: dropping and recreating schema');
      await this.dataSource.dropDatabase();
    }

    await this.dataSource.synchronize();
    this.logger.log('Database schema is ready');
  }

  private async seedInitialData(): Promise<void> {
    const program = await this.seedTemperatureProgram();
    const rooms = await this.seedRooms(program.id);
    await this.seedLightZones(rooms);
    await this.seedHomeSettings();
    await this.seedAdminUser();
    await this.seedEsp32Device();
    this.logger.log('Database seed is ready');
  }

  private async seedTemperatureProgram(): Promise<TemperatureProgram> {
    const repository = this.dataSource.getRepository(TemperatureProgram);
    const existing = await repository.findOne({ where: { name: 'Program default' } });

    if (existing) {
      return existing;
    }

    return repository.save(
      repository.create({
        name: 'Program default',
        schedule: [
          {
            days: [0, 1, 2, 3, 4, 5, 6],
            slots: [
              { time: '06:00', temp: 21 },
              { time: '22:00', temp: 19 },
            ],
          },
        ],
      }),
    );
  }

  private async seedRooms(programId: number): Promise<Room[]> {
    const repository = this.dataSource.getRepository(Room);
    const roomSpecs = [
      { name: 'ROOM1', hardwareCode: 'ROOM1' },
      { name: 'ROOM2', hardwareCode: 'ROOM2' },
    ];
    const rooms: Room[] = [];

    for (const spec of roomSpecs) {
      const existing = await repository.findOne({
        where: { hardwareCode: spec.hardwareCode },
      });

      if (existing) {
        rooms.push(existing);
        continue;
      }

      rooms.push(
        await repository.save(
          repository.create({
            name: spec.name,
            hardwareCode: spec.hardwareCode,
            tempProgramId: programId,
            currentTemp: 0,
            offsetValue: 0,
            isHeating: false,
          }),
        ),
      );
    }

    return rooms;
  }

  private async seedLightZones(rooms: Room[]): Promise<void> {
    const repository = this.dataSource.getRepository(LightZone);

    for (const room of rooms) {
      const existing = await repository.findOne({
        where: { roomId: room.id, name: `${room.hardwareCode} Light` },
      });

      if (existing) {
        continue;
      }

      await repository.save(
        repository.create({
          roomId: room.id,
          name: `${room.hardwareCode} Light`,
          isOn: false,
        }),
      );
    }
  }

  private async seedHomeSettings(): Promise<void> {
    const repository = this.dataSource.getRepository(HomeSettings);
    const count = await repository.count();

    if (count > 0) {
      return;
    }

    await repository.save(
      repository.create({
        hysteresis: this.appConfig.esp32.defaultHysteresis,
        antifreezeTemp: 7,
        sampleIntervalMs: this.appConfig.esp32.defaultSampleIntervalMs,
      }),
    );
  }

  private async seedAdminUser(): Promise<void> {
    const repository = this.dataSource.getRepository(User);
    const existing = await repository.findOne({
      where: { phone: this.appConfig.seed.adminPhone },
    });

    if (existing) {
      return;
    }

    const passwordHash = await bcrypt.hash(this.appConfig.seed.adminPassword, 10);

    await repository.save(
      repository.create({
        firstName: this.appConfig.seed.adminFirstName,
        lastName: this.appConfig.seed.adminLastName,
        cnp: this.appConfig.seed.adminCnp,
        phone: this.appConfig.seed.adminPhone,
        passwordHash,
        isAdmin: true,
        isSuspended: false,
        isHome: false,
        btCodeHash: null,
        btCodeEpoch: null,
      }),
    );
  }

  private async seedEsp32Device(): Promise<void> {
    const repository = this.dataSource.getRepository(Device);
    const existing = await repository.findOne({
      where: { deviceId: this.appConfig.esp32.deviceId },
    });

    if (existing) {
      return;
    }

    await repository.save(
      repository.create({
        deviceId: this.appConfig.esp32.deviceId,
        deviceType: 'gateway',
        firmwareVersion: null,
        ipAddress: null,
        isOnline: false,
        deviceToken: 'dev-device-token',
        lastSeenAt: null,
      }),
    );
  }
}
