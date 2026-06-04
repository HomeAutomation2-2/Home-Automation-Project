import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export type PeriodSlot = {
  time: string;
  temp: number | 'off' | 'antifreeze';
};

export type ProgramPeriod = {
  days: number[];
  slots: PeriodSlot[];
};

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: 'first_name', length: 100 })
  firstName!: string;

  @Column({ name: 'last_name', length: 100 })
  lastName!: string;

  @Column({ unique: true, length: 13 })
  cnp!: string;

  @Column({ unique: true, length: 20 })
  phone!: string;

  @Column({ name: 'password_hash', length: 255 })
  passwordHash!: string;

  @Column({ name: 'is_admin', default: false })
  isAdmin!: boolean;

  @Column({ name: 'is_suspended', default: false })
  isSuspended!: boolean;

  @Column({ name: 'is_home', default: false })
  isHome!: boolean;

  @Column({ name: 'bt_code_hash', type: 'varchar', length: 255, nullable: true })
  btCodeHash!: string | null;

  @Column({ name: 'bt_code_epoch', type: 'int', nullable: true })
  btCodeEpoch!: number | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;
}

@Entity('auth_sessions')
export class AuthSession {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: 'user_id' })
  userId!: number;

  @Column({ name: 'token_hash', unique: true, length: 255 })
  tokenHash!: string;

  @Column({ name: 'is_active', default: true })
  isActive!: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @Column({ name: 'expires_at', type: 'timestamp' })
  expiresAt!: Date;
}

@Entity('temperature_programs')
export class TemperatureProgram {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ length: 100 })
  name!: string;

  @Column({ type: 'jsonb' })
  schedule!: ProgramPeriod[];
}

@Entity('rooms')
export class Room {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ unique: true, length: 100 })
  name!: string;

  @Column({ name: 'hardware_code', unique: true, length: 50 })
  hardwareCode!: string;

  @Column({ name: 'temp_program_id', type: 'int', nullable: true })
  tempProgramId!: number | null;

  @Column({ name: 'is_heating', default: false })
  isHeating!: boolean;

  @Column({ name: 'offset_value', type: 'decimal', precision: 4, scale: 2, default: 0 })
  offsetValue!: number;

  @Column({ name: 'current_temp', type: 'decimal', precision: 5, scale: 2, default: 0 })
  currentTemp!: number;
}

@Entity('light_zones')
export class LightZone {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: 'room_id' })
  roomId!: number;

  @Column({ length: 100 })
  name!: string;

  @Column({ name: 'is_on', default: false })
  isOn!: boolean;

  @CreateDateColumn({ name: 'last_changed_at' })
  lastChangedAt!: Date;
}

@Entity('temperature_readings')
export class TemperatureReading {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: 'room_id' })
  roomId!: number;

  @Column({ type: 'decimal', precision: 5, scale: 2 })
  value!: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  humidity!: number | null;

  @CreateDateColumn({ name: 'occurred_at' })
  occurredAt!: Date;
}

@Entity('access_events')
export class AccessEvent {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: 'user_id', type: 'int', nullable: true })
  userId!: number | null;

  @Column({ length: 10 })
  direction!: 'in' | 'out';

  @CreateDateColumn({ name: 'occurred_at' })
  occurredAt!: Date;
}

@Entity('light_events')
export class LightEvent {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: 'zone_id', type: 'int', nullable: true })
  zoneId!: number | null;

  @Column({ name: 'user_id', type: 'int', nullable: true })
  userId!: number | null;

  @Column({ name: 'new_state' })
  newState!: boolean;

  @CreateDateColumn({ name: 'occurred_at' })
  occurredAt!: Date;
}

@Entity('boiler_events')
export class BoilerEvent {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: 'new_state' })
  newState!: boolean;

  @CreateDateColumn({ name: 'occurred_at' })
  occurredAt!: Date;
}

@Entity('home_settings')
export class HomeSettings {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'decimal', precision: 4, scale: 2 })
  hysteresis!: number;

  @Column({ name: 'antifreeze_temp', type: 'decimal', precision: 5, scale: 2 })
  antifreezeTemp!: number;

  @Column({ name: 'sample_interval_ms', default: 20000 })
  sampleIntervalMs!: number;
}

@Entity('devices')
export class Device {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: 'device_id', unique: true, length: 100 })
  deviceId!: string;

  @Column({ name: 'device_type', length: 50 })
  deviceType!: string;

  @Column({ name: 'firmware_version', type: 'varchar', length: 100, nullable: true })
  firmwareVersion!: string | null;

  @Column({ name: 'ip_address', type: 'varchar', length: 100, nullable: true })
  ipAddress!: string | null;

  @Column({ name: 'is_online', default: false })
  isOnline!: boolean;

  @Column({ name: 'device_token', length: 255 })
  deviceToken!: string;

  @Column({ name: 'last_seen_at', type: 'timestamp', nullable: true })
  lastSeenAt!: Date | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}

@Entity('pending_device_sync')
export class PendingDeviceSync {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: 'device_id', length: 100 })
  deviceId!: string;

  @Column({ length: 50 })
  type!: string;

  @Column({ type: 'jsonb' })
  payload!: Record<string, unknown>;

  @Column({ name: 'is_applied', default: false })
  isApplied!: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @Column({ name: 'applied_at', type: 'timestamp', nullable: true })
  appliedAt!: Date | null;
}

export const databaseEntities = [
  User,
  AuthSession,
  TemperatureProgram,
  Room,
  LightZone,
  TemperatureReading,
  AccessEvent,
  LightEvent,
  BoilerEvent,
  HomeSettings,
  Device,
  PendingDeviceSync,
];
