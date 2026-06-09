"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AddHeatingZoneForm } from "@/components/heating/add-heating-zone-form";
import { HeatingRoomCard } from "@/components/heating/heating-room-card";
import { HeatingSubNav } from "@/components/heating/heating-subnav";
import { HeatingSystemStatusBanner } from "@/components/heating/heating-system-status-banner";
import { ErrorBanner } from "@/components/ui/ErrorBanner";
import { useLiveClock } from "@/hooks/useLiveClock";
import { usePolling } from "@/hooks/usePolling";
import {
  formatHeatingClock,
  formatHeatingLastUpdated,
} from "@/lib/heating/format-heating-time";
import { HEATING_POLL_INTERVAL_MS } from "@/lib/heating/heating-poll-config";
import { joinRoomsWithPrograms } from "@/lib/heating/room-temp-join";
import { getApiClient } from "@/lib/auth";
import { ApiError } from "@/lib/types/api";
import type { HeatingOverrideStatus } from "@/lib/types/heating-override";
import type { Room } from "@/lib/types/room";
import type { TempProgram } from "@/lib/types/temp-program";

function resolveSystemModeLabel(
  override: HeatingOverrideStatus | null,
  programs: TempProgram[],
  rooms: Room[],
): string {
  if (override?.active) {
    if (override.program_id != null) {
      const name = programs.find((p) => p.id === override.program_id)?.name;
      return name ? `Forțare: ${name}` : "Forțare activă";
    }
    return "Forțare manuală";
  }

  const assigned = rooms.filter((r) => r.temp_program_id !== null).length;
  if (assigned === 0) return "Manual";
  if (assigned === rooms.length) return "Program";
  return `Program (${assigned}/${rooms.length})`;
}

export function HeatingOverviewContent() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [programs, setPrograms] = useState<TempProgram[]>([]);
  const [override, setOverride] = useState<HeatingOverrideStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdatedAt, setLastUpdatedAt] = useState<Date | null>(null);
  const inFlightRef = useRef(false);
  const now = useLiveClock(1_000);

  const load = useCallback(async (options?: { silent?: boolean }) => {
    if (inFlightRef.current) return;
    inFlightRef.current = true;
    const silent = options?.silent ?? false;
    if (!silent) {
      setLoading(true);
      setError(null);
    }
    try {
      const client = getApiClient();
      const [roomsData, programsData, overrideData] = await Promise.all([
        client.getRooms(),
        client.getHeatingPrograms(),
        client.getHeatingOverride(),
      ]);
      setRooms(roomsData);
      setPrograms(programsData);
      setOverride(overrideData);
      setLastUpdatedAt(new Date());
      if (silent) setError(null);
    } catch (err) {
      if (!silent) {
        setError(
          err instanceof ApiError ? err.message : "Nu s-au putut încărca datele de încălzire.",
        );
      }
    } finally {
      inFlightRef.current = false;
      if (!silent) setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  usePolling(() => load({ silent: true }), HEATING_POLL_INTERVAL_MS, {
    pauseWhenHidden: true,
  });

  const displayRooms = useMemo(
    () => joinRoomsWithPrograms(rooms, programs, now),
    [rooms, programs, now],
  );

  const metrics = useMemo(() => {
    const active = displayRooms.filter((r) => r.is_heating).length;
    const withTemp = displayRooms.filter((r) => Number.isFinite(r.current_temp));
    const avg =
      withTemp.length > 0
        ? `${(
            withTemp.reduce((s, r) => s + r.current_temp, 0) / withTemp.length
          ).toFixed(1)}°C`
        : "—";
    const mode = resolveSystemModeLabel(override, programs, rooms);
    return { active, avg, mode };
  }, [displayRooms, override, programs, rooms]);

  const clockLabel = formatHeatingClock(now);
  const lastUpdatedLabel = lastUpdatedAt
    ? formatHeatingLastUpdated(lastUpdatedAt)
    : null;

  return (
    <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-6">
      <HeatingSubNav />

      {error && <ErrorBanner message={error} />}

      <HeatingSystemStatusBanner
        loading={loading}
        avgTempLabel={metrics.avg}
        activeZones={metrics.active}
        totalZones={displayRooms.length}
        systemModeLabel={metrics.mode}
        clockLabel={clockLabel}
        lastUpdatedLabel={lastUpdatedLabel}
      />

      <section className="flex flex-col gap-4">
        <h2 className="text-lg font-semibold text-[#191b23]">Zone încălzire</h2>

        {!loading && <AddHeatingZoneForm onCreated={() => void load()} />}

        {loading && (
          <div className="grid animate-pulse grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-[168px] rounded bg-[#e8e9f0]" />
            ))}
          </div>
        )}

        {!loading && !error && displayRooms.length === 0 && (
          <p className="rounded border border-[#c3c6d7] bg-white px-4 py-12 text-center text-sm text-[#555f6d]">
            Nicio cameră configurată.
          </p>
        )}

        {!loading && displayRooms.length > 0 && (
          <div className="grid grid-cols-1 items-stretch gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {displayRooms.map((room) => (
              <HeatingRoomCard key={room.id} room={room} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
