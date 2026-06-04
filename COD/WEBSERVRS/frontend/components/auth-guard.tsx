"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AuthCheckFallback } from "@/components/auth-check-fallback";
import { isAuthenticated } from "@/lib/auth";

/**
 * Protecție suplimentară în (app). Așteaptă mount înainte de a citi localStorage
 * ca SSR și primul paint client să fie identice (fără hydration mismatch).
 */
export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [status, setStatus] = useState<"pending" | "allowed" | "denied">(
    "pending",
  );

  useEffect(() => {
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
