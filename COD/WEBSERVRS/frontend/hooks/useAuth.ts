"use client";

import { useCallback, useEffect, useState } from "react";
import {
  getApiClient,
  isAdmin as readIsAdmin,
  isAuthenticated as readIsAuthenticated,
  login as authLogin,
  logout as authLogout,
} from "@/lib/auth";
import type { UserMe } from "@/lib/types/user-me";
import { ApiError } from "@/lib/types/api";

type AuthState = {
  isAuthenticated: boolean;
  isAdmin: boolean;
  isLoading: boolean;
  user: UserMe | null;
  error: string | null;
};

export function useAuth() {
  const [state, setState] = useState<AuthState>({
    isAuthenticated: false,
    isAdmin: false,
    isLoading: true,
    user: null,
    error: null,
  });

  const refreshProfile = useCallback(async () => {
    if (!readIsAuthenticated()) {
      setState({
        isAuthenticated: false,
        isAdmin: false,
        isLoading: false,
        user: null,
        error: null,
      });
      return;
    }

    try {
      const me = await getApiClient().getMe();
      setState({
        isAuthenticated: true,
        isAdmin: me.isAdmin,
        isLoading: false,
        user: me,
        error: null,
      });
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : "Nu s-au putut încărca datele utilizatorului.";
      setState({
        isAuthenticated: readIsAuthenticated(),
        isAdmin: readIsAdmin(),
        isLoading: false,
        user: null,
        error: message,
      });
    }
  }, []);

  useEffect(() => {
    void refreshProfile();
  }, [refreshProfile]);

  const login = useCallback(
    async (phone: string, password: string) => {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));
      try {
        const me = await authLogin(phone, password);
        setState({
          isAuthenticated: true,
          isAdmin: me.isAdmin,
          isLoading: false,
          user: me,
          error: null,
        });
        return me;
      } catch (err) {
        const message =
          err instanceof ApiError
            ? err.message
            : "Autentificare eșuată. Verifică telefonul și parola.";
        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: message,
        }));
        throw err;
      }
    },
    [],
  );

  const logout = useCallback(async () => {
    await authLogout();
  }, []);

  return {
    ...state,
    login,
    logout,
    refreshProfile,
  };
}
