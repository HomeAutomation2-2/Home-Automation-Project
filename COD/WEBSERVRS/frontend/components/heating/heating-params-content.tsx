"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import Link from "next/link";
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
  const [samplingMinutes, setSamplingMinutes] = useState("5");
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
      setSamplingMinutes(String(roomData.sampling_minutes ?? 5));
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

  function validateSampling(value: string): string | null {
    const n = Number(value);
    if (Number.isNaN(n) || n < 1 || n > 60) {
      return "Intervalul trebuie să fie între 1 și 60 minute.";
    }
    return null;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const offErr = validateOffset(offset);
    const sampErr = validateSampling(samplingMinutes);
    setOffsetError(offErr);
    if (offErr || sampErr) return;

    setSaving(true);
    setSuccess(null);
    setError(null);
    try {
      const updated = await getApiClient().updateRoom(roomId, {
        offset_value: Number(offset),
        sampling_minutes: Number(samplingMinutes),
      });
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
    <div className="mx-auto flex w-full max-w-[720px] flex-col gap-6">
      <div>
        <Link href="/heating" className="text-sm text-[#004ac6] hover:underline">
          ← Înapoi la încălzire
        </Link>
        <h1 className="mt-2 text-2xl font-semibold text-[#191b23]">
          {room?.name ?? "Setări cameră"}
        </h1>
        <p className="mt-1 text-sm text-[#555f6d]">
          Calibrare temperatură și interval de măsurare pentru această cameră.
        </p>
      </div>

      {error && <ErrorBanner message={error} />}
      {success && (
        <p className="rounded-lg border border-[#c3c6d7] bg-[#faf8ff] px-4 py-3 text-sm text-[#191b23]">
          {success}
        </p>
      )}

      {loading && (
        <div className="h-64 animate-pulse rounded-lg bg-[#e8e9f0]" aria-hidden />
      )}

      {!loading && room && (
        <form
          onSubmit={(e) => void handleSubmit(e)}
          className="flex flex-col gap-5 rounded-lg border border-[#c3c6d7] bg-white p-[17px]"
        >
          <div className="grid grid-cols-2 gap-4 rounded-lg border border-[#c3c6d7] bg-[#faf8ff] p-4 text-sm">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.6px] text-[#555f6d]">
                Temperatură curentă
              </p>
              <p className="text-lg font-semibold text-[#191b23]">
                {Number(room.current_temp).toFixed(1)}°C
              </p>
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.6px] text-[#555f6d]">
                Încălzire
              </p>
              <p className="text-lg font-semibold text-[#191b23]">
                {room.is_heating ? "Pornită" : "Oprită"}
              </p>
            </div>
            <div className="col-span-2">
              <p className="text-xs font-bold uppercase tracking-[0.6px] text-[#555f6d]">
                Program activ
              </p>
              <p className="text-lg font-semibold text-[#191b23]">
                {programName ?? "Niciunul"}
              </p>
            </div>
          </div>

          <label className="flex flex-col gap-1">
            <span className="text-xs font-bold uppercase tracking-[0.6px] text-[#555f6d]">
              Offset temperatură (°C)
            </span>
            <input
              type="number"
              step="0.1"
              value={offset}
              onChange={(e) => {
                setOffset(e.target.value);
                setOffsetError(null);
              }}
              className="rounded border border-[#c3c6d7] bg-[#faf8ff] px-3 py-2 text-sm text-[#191b23] outline-none focus:border-[#004ac6]"
            />
            {offsetError && (
              <span className="text-xs text-[#b42318]">{offsetError}</span>
            )}
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-xs font-bold uppercase tracking-[0.6px] text-[#555f6d]">
              Interval măsurare (minute)
            </span>
            <input
              type="number"
              min={1}
              max={60}
              value={samplingMinutes}
              onChange={(e) => setSamplingMinutes(e.target.value)}
              className="rounded border border-[#c3c6d7] bg-[#faf8ff] px-3 py-2 text-sm text-[#191b23] outline-none focus:border-[#004ac6]"
            />
          </label>

          <button
            type="submit"
            disabled={saving}
            className="w-fit rounded bg-[#004ac6] px-4 py-2 text-sm text-white disabled:opacity-50"
          >
            {saving ? "Se salvează…" : "Salvează"}
          </button>
        </form>
      )}
    </div>
  );
}
