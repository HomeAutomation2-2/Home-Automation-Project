"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { isAdmin, refreshSessionFromApi } from "@/lib/auth";

export function AdminGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function check() {
      await refreshSessionFromApi();
      if (cancelled) return;
      const admin = isAdmin();
      setAllowed(admin);
      setReady(true);
      if (!admin) {
        router.replace("/dashboard");
      }
    }
    void check();
    return () => {
      cancelled = true;
    };
  }, [router]);

  if (!ready) {
    return <p className="text-sm text-[#555f6d]">Se verifică permisiunile…</p>;
  }

  if (!allowed) {
    return (
      <div className="space-y-2 text-sm text-[#555f6d]">
        <p>Acces permis doar administratorilor. Contul tău nu are rol admin.</p>
        <Link href="/dashboard" className="font-semibold text-[#004ac6] hover:underline">
          Înapoi la prezentare
        </Link>
      </div>
    );
  }

  return <>{children}</>;
}
