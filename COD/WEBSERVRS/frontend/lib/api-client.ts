import { ApiError } from "@/lib/types/api";
import type { LoginRequest, LoginResponse } from "@/lib/types/api";
import type { LightZone } from "@/lib/types/light-zone";
import type { UnifiedLog } from "@/lib/types/log";
import type { Room } from "@/lib/types/room";
import type { TempProgram } from "@/lib/types/temp-program";
import type { UserMe } from "@/lib/types/user-me";
import type { UserPresenceItem } from "@/lib/types/user-presence";

type NestErrorBody = {
  message?: string | string[];
};

/**
 * Client HTTP pentru API-ul NestJS Home Automation.
 */
export class ApiClient {
  private readonly baseUrl: string;
  private readonly getToken: () => string | null;
  private readonly onUnauthorized?: () => void;

  constructor(
    baseUrl: string,
    getToken: () => string | null,
    onUnauthorized?: () => void,
  ) {
    this.baseUrl = baseUrl.replace(/\/$/, "");
    this.getToken = getToken;
    this.onUnauthorized = onUnauthorized;
  }

  /** GET /health — verificare disponibilitate API */
  async health(): Promise<{ status: string; name: string }> {
    return this.request<{ status: string; name: string }>("/health");
  }

  /** POST /auth-sessions/login */
  async login(body: LoginRequest): Promise<LoginResponse> {
    return this.request<LoginResponse>("/auth-sessions/login", {
      method: "POST",
      body: JSON.stringify(body),
      skipAuth: true,
    });
  }

  /** GET /users/me */
  async getMe(): Promise<UserMe> {
    return this.request<UserMe>("/users/me");
  }

  /** GET /users/presence */
  async getPresence(): Promise<UserPresenceItem[]> {
    return this.request<UserPresenceItem[]>("/users/presence");
  }

  /** GET /users/logs */
  async getLogs(): Promise<UnifiedLog[]> {
    return this.request<UnifiedLog[]>("/users/logs");
  }

  /** GET /rooms */
  async getRooms(): Promise<Room[]> {
    return this.request<Room[]>("/rooms");
  }

  /** GET /light-zones — query opțional room_id */
  async getLightZones(roomId?: number): Promise<LightZone[]> {
    const query =
      roomId !== undefined ? `?room_id=${encodeURIComponent(String(roomId))}` : "";
    return this.request<LightZone[]>(`/light-zones${query}`);
  }

  /** PATCH /light-zones/:id */
  async patchLightZone(id: number, is_on: boolean): Promise<LightZone> {
    return this.request<LightZone>(`/light-zones/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ is_on }),
    });
  }

  /** GET /heating-programs */
  async getHeatingPrograms(): Promise<TempProgram[]> {
    return this.request<TempProgram[]>("/heating-programs");
  }

  private async request<T>(
    path: string,
    init: RequestInit & { skipAuth?: boolean } = {},
  ): Promise<T> {
    const { skipAuth, ...fetchInit } = init;
    const headers = new Headers(fetchInit.headers);
    headers.set("Content-Type", "application/json");

    if (!skipAuth) {
      const token = this.getToken();
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
    }

    const response = await fetch(`${this.baseUrl}${path}`, {
      ...fetchInit,
      headers,
    });

    if (response.status === 401 && this.onUnauthorized) {
      this.onUnauthorized();
    }

    if (!response.ok) {
      const message = await this.parseErrorMessage(response);
      throw new ApiError(response.status, message);
    }

    if (response.status === 204) {
      return undefined as T;
    }

    return (await response.json()) as T;
  }

  private async parseErrorMessage(response: Response): Promise<string> {
    try {
      const body = (await response.json()) as NestErrorBody;
      if (Array.isArray(body.message)) {
        return body.message.join(", ");
      }
      if (typeof body.message === "string") {
        return body.message;
      }
    } catch {
      /* răspuns non-JSON */
    }
    return `Eroare API (${response.status})`;
  }
}
