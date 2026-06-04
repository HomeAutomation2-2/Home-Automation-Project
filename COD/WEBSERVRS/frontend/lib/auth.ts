"use client";

import { ApiClient } from "@/lib/api-client";
import {
  AUTH_COOKIE_NAME,
  AUTH_TOKEN_KEY,
  IS_ADMIN_KEY,
} from "@/lib/auth-constants";
import type { LoginRequest } from "@/lib/types/api";
import type { UserMe } from "@/lib/types/user-me";

export { AUTH_COOKIE_NAME, AUTH_TOKEN_KEY, IS_ADMIN_KEY };

const TOKEN_MAX_AGE_SECONDS = 60 * 60 * 24 * 7;

function getBaseUrl(): string {
  return process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000";
}

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

/** Token pentru Authorization header (localStorage). */
export function getToken(): string | null {
  if (!isBrowser()) return null;
  return localStorage.getItem(AUTH_TOKEN_KEY);
}

export function isAuthenticated(): boolean {
  return getToken() !== null && getToken() !== "";
}

export function isAdmin(): boolean {
  if (!isBrowser()) return false;
  return localStorage.getItem(IS_ADMIN_KEY) === "true";
}

function setAuthCookie(token: string): void {
  document.cookie = `${AUTH_COOKIE_NAME}=${encodeURIComponent(token)}; path=/; max-age=${TOKEN_MAX_AGE_SECONDS}; SameSite=Lax`;
}

function clearAuthCookie(): void {
  document.cookie = `${AUTH_COOKIE_NAME}=; path=/; max-age=0; SameSite=Lax`;
}

function persistToken(token: string): void {
  localStorage.setItem(AUTH_TOKEN_KEY, token);
  setAuthCookie(token);
}

function persistIsAdmin(value: boolean): void {
  localStorage.setItem(IS_ADMIN_KEY, value ? "true" : "false");
}

let apiClientInstance: ApiClient | null = null;

/**
 * Client API partajat. La 401 declanșează logout automat.
 * Limitare: tokenul principal e în localStorage; cookie-ul oglindă tokenul
 * doar pentru middleware.ts (Edge nu poate citi localStorage).
 */
export function getApiClient(): ApiClient {
  if (!apiClientInstance) {
    apiClientInstance = new ApiClient(getBaseUrl(), getToken, () => {
      void logout();
    });
  }
  return apiClientInstance;
}

/** Login → token → getMe → persistă isAdmin */
export async function login(
  phone: string,
  password: string,
): Promise<UserMe> {
  const client = getApiClient();
  const body: LoginRequest = {
    phone_number: phone,
    password_plaintext: password,
  };
  const { token } = await client.login(body);
  persistToken(token);
  const me = await client.getMe();
  persistIsAdmin(me.isAdmin);
  return me;
}

/** Șterge sesiunea și redirecționează la login */
export async function logout(): Promise<void> {
  if (isBrowser()) {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem(IS_ADMIN_KEY);
    clearAuthCookie();
    window.location.href = "/login";
  }
}
