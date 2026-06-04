"use client";

import { useEffect, useState } from "react";
import { ErrorBanner } from "@/components/ui/ErrorBanner";
import { getApiClient } from "@/lib/auth";
import { ApiError } from "@/lib/types/api";

export default function DashboardPage() {
  const [healthStatus, setHealthStatus] = useState<string>("Se verifică…");
  const [serverName, setServerName] = useState<string>("—");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadHealth() {
      try {
        const data = await getApiClient().health();
        if (!cancelled) {
          setHealthStatus(data.status);
          setServerName(data.name);
          setError(null);
        }
      } catch (err) {
        if (!cancelled) {
          const message =
            err instanceof ApiError
              ? err.message
              : "Nu s-a putut contacta API-ul. Verifică backend-ul și CORS.";
          setError(message);
          setHealthStatus("indisponibil");
        }
      }
    }

    void loadHealth();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
        Dashboard stub
      </h1>
      <p className="text-sm text-zinc-600 dark:text-zinc-400">
        Pagină de test pentru integrarea API. UI Figma vine în Faza 3.
      </p>
      {error && <ErrorBanner message={error} />}
      <dl className="grid max-w-md gap-2 rounded-lg border border-zinc-200 p-4 text-sm dark:border-zinc-800">
        <div className="flex justify-between gap-4">
          <dt className="text-zinc-500">GET /health — status</dt>
          <dd className="font-medium text-zinc-900 dark:text-zinc-100">{healthStatus}</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-zinc-500">Server</dt>
          <dd className="font-medium text-zinc-900 dark:text-zinc-100">{serverName}</dd>
        </div>
      </dl>
    </div>
  );
}
