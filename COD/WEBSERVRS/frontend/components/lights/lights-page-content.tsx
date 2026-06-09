"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { AddLightZoneForm } from "@/components/lights/add-light-zone-form";
import { FIGMA_LIGHTS } from "@/components/lights/figma-lights-assets";
import { LightZoneCard } from "@/components/lights/light-zone-card";
import { ErrorBanner } from "@/components/ui/ErrorBanner";
import {
  groupZonesByRoom,
  joinLightZonesWithRooms,
  type LightZoneForDisplay,
} from "@/lib/lights/join-light-zones";
import { getApiClient } from "@/lib/auth";
import { ApiError } from "@/lib/types/api";
import type { Room } from "@/lib/types/room";

export function LightsPageContent() {
  const [zones, setZones] = useState<LightZoneForDisplay[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [roomFilter, setRoomFilter] = useState("");
  const [togglingIds, setTogglingIds] = useState<Set<number>>(() => new Set());
  const [zoneErrors, setZoneErrors] = useState<Record<number, string>>({});
  const [turningOffAll, setTurningOffAll] = useState(false);

  const load = useCallback(async (roomId?: number) => {
    setLoading(true);
    setError(null);
    try {
      const client = getApiClient();
      const [zonesData, roomsData] = await Promise.all([
        client.getLightZones(roomId),
        client.getRooms(),
      ]);
      setRooms(roomsData);
      setZones(joinLightZonesWithRooms(zonesData, roomsData));
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "Nu s-au putut încărca zonele de lumină.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const roomId = roomFilter ? Number(roomFilter) : undefined;
    void load(roomId);
  }, [load, roomFilter]);

  const groups = useMemo(() => groupZonesByRoom(zones), [zones]);
  const anyOn = useMemo(() => zones.some((z) => z.is_on), [zones]);

  const handleTurnOffAll = useCallback(async () => {
    const onZones = zones.filter((z) => z.is_on);
    if (onZones.length === 0) return;
    setTurningOffAll(true);
    setError(null);
    try {
      const client = getApiClient();
      const changedAt = new Date().toISOString();
      await Promise.all(onZones.map((z) => client.patchLightZone(z.id, false)));
      setZones((prev) =>
        prev.map((z) =>
          z.is_on
            ? { ...z, is_on: false, last_changed_at: changedAt }
            : z,
        ),
      );
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "Nu s-au putut stinge toate luminile.",
      );
    } finally {
      setTurningOffAll(false);
    }
  }, [zones, roomFilter]);

  const handleToggle = useCallback(
    async (zone: LightZoneForDisplay) => {
      const previousOn = zone.is_on;
      const nextOn = !previousOn;

      setZoneErrors((prev) => {
        const next = { ...prev };
        delete next[zone.id];
        return next;
      });

      const changedAt = new Date().toISOString();
      setZones((prev) =>
        prev.map((z) =>
          z.id === zone.id
            ? { ...z, is_on: nextOn, last_changed_at: changedAt }
            : z,
        ),
      );
      setTogglingIds((prev) => new Set(prev).add(zone.id));

      try {
        const updated = await getApiClient().patchLightZone(zone.id, nextOn);
        setZones((prev) =>
          prev.map((z) =>
            z.id === zone.id
              ? {
                  ...z,
                  is_on: updated.is_on,
                  // Păstrăm ora clientului — e în fusul local al utilizatorului.
                  last_changed_at: changedAt,
                }
              : z,
          ),
        );
      } catch (err) {
        setZones((prev) =>
          prev.map((z) =>
            z.id === zone.id
              ? { ...z, is_on: previousOn, last_changed_at: zone.last_changed_at }
              : z,
          ),
        );
        setZoneErrors((prev) => ({
          ...prev,
          [zone.id]:
            err instanceof ApiError
              ? err.message
              : "Comanda nu a reușit. Starea a rămas neschimbată.",
        }));
      } finally {
        setTogglingIds((prev) => {
          const next = new Set(prev);
          next.delete(zone.id);
          return next;
        });
      }
    },
    [roomFilter],
  );

  return (
    <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-6">
      <div className="flex flex-col gap-4 border-b border-[#c3c6d7] pb-3 sm:flex-row sm:items-end sm:justify-between">
        <h1 className="text-[30px] font-semibold leading-[38px] tracking-[-0.6px] text-[#191b23]">
          Zone de iluminat
        </h1>

        <div className="flex flex-wrap items-end gap-3">
          {rooms.length > 0 && (
            <label className="flex flex-col gap-1">
              <span className="text-xs font-bold uppercase tracking-[0.6px] text-[#555f6d]">
                Cameră
              </span>
              <select
                value={roomFilter}
                onChange={(e) => setRoomFilter(e.target.value)}
                className="min-w-[180px] rounded border border-[#c3c6d7] bg-white px-3 py-2 text-sm text-[#191b23] outline-none focus:border-[#004ac6]"
              >
                <option value="">Toate camerele</option>
                {rooms.map((room) => (
                  <option key={room.id} value={String(room.id)}>
                    {room.name}
                  </option>
                ))}
              </select>
            </label>
          )}
          <button
            type="button"
            disabled={loading || turningOffAll || !anyOn}
            onClick={() => void handleTurnOffAll()}
            className="inline-flex items-center gap-1 border border-[#737686] bg-white px-[17px] py-[9px] text-xs font-semibold uppercase tracking-[0.6px] text-[#191b23] disabled:opacity-50"
          >
            <img alt="" src={FIGMA_LIGHTS.powerOffIcon} className="size-[15px] max-w-none" />
            Stinge tot
          </button>
        </div>
      </div>

      {error && <ErrorBanner message={error} />}

      {!loading && (
        <AddLightZoneForm
          rooms={rooms}
          onCreated={() => {
            const roomId = roomFilter ? Number(roomFilter) : undefined;
            void load(roomId);
          }}
          onRoomCreated={() => {
            const roomId = roomFilter ? Number(roomFilter) : undefined;
            void load(roomId);
          }}
        />
      )}

      {loading && (
        <div className="grid animate-pulse grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-[189px] rounded bg-[#e8e9f0]" />
          ))}
        </div>
      )}

      {!loading && !error && zones.length === 0 && (
        <p className="rounded-lg border border-[#c3c6d7] bg-white px-4 py-12 text-center text-sm text-[#555f6d]">
          Nicio zonă de lumină configurată.
        </p>
      )}

      {!loading &&
        groups.map((group) => (
          <section key={group.room_id} className="flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-semibold text-[#191b23]">{group.room_name}</h2>
              <span className="rounded-xl bg-[#e1e2ed] px-2 py-1 text-xs font-semibold tracking-[0.6px] text-[#434655]">
                {group.zones.length}{" "}
                {group.zones.length === 1 ? "dispozitiv" : "dispozitive"}
              </span>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {group.zones.map((zone) => (
                <LightZoneCard
                  key={zone.id}
                  zone={zone}
                  busy={togglingIds.has(zone.id)}
                  error={zoneErrors[zone.id] ?? null}
                  onToggle={() => void handleToggle(zone)}
                />
              ))}
            </div>
          </section>
        ))}
    </div>
  );
}
