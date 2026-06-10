"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { FIGMA_HEATING } from "@/components/heating/figma-heating-assets";
import { HeatingFormRow } from "@/components/heating/heating-form-row";
import { HeatingSubNav } from "@/components/heating/heating-subnav";
import { ErrorBanner } from "@/components/ui/ErrorBanner";
import { getProgramName } from "@/lib/heating/room-temp-join";
import { getApiClient } from "@/lib/auth";
import { ApiError } from "@/lib/types/api";
import type { Room } from "@/lib/types/room";
import type { TempProgram } from "@/lib/types/temp-program";

type HeatingParamsContentProps = {
  roomId: number;
};

export function HeatingParamsContent({ roomId }: HeatingParamsContentProps) {
  const [room, setRoom] = useState<Room | null>(null);
  const [programs, setPrograms] = useState<TempProgram[]>([]);
  const [offset, setOffset] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [offsetError, setOffsetError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const client = getApiClient();
      const [roomData, programsData] = await Promise.all([
        client.getRoom(roomId),
        client.getHeatingPrograms(),
      ]);
      setRoom(roomData);
      setPrograms(programsData);
      setOffset(String(Number(roomData.offset_value)));
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "Nu s-au putut încărca setările camerei.",
      );
    } finally {
      setLoading(false);
    }
  }, [roomId]);

  useEffect(() => {
    void load();
  }, [load]);

  function validateOffset(value: string): string | null {
    if (value.trim() === "") return "Offset-ul este obligatoriu.";
    const n = Number(value);
    if (Number.isNaN(n)) return "Offset-ul trebuie să fie un număr.";
    if (n < -5 || n > 5) return "Offset-ul trebuie să fie între -5 și +5 °C.";
    return null;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const offErr = validateOffset(offset);
    setOffsetError(offErr);
    if (offErr) return;

    setSaving(true);
    setSuccess(null);
    setError(null);
    try {
      await getApiClient().updateRoomOffset(roomId, Number(offset));
      const updated = await getApiClient().getRoom(roomId);
      setRoom(updated);
      setSuccess("Setările au fost salvate.");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Salvarea nu a reușit.");
    } finally {
      setSaving(false);
    }
  }

  const programName = room ? getProgramName(programs, room.temp_program_id) : null;

  return (
    <div className="mx-auto flex w-full max-w-[896px] flex-col gap-6">
      <HeatingSubNav />

      <div>
        <Link href="/heating" className="text-sm text-[#004ac6] hover:underline">
          ← Înapoi
        </Link>
        <h1 className="mt-2 text-[30px] font-semibold leading-[38px] tracking-[-0.6px] text-[#191b23]">
          {room?.name ?? "Parametri cameră"}
        </h1>
      </div>

      {error && <ErrorBanner message={error} />}
      {success && (
        <p className="rounded border border-[#c3c6d7] bg-[#faf8ff] px-4 py-3 text-sm text-[#191b23]">
          {success}
        </p>
      )}

      {loading && (
        <div className="h-64 animate-pulse rounded border border-[#c3c6d7] bg-white" />
      )}

      {!loading && room && (
        <div className="overflow-hidden rounded border border-[#c3c6d7] bg-white shadow-[0px_1px_1px_rgba(0,0,0,0.05)]">
          <div className="flex items-center gap-2 border-b border-[#c3c6d7] bg-[#faf8ff] px-4 py-4">
            <img
              alt=""
              src={FIGMA_HEATING.paramsSettingsIcon}
              className="size-[18px] max-w-none"
            />
            <h2 className="text-lg font-semibold text-[#191b23]">Setări tehnice</h2>
          </div>

          <form onSubmit={(e) => void handleSubmit(e)} className="p-4">
            <HeatingFormRow label="Cameră">
              <p className="text-sm font-medium text-[#191b23]">{room.name}</p>
            </HeatingFormRow>

            <HeatingFormRow label="Temperatură curentă">
              <p className="text-sm text-[#191b23]">
                {Number(room.current_temp).toFixed(1)} °C
              </p>
            </HeatingFormRow>

            <HeatingFormRow label="Program activ">
              <p className="text-sm text-[#191b23]">{programName ?? "Niciunul"}</p>
            </HeatingFormRow>

            <HeatingFormRow label="Stare încălzire">
              <p className="text-sm text-[#191b23]">
                {room.is_heating ? "Pornită" : "Oprită"}
              </p>
            </HeatingFormRow>

            <HeatingFormRow label="Offset senzor (°C)">
              <div>
                <input
                  type="number"
                  step="0.1"
                  value={offset}
                  onChange={(e) => {
                    setOffset(e.target.value);
                    setOffsetError(null);
                  }}
                  className="w-full max-w-xs rounded border border-[#c3c6d7] bg-white px-3 py-2 text-sm outline-none focus:border-[#004ac6] md:w-[284px]"
                />
                {offsetError && (
                  <p className="mt-1 text-xs text-[#b42318]">{offsetError}</p>
                )}
              </div>
            </HeatingFormRow>

            <div className="mt-6 flex justify-end gap-2 border-t border-[#c3c6d7] pt-4">
              <Link
                href="/heating"
                className="rounded border border-[#c3c6d7] bg-white px-4 py-2 text-sm text-[#191b23]"
              >
                Anulează
              </Link>
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center gap-1 rounded bg-[#004ac6] px-4 py-2 text-sm text-white disabled:opacity-50"
              >
                <img alt="" src={FIGMA_HEATING.saveIcon} className="size-3 max-w-none" />
                {saving ? "Se salvează…" : "Salvează"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
