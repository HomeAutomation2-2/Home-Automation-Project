import { ApiError } from "@/lib/types/api";
import type { LoginRequest, LoginResponse } from "@/lib/types/api";
import type { LightZone } from "@/lib/types/light-zone";
import type { UnifiedLog } from "@/lib/types/log";
import type { Room } from "@/lib/types/room";
import type { TempProgram } from "@/lib/types/temp-program";
import type { UserMe } from "@/lib/types/user-me";
import type {
  AdminUserDetail,
  CreateUserRequest,
  DeviceBindingStatus,
  InitiateDeviceBindingResponse,
  SuspendUserResponse,
  UpdateUserRequest,
} from "@/lib/types/admin-user";
import type { UserPresenceItem } from "@/lib/types/user-presence";
import type { HeatingOverrideStatus } from "@/lib/types/heating-override";

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

  /** POST /rooms */
  async createRoom(name: string): Promise<Room> {
    return this.request<Room>("/rooms", {
      method: "POST",
      body: JSON.stringify({ name }),
    });
  }

  /** GET /light-zones — query opțional room_id */
  async getLightZones(roomId?: number): Promise<LightZone[]> {
    const query =
      roomId !== undefined ? `?room_id=${encodeURIComponent(String(roomId))}` : "";
    return this.request<LightZone[]>(`/light-zones${query}`);
  }

  /** POST /light-zones */
  async createLightZone(body: {
    room_id: number;
    name: string;
  }): Promise<LightZone> {
    return this.request<LightZone>("/light-zones", {
      method: "POST",
      body: JSON.stringify(body),
    });
  }

  /** PATCH /light-zones/:id */
  async patchLightZone(id: number, is_on: boolean): Promise<LightZone> {
    return this.request<LightZone>(`/light-zones/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ is_on }),
    });
  }

  /**
   * Viitor: GET /temperature-readings?room_id=&from=&to=
   * Modulul Nest există; rutele HTTP nu sunt încă implementate.
   */
  // async getTemperatureReadings(...) — de adăugat când backend expune endpoint-ul

  /** GET /heating-programs */
  async getHeatingPrograms(): Promise<TempProgram[]> {
    return this.request<TempProgram[]>("/heating-programs");
  }

  /** GET /rooms/:id */
  async getRoom(id: number): Promise<Room> {
    return this.request<Room>(`/rooms/${id}`);
  }

  /** POST /heating-programs */
  async createHeatingProgram(body: {
    name: string;
    schedule: TempProgram["schedule"];
  }): Promise<TempProgram> {
    return this.request<TempProgram>("/heating-programs", {
      method: "POST",
      body: JSON.stringify(body),
    });
  }

  /** DELETE /heating-programs/:id */
  async deleteHeatingProgram(id: number): Promise<{ success: boolean }> {
    return this.request<{ success: boolean }>(`/heating-programs/${id}`, {
      method: "DELETE",
    });
  }

  /** PATCH /rooms/:id/temp-program */
  async setRoomTempProgram(
    roomId: number,
    tempProgramId: number | null,
  ): Promise<{ success: boolean }> {
    return this.request<{ success: boolean }>(`/rooms/${roomId}/temp-program`, {
      method: "PATCH",
      body: JSON.stringify({ temp_program_id: tempProgramId }),
    });
  }

  /** PATCH /rooms/:id */
  async updateRoom(
    id: number,
    body: { offset_value?: number; sampling_minutes?: number },
  ): Promise<Room> {
    return this.request<Room>(`/rooms/${id}`, {
      method: "PATCH",
      body: JSON.stringify(body),
    });
  }

  /** PATCH /heating-programs/:id */
  async updateHeatingProgram(
    id: number,
    body: { name?: string; schedule?: TempProgram["schedule"] },
  ): Promise<TempProgram> {
    return this.request<TempProgram>(`/heating-programs/${id}`, {
      method: "PATCH",
      body: JSON.stringify(body),
    });
  }

  /** GET /heating/override */
  async getHeatingOverride(): Promise<HeatingOverrideStatus> {
    return this.request<HeatingOverrideStatus>("/heating/override");
  }

  /** POST /heating/override */
  async activateHeatingOverride(body: {
    program_id: number;
    duration_minutes: number;
  }): Promise<HeatingOverrideStatus> {
    return this.request<HeatingOverrideStatus>("/heating/override", {
      method: "POST",
      body: JSON.stringify(body),
    });
  }

  /** DELETE /heating/override */
  async deactivateHeatingOverride(): Promise<HeatingOverrideStatus> {
    return this.request<HeatingOverrideStatus>("/heating/override", {
      method: "DELETE",
    });
  }

  /** POST /users/register (admin) */
  async registerUser(body: CreateUserRequest): Promise<{ id: number }> {
    return this.request<{ id: number }>("/users/register", {
      method: "POST",
      body: JSON.stringify(body),
    });
  }

  /** GET /users/:id (admin) */
  async getUserById(id: number): Promise<AdminUserDetail> {
    return this.request<AdminUserDetail>(`/users/${id}`);
  }

  /** PATCH /users/:id (admin) */
  async updateUser(id: number, body: UpdateUserRequest): Promise<AdminUserDetail> {
    return this.request<AdminUserDetail>(`/users/${id}`, {
      method: "PATCH",
      body: JSON.stringify(body),
    });
  }

  /** PATCH /users/:id/suspend — comută suspendat/activ */
  async suspendUser(id: number): Promise<SuspendUserResponse> {
    return this.request<SuspendUserResponse>(`/users/${id}/suspend`, {
      method: "PATCH",
    });
  }

  /** GET /users/:id/device-binding (admin) */
  async getDeviceBinding(id: number): Promise<DeviceBindingStatus> {
    return this.request<DeviceBindingStatus>(`/users/${id}/device-binding`);
  }

  /** POST /users/:id/device-binding — generează token de asociere */
  async initiateDeviceBinding(id: number): Promise<InitiateDeviceBindingResponse> {
    return this.request<InitiateDeviceBindingResponse>(`/users/${id}/device-binding`, {
      method: "POST",
    });
  }

  /** DELETE /users/:id/device-binding */
  async revokeDeviceBinding(id: number): Promise<void> {
    return this.request<void>(`/users/${id}/device-binding`, {
      method: "DELETE",
    });
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
    return "A apărut o eroare. Încearcă din nou.";
  }
}
