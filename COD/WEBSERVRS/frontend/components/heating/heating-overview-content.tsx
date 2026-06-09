"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { HeatingRoomCard } from "@/components/heating/heating-room-card";
import { HeatingSubNav } from "@/components/heating/heating-subnav";
import { ErrorBanner } from "@/components/ui/ErrorBanner";
import { joinRoomsWithPrograms } from "@/lib/heating/room-temp-join";
import { getApiClient } from "@/lib/auth";
import { ApiError } from "@/lib/types/api";
import type { Room } from "@/lib/types/room";
import type { TempProgram } from "@/lib/types/temp-program";

export function HeatingOverviewContent() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [programs, setPrograms] = useState<TempProgram[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const client = getApiClient();
      const [roomsData, programsData] = await Promise.all([
        client.getRooms(),
        client.getHeatingPrograms(),
      ]);
      setRooms(roomsData);
      setPrograms(programsData);
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "Nu s-au putut încărca datele de încălzire.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const displayRooms = useMemo(
    () => joinRoomsWithPrograms(rooms, programs),
    [rooms, programs],
  );

  return (
    <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-[-0.24px] text-[#191b23]">
          Încălzire
        </h1>
        <p className="mt-1 text-sm text-[#555f6d]">
          Temperaturi, programe active și status per cameră.
        </p>
      </div>

      <HeatingSubNav />

      {error && <ErrorBanner message={error} />}

      {loading && (
        <div className="grid animate-pulse grid-cols-1 gap-4 md:grid-cols-2">
          {[1, 2].map((i) => (
            <div key={i} className="h-48 rounded-lg bg-[#e8e9f0]" />
          ))}
        </div>
      )}

      {!loading && !error && displayRooms.length === 0 && (
        <p className="rounded-lg border border-[#c3c6d7] bg-white px-4 py-12 text-center text-sm text-[#555f6d]">
          Nicio cameră configurată.
        </p>
      )}

      {!loading && displayRooms.length > 0 && (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {displayRooms.map((room) => (
            <HeatingRoomCard key={room.id} room={room} />
          ))}
        </div>
      )}
    </div>
  );
}
