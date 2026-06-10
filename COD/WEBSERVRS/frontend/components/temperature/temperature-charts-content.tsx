"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { TemperatureChart } from "@/components/temperature/temperature-chart";
import { TemperatureChartTable } from "@/components/temperature/temperature-chart-table";
import { ErrorBanner } from "@/components/ui/ErrorBanner";
import { getApiClient } from "@/lib/auth";
import { ApiError } from "@/lib/types/api";
import type { Room } from "@/lib/types/room";
import type { TemperaturePoint } from "@/lib/temperature/types";

function mapReadingsToPoints(
  readings: { value: number; occuredAt: string }[],
): TemperaturePoint[] {
  return readings.map((reading) => {
    const date = new Date(reading.occuredAt);
    return {
      time: date.toISOString(),
      value: Number(reading.value),
      label: date.toLocaleString("ro-RO", {
        day: "numeric",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      }),
    };
  });
}

export function TemperatureChartsContent() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [roomId, setRoomId] = useState("");
  const [points, setPoints] = useState<TemperaturePoint[]>([]);
  const [loadingRooms, setLoadingRooms] = useState(true);
  const [loadingReadings, setLoadingReadings] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadRooms = useCallback(async () => {
    setLoadingRooms(true);
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
      setLoadingRooms(false);
    }
  }, []);

  useEffect(() => {
    void loadRooms();
  }, [loadRooms]);

  useEffect(() => {
    const parsedId = Number(roomId);
    if (!roomId || Number.isNaN(parsedId)) {
      setPoints([]);
      return;
    }

    let cancelled = false;
    async function loadReadings() {
      setLoadingReadings(true);
      setError(null);
      try {
        const readings = await getApiClient().getTemperatureReadings(parsedId);
        if (!cancelled) {
          setPoints(mapReadingsToPoints(readings));
        }
      } catch (err) {
        if (!cancelled) {
          setPoints([]);
          setError(
            err instanceof ApiError
              ? err.message
              : "Nu s-au putut încărca citirile de temperatură.",
          );
        }
      } finally {
        if (!cancelled) setLoadingReadings(false);
      }
    }

    void loadReadings();
    return () => {
      cancelled = true;
    };
  }, [roomId]);

  const selectedRoom = useMemo(
    () => rooms.find((r) => String(r.id) === roomId) ?? null,
    [rooms, roomId],
  );

  const loading = loadingRooms || loadingReadings;

  return (
    <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-6">
      <div>
        <Link href="/reports" className="text-sm text-[#004ac6] hover:underline">
          ← Înapoi la rapoarte
        </Link>
        <h1 className="mt-2 text-2xl font-semibold tracking-[-0.6px] text-[#191b23]">
          Temperaturi
        </h1>
        <p className="mt-1 text-sm text-[#555f6d]">
          Ultimele 24 de ore — date din senzori
        </p>
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
            disabled={loadingRooms || rooms.length === 0}
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
      </div>

      {!loading && (
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
            {points.length === 0 ? (
              <p className="py-8 text-center text-sm text-[#555f6d]">
                Nicio citire disponibilă pentru această cameră.
              </p>
            ) : (
              <TemperatureChart points={points} roomName={selectedRoom?.name} />
            )}
          </div>
        </div>
      )}

      {loading && (
        <div className="h-64 animate-pulse rounded-lg border border-[#c3c6d7] bg-white" />
      )}

      {!loading && points.length > 0 && <TemperatureChartTable points={points} />}
    </div>
  );
}
