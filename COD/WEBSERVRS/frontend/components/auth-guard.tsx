"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { isAuthenticated } from "@/lib/auth";

/**
 * Protecție suplimentară în (app): sesiune doar în localStorage fără cookie
 * nu trece middleware — utilizatorul autentificat corect are ambele.
 */
export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated()) {
      router.replace("/login");
    }
  }, [router]);

  if (!isAuthenticated()) {
    return (
      <p className="text-sm text-zinc-600 dark:text-zinc-400">
        Se verifică sesiunea…
      </p>
    );
  }

  return <>{children}</>;
}
