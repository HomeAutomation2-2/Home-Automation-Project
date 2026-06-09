"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { TemperatureChart } from "@/components/temperature/temperature-chart";
import { TemperatureChartTable } from "@/components/temperature/temperature-chart-table";
import { ErrorBanner } from "@/components/ui/ErrorBanner";
import { buildMvpTemperaturePoints } from "@/lib/temperature/build-temperature-points";
import {
  defaultReportDateRange,
  parseReportDateRange,
  validateReportDateRange,
} from "@/lib/reports/default-date-range";
import { getApiClient } from "@/lib/auth";
import { ApiError } from "@/lib/types/api";
import type { Room } from "@/lib/types/room";

export function TemperatureChartsContent() {
  const searchParams = useSearchParams();
  const urlRange = parseReportDateRange(
    searchParams.get("dateFrom"),
    searchParams.get("dateTo"),
  );

  const [rooms, setRooms] = useState<Room[]>([]);
  const [roomId, setRoomId] = useState("");
  const [dateFrom, setDateFrom] = useState(urlRange.dateFrom);
  const [dateTo, setDateTo] = useState(urlRange.dateTo);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadRooms = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getApiClient().getRooms();
      setRooms(data);
      setRoomId((prev) => prev || (data[0] ? String(data[0].id) : ""));
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "Nu s-au putut încărca camerele.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadRooms();
  }, [loadRooms]);

  useEffect(() => {
    setDateFrom(urlRange.dateFrom);
    setDateTo(urlRange.dateTo);
  }, [urlRange.dateFrom, urlRange.dateTo]);

  const rangeError = useMemo(
    () => validateReportDateRange(dateFrom, dateTo),
    [dateFrom, dateTo],
  );

  const selectedRoom = useMemo(
    () => rooms.find((r) => String(r.id) === roomId) ?? null,
    [rooms, roomId],
  );

  const points = useMemo(
    () => (rangeError ? [] : buildMvpTemperaturePoints(selectedRoom)),
    [selectedRoom, rangeError],
  );

  return (
    <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-6">
      <div>
        <Link href="/reports" className="text-sm text-[#004ac6] hover:underline">
          ← Înapoi la rapoarte
        </Link>
        <h1 className="mt-2 text-2xl font-semibold tracking-[-0.6px] text-[#191b23]">
          Temperaturi
        </h1>
      </div>

      {error && <ErrorBanner message={error} />}

      <div className="flex flex-wrap items-end gap-4 rounded-lg border border-[#c3c6d7] bg-white p-[17px]">
        <label className="flex min-w-[180px] flex-col gap-1">
          <span className="text-xs font-bold uppercase tracking-[0.6px] text-[#555f6d]">
            Cameră
          </span>
          <select
            value={roomId}
            onChange={(e) => setRoomId(e.target.value)}
            disabled={loading || rooms.length === 0}
            className="rounded border border-[#c3c6d7] bg-[#faf8ff] px-3 py-2 text-sm disabled:opacity-60"
          >
            {rooms.length === 0 && <option value="">Nicio cameră</option>}
            {rooms.map((room) => (
              <option key={room.id} value={String(room.id)}>
                {room.name}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-xs font-bold uppercase tracking-[0.6px] text-[#555f6d]">
            De la
          </span>
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="rounded border border-[#c3c6d7] bg-[#faf8ff] px-2 py-1.5 text-sm"
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-xs font-bold uppercase tracking-[0.6px] text-[#555f6d]">
            Până la
          </span>
          <input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="rounded border border-[#c3c6d7] bg-[#faf8ff] px-2 py-1.5 text-sm"
          />
        </label>
      </div>

      {rangeError && <ErrorBanner message={rangeError} />}

      {!loading && !rangeError && (
        <div className="overflow-hidden rounded-lg border border-[#c3c6d7] bg-white">
          <div className="border-b border-[#c3c6d7] px-4 py-3">
            <h2 className="text-lg font-semibold text-[#191b23]">
              Evoluție temperatură
            </h2>
            {selectedRoom && (
              <p className="text-sm text-[#555f6d]">{selectedRoom.name}</p>
            )}
          </div>
          <div className="p-4">
            <TemperatureChart points={points} roomName={selectedRoom?.name} />
          </div>
        </div>
      )}

      {!loading && !rangeError && (
        <TemperatureChartTable points={points} />
      )}
    </div>
  );
}
