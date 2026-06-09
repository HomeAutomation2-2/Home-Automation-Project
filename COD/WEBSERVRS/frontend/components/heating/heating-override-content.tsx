"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { FIGMA_HEATING } from "@/components/heating/figma-heating-assets";
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

function formatRemaining(expiresAt: string | null | undefined): string {
  if (!expiresAt) return "";
  const diff = new Date(expiresAt).getTime() - Date.now();
  if (diff <= 0) return "";
  const mins = Math.floor(diff / 60_000);
  if (mins < 60) return `${mins} min rămase`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${h}h ${m}m rămase`;
}

export function HeatingOverrideContent() {
  const [programs, setPrograms] = useState<TempProgram[]>([]);
  const [status, setStatus] = useState<HeatingOverrideStatus>({ active: false });
  const [programId, setProgramId] = useState("");
  const [durationMinutes, setDurationMinutes] = useState(120);
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

  const activeProgram = useMemo(
    () =>
      programs.find(
        (p) => p.id === (status.active ? status.program_id : Number(programId)),
      ),
    [programs, status, programId],
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

  const durationLabel =
    DURATION_OPTIONS.find((o) => o.value === durationMinutes)?.label ?? "—";

  return (
    <div className="mx-auto flex w-full max-w-[896px] flex-col gap-6">
      <h1 className="text-[30px] font-semibold leading-[38px] tracking-[-0.6px] text-[#191b23]">
        Forțare manuală
      </h1>

      <HeatingSubNav />
      {error && <ErrorBanner message={error} />}

      {status.active && (
        <div className="flex flex-col gap-4 rounded border border-[rgba(0,74,198,0.2)] bg-[rgba(37,99,235,0.1)] p-[17px] sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[#004ac6]">
              <img
                alt=""
                src={FIGMA_HEATING.overrideAlertIcon}
                className="h-[19px] w-[22px] max-w-none"
              />
            </span>
            <div>
              <h2 className="text-lg font-semibold text-[#191b23]">
                Forțare activă: {activeProgram?.name ?? `Program #${status.program_id}`}
              </h2>
              <p className="text-sm text-[#555f6d]">
                {status.expires_at
                  ? `Până la ${new Date(status.expires_at).toLocaleString("ro-RO")}`
                  : "Până la anulare"}
                {status.expires_at && ` (${formatRemaining(status.expires_at)})`}
              </p>
            </div>
          </div>
          <button
            type="button"
            disabled={busy}
            onClick={() => void handleDeactivate()}
            className="rounded bg-[#004ac6] px-4 py-2 text-xs font-semibold uppercase tracking-[0.6px] text-white disabled:opacity-50"
          >
            Revino la program
          </button>
        </div>
      )}

      {!loading && (
        <div className="rounded border border-[#c3c6d7] bg-white p-[17px] shadow-[0px_1px_1px_rgba(0,0,0,0.05)]">
          <h2 className="text-lg font-semibold text-[#191b23]">Forțare personalizată</h2>

          <div className="mt-4 grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="flex flex-col gap-4">
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
            </div>

            <div className="rounded border border-[rgba(0,74,198,0.15)] bg-[rgba(37,99,235,0.06)] p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.6px] text-[#555f6d]">
                Previzualizare
              </p>
              <dl className="mt-3 space-y-2 text-sm">
                <div className="flex justify-between">
                  <dt className="text-[#555f6d]">Program</dt>
                  <dd className="font-semibold text-[#191b23]">
                    {activeProgram?.name ?? "—"}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-[#555f6d]">Durată</dt>
                  <dd className="font-semibold text-[#191b23]">{durationLabel}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-[#555f6d]">Stare</dt>
                  <dd className="font-semibold text-[#191b23]">
                    {status.active ? "Activă" : "Inactivă"}
                  </dd>
                </div>
              </dl>
            </div>
          </div>

          <div className="mt-6 flex justify-end gap-2 border-t border-[#c3c6d7] pt-4">
            <button
              type="button"
              disabled={busy || !status.active}
              onClick={() => void handleDeactivate()}
              className="rounded border border-[#c3c6d7] px-4 py-2 text-sm text-[#191b23] disabled:opacity-50"
            >
              Anulează
            </button>
            <button
              type="button"
              disabled={busy || status.active || !programId}
              onClick={() => void handleActivate()}
              className="rounded bg-[#004ac6] px-4 py-2 text-sm text-white disabled:opacity-50"
            >
              Aplică forțarea
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
