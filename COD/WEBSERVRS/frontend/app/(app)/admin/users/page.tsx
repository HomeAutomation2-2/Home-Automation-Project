"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { isAdmin } from "@/lib/auth";

export default function AdminUsersStubPage() {
  const router = useRouter();

  useEffect(() => {
    if (!isAdmin()) {
      router.replace("/dashboard");
    }
  }, [router]);

  return (
    <p className="text-sm text-zinc-600 dark:text-zinc-400">
      Administrare utilizatori — stub. Implementare Figma în Faza 3.
    </p>
  );
}
