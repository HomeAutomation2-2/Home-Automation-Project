import { InternalServerErrorException } from '@nestjs/common';

export type AppConfig = {
  port: number;
  database: {
    host: string;
    port: number;
    username: string;
    password: string;
    name: string;
    resetOnStart: boolean;
  };
  seed: {
    adminFirstName: string;
    adminLastName: string;
    adminCnp: string;
    adminPhone: string;
    adminPassword: string;
  };
  esp32: {
    deviceId: string;
    baseUrl: string;
    timeoutMs: number;
    defaultSampleIntervalMs: number;
    defaultHysteresis: number;
    lightNodeIp: string;
    boilerNodeIp: string;
  };
};

function readString(name: string, fallback?: string): string {
  const value = process.env[name] ?? fallback;

  if (value === undefined || value.trim() === '') {
    throw new InternalServerErrorException(`Missing required env var: ${name}`);
  }

  return value.trim();
}

function readNumber(name: string, fallback: number): number {
  const raw = process.env[name];
  const value = raw === undefined || raw.trim() === '' ? fallback : Number(raw);

  if (!Number.isFinite(value)) {
    throw new InternalServerErrorException(`Invalid numeric env var: ${name}`);
  }

  return value;
}

function readBoolean(name: string, fallback: boolean): boolean {
  const raw = process.env[name];

  if (raw === undefined || raw.trim() === '') {
    return fallback;
  }

  return ['1', 'true', 'yes', 'on'].includes(raw.toLowerCase());
}

export function loadAppConfig(): AppConfig {
  return {
    port: readNumber('PORT', 3500),
    database: {
      host: readString('DB_HOST', 'localhost'),
      port: readNumber('DB_PORT', 5434),
      username: readString('DB_USERNAME', 'postgres'),
      password: readString('DB_PASSWORD', 'mysecretpassword'),
      name: readString('DB_DATABASE', 'home_automation_v2'),
      resetOnStart: readBoolean('DB_RESET_ON_START', true),
    },
    seed: {
      adminFirstName: readString('TEST_ADMIN_FIRST_NAME', 'Test'),
      adminLastName: readString('TEST_ADMIN_LAST_NAME', 'Admin'),
      adminCnp: readString('TEST_ADMIN_CNP', '1990101123457'),
      adminPhone: readString('TEST_ADMIN_PHONE', '0711111111'),
      adminPassword: readString('TEST_ADMIN_PASSWORD', 'test1234'),
    },
    esp32: {
      deviceId: readString('ESP32_DEVICE_ID', 'ESP32_MAIN_GATEWAY'),
      baseUrl: readString('ESP32_BASE_URL', 'http://192.168.1.93'),
      timeoutMs: readNumber('ESP32_TIMEOUT_MS', 3000),
      defaultSampleIntervalMs: readNumber('DEFAULT_SAMPLE_INTERVAL_MS', 20000),
      defaultHysteresis: readNumber('DEFAULT_HYSTERESIS', 0.5),
      lightNodeIp: readString('LIGHT_NODE_IP', '192.168.1.90'),
      boilerNodeIp: readString('BOILER_NODE_IP', '192.168.1.91'),
    },
  };
}
