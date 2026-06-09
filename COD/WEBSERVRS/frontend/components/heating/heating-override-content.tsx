"use client";

import { useCallback, useEffect, useState } from "react";
import { HeatingSubNav } from "@/components/heating/heating-subnav";
import { ErrorBanner } from "@/components/ui/ErrorBanner";
import { getApiClient } from "@/lib/auth";
import { ApiError } from "@/lib/types/api";
import type { HeatingOverrideStatus } from "@/lib/types/heating-override";
import type { TempProgram } from "@/lib/types/temp-program";

const DURATION_OPTIONS = [
  { label: "30 minute", value: 30 },
  { label: "1 oră", value: 60 },
  { label: "2 ore", value: 120 },
  { label: "4 ore", value: 240 },
  { label: "Până la anulare", value: 0 },
];

export function HeatingOverrideContent() {
  const [programs, setPrograms] = useState<TempProgram[]>([]);
  const [status, setStatus] = useState<HeatingOverrideStatus>({ active: false });
  const [programId, setProgramId] = useState("");
  const [durationMinutes, setDurationMinutes] = useState(60);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const client = getApiClient();
      const [programsData, overrideStatus] = await Promise.all([
        client.getHeatingPrograms(),
        client.getHeatingOverride(),
      ]);
      setPrograms(programsData);
      setStatus(overrideStatus);
      if (overrideStatus.active && overrideStatus.program_id) {
        setProgramId(String(overrideStatus.program_id));
      }
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "Nu s-a putut încărca starea forțării.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const activeProgram = programs.find(
    (p) => p.id === (status.active ? status.program_id : Number(programId)),
  );

  async function handleActivate() {
    if (!programId) return;
    setBusy(true);
    setError(null);
    try {
      const next = await getApiClient().activateHeatingOverride({
        program_id: Number(programId),
        duration_minutes: durationMinutes,
      });
      setStatus(next);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Activarea nu a reușit.");
    } finally {
      setBusy(false);
    }
  }

  async function handleDeactivate() {
    setBusy(true);
    setError(null);
    try {
      const next = await getApiClient().deactivateHeatingOverride();
      setStatus(next);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Dezactivarea nu a reușit.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-[720px] flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-[#191b23]">Forțare manuală</h1>
        <p className="mt-1 text-sm text-[#555f6d]">
          Aplică temporar un program de încălzire, indiferent de programul obișnuit.
        </p>
      </div>

      <HeatingSubNav />

      {error && <ErrorBanner message={error} />}

      <div
        className={`rounded-lg border p-[17px] ${
          status.active
            ? "border-[#b42318] bg-[rgba(220,38,38,0.04)]"
            : "border-[#c3c6d7] bg-white"
        }`}
      >
        <p className="text-xs font-bold uppercase tracking-[0.6px] text-[#555f6d]">
          Status
        </p>
        <p className="mt-2 text-lg font-semibold text-[#191b23]">
          {status.active
            ? (activeProgram?.name ?? `Program #${status.program_id}`)
            : "Nicio forțare activă"}
        </p>
        {status.active && (
          <p className="mt-1 text-sm text-[#b42318]">
            Forțare activă
            {status.expires_at
              ? ` până la ${new Date(status.expires_at).toLocaleString("ro-RO")}`
              : " (până la anulare)"}
          </p>
        )}
      </div>

      {!loading && (
        <div className="flex flex-col gap-4 rounded-lg border border-[#c3c6d7] bg-white p-[17px]">
          <label className="flex flex-col gap-1">
            <span className="text-xs font-bold uppercase tracking-[0.6px] text-[#555f6d]">
              Program
            </span>
            <select
              value={programId}
              onChange={(e) => setProgramId(e.target.value)}
              disabled={status.active}
              className="rounded border border-[#c3c6d7] bg-[#faf8ff] px-3 py-2 text-sm disabled:opacity-60"
            >
              <option value="">Alege programul</option>
              {programs.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-xs font-bold uppercase tracking-[0.6px] text-[#555f6d]">
              Durată
            </span>
            <select
              value={durationMinutes}
              onChange={(e) => setDurationMinutes(Number(e.target.value))}
              disabled={status.active}
              className="rounded border border-[#c3c6d7] bg-[#faf8ff] px-3 py-2 text-sm disabled:opacity-60"
            >
              {DURATION_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </label>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              disabled={busy || status.active || !programId}
              onClick={() => void handleActivate()}
              className="rounded bg-[#004ac6] px-4 py-2 text-sm text-white disabled:opacity-50"
            >
              Activează
            </button>
            <button
              type="button"
              disabled={busy || !status.active}
              onClick={() => void handleDeactivate()}
              className="rounded border border-[#c3c6d7] px-4 py-2 text-sm text-[#191b23] disabled:opacity-50"
            >
              Dezactivează
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
