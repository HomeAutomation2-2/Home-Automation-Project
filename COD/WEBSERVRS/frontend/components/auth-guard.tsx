"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AuthCheckFallback } from "@/components/auth-check-fallback";
import { isAuthenticated, syncSessionFromCookie } from "@/lib/auth";

/**
 * Sincronizează cookie → localStorage, apoi verifică sesiunea.
 * Middleware permite accesul cu cookie; fără sync, paginile rămâneau blocate aici.
 */
export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [status, setStatus] = useState<"pending" | "allowed" | "denied">("pending");

  useEffect(() => {
    syncSessionFromCookie();
    if (!isAuthenticated()) {
      setStatus("denied");
      router.replace("/login?reason=session_expired");
      return;
    }
    setStatus("allowed");
  }, [router]);

  if (status !== "allowed") {
    return <AuthCheckFallback />;
  }

  return <>{children}</>;
}
