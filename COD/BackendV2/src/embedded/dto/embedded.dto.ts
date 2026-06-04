import { IsArray, IsBoolean, IsNumber, IsOptional, IsString } from 'class-validator';

export class RegisterDeviceDto {
  @IsString()
  device_id!: string;

  @IsString()
  device_type!: string;

  @IsString()
  @IsOptional()
  firmware_version?: string;

  @IsString()
  @IsOptional()
  ip_address?: string;

  @IsArray()
  @IsOptional()
  capabilities?: string[];
}

export class HeartbeatDto {
  @IsString()
  device_id!: string;

  @IsString()
  @IsOptional()
  firmware_version?: string;

  @IsString()
  @IsOptional()
  ip_address?: string;

  @IsNumber()
  @IsOptional()
  wifi_rssi?: number;
}

export class TemperatureReadingDto {
  @IsString()
  device_id!: string;

  @IsString()
  room_code!: string;

  @IsNumber()
  value!: number;

  @IsNumber()
  @IsOptional()
  humidity?: number;
}

export class LightEventDto {
  @IsString()
  device_id!: string;

  @IsNumber()
  @IsOptional()
  zone_id?: number;

  @IsBoolean()
  new_state!: boolean;
}

export class BoilerEventDto {
  @IsString()
  device_id!: string;

  @IsBoolean()
  new_state!: boolean;
}

export class SyncAckDto {
  @IsArray()
  ids!: number[];
}
