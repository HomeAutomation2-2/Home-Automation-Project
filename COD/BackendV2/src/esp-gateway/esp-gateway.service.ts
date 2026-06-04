import { Injectable, Logger } from '@nestjs/common';
import { loadAppConfig } from '../config/app-config';

@Injectable()
export class EspGatewayService {
  private readonly logger = new Logger(EspGatewayService.name);
  private readonly appConfig = loadAppConfig();
  private readonly baseUrl = this.appConfig.esp32.baseUrl.replace(/\/$/, '');

  sendLightCommand(roomCode: string, isOn: boolean): Promise<boolean> {
    return this.post('/api/lights', {
      id_camera: roomCode,
      is_on: isOn,
    });
  }

  sendTemperatureTarget(roomCode: string, targetTemp: number): Promise<boolean> {
    return this.post('/api/temp', {
      id_camera: roomCode,
      temp: targetTemp,
    });
  }

  setSampleInterval(sampleIntervalMs: number): Promise<boolean> {
    return this.post('/api/rand', {
      timp_esantion: sampleIntervalMs,
    });
  }

  async getStatus(): Promise<Record<string, unknown> | null> {
    const controller = new AbortController();
    const timeout = setTimeout(
      () => controller.abort(),
      this.appConfig.esp32.timeoutMs,
    );

    try {
      const response = await fetch(`${this.baseUrl}/api/status`, {
        method: 'GET',
        signal: controller.signal,
      });

      if (!response.ok) {
        return null;
      }

      return (await response.json()) as Record<string, unknown>;
    } catch (error) {
      this.logger.warn(`ESP32 status unavailable: ${String(error)}`);
      return null;
    } finally {
      clearTimeout(timeout);
    }
  }

  private async post(path: string, payload: Record<string, unknown>): Promise<boolean> {
    const controller = new AbortController();
    const timeout = setTimeout(
      () => controller.abort(),
      this.appConfig.esp32.timeoutMs,
    );

    try {
      const response = await fetch(`${this.baseUrl}${path}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });

      return response.ok;
    } catch (error) {
      this.logger.warn(`ESP32 command ${path} failed: ${String(error)}`);
      return false;
    } finally {
      clearTimeout(timeout);
    }
  }
}
