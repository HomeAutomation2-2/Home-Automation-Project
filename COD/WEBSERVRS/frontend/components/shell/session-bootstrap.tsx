"use client";

import { useEffect } from "react";
import { refreshSessionFromApi } from "@/lib/auth";

/** La mount în shell: sincronizează isAdmin din GET /users/me */
export function SessionBootstrap() {
  useEffect(() => {
    void refreshSessionFromApi();
  }, []);

  return null;
}
