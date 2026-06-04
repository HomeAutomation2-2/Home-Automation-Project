"use client";

import { useEffect, useMemo, useState } from "react";
import { FIGMA_DASHBOARD } from "@/components/dashboard/figma-dashboard-assets";
import { MetricCard } from "@/components/dashboard/metric-card";
import { RecentAccessTable } from "@/components/dashboard/recent-access-table";
import { SystemStatusBanner } from "@/components/dashboard/system-status-banner";
import { ZoneTemperaturesPanel } from "@/components/dashboard/zone-temperatures-panel";
import { getApiClient } from "@/lib/auth";
import { settleState, type DataState } from "@/lib/dashboard/load-state";
import type { LightZone } from "@/lib/types/light-zone";
import type { UnifiedLog } from "@/lib/types/log";
import type { Room } from "@/lib/types/room";
import type { UserPresenceItem } from "@/lib/types/user-presence";

const initial = <T,>(): DataState<T> => ({ status: "loading" });

function formatLastSync(date: Date): string {
  const diffSec = Math.floor((Date.now() - date.getTime()) / 1000);
  if (diffSec < 60) return "Just now";
  if (diffSec < 3600) return `${Math.floor(diffSec / 60)} min ago`;
  return date.toLocaleTimeString("ro-RO", { hour: "2-digit", minute: "2-digit" });
}

export function DashboardPageContent() {
  const [presence, setPresence] = useState<DataState<UserPresenceItem[]>>(initial());
  const [rooms, setRooms] = useState<DataState<Room[]>>(initial());
  const [lights, setLights] = useState<DataState<LightZone[]>>(initial());
  const [logs, setLogs] = useState<DataState<UnifiedLog[]>>(initial());
  const [healthOnline, setHealthOnline] = useState(true);
  const [healthLoading, setHealthLoading] = useState(true);
  const [lastSync, setLastSync] = useState<Date | null>(null);

  useEffect(() => {
    let cancelled = false;
    const client = getApiClient();

    async function load() {
      setPresence(initial());
      setRooms(initial());
      setLights(initial());
      setLogs(initial());
      setHealthLoading(true);

      const results = await Promise.allSettled([
        client.health(),
        client.getPresence(),
        client.getRooms(),
        client.getLightZones(),
        client.getLogs(),
      ]);

      if (cancelled) return;

      const healthResult = results[0];
      setHealthOnline(healthResult.status === "fulfilled");
      setHealthLoading(false);

      setPresence(settleState(results[1], "Prezența nu s-a putut încărca."));
      setRooms(settleState(results[2], "Camerele nu s-au putut încărca."));
      setLights(settleState(results[3], "Zonele de lumină nu s-au putut încărca."));
      setLogs(settleState(results[4], "Jurnalul nu s-a putut încărca."));

      const anyOk = results.slice(1).some((r) => r.status === "fulfilled");
      if (anyOk) setLastSync(new Date());
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  const metrics = useMemo(() => {
    const roomsOn =
      lights.status === "ok" ? lights.data.filter((z) => z.is_on).length : 0;
    const usersHome =
      presence.status === "ok"
        ? presence.data.filter((u) => u.is_home && !u.is_suspended).length
        : 0;
    let avgTemp = "—";
    if (rooms.status === "ok" && rooms.data.length > 0) {
      const sum = rooms.data.reduce((acc, r) => acc + Number(r.current_temp), 0);
      avgTemp = `${(sum / rooms.data.length).toFixed(1)}°`;
    }
    return { roomsOn, usersHome, avgTemp };
  }, [lights, presence, rooms]);

  return (
    <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-6">
      <SystemStatusBanner
        online={healthOnline}
        lastSyncLabel={lastSync ? formatLastSync(lastSync) : "—"}
        loading={healthLoading}
      />

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <MetricCard
          iconSrc={FIGMA_DASHBOARD.iconRoomsOn}
          iconBoxClass="h-5 w-[15px]"
          iconBgClass="bg-[rgba(37,99,235,0.1)]"
          badgeLabel="Active"
          badgeVariant="active"
          value={String(metrics.roomsOn)}
          label="Rooms ON"
          loading={lights.status === "loading"}
          error={lights.status === "error" ? lights.message : null}
        />
        <MetricCard
          iconSrc={FIGMA_DASHBOARD.iconAvgTemp}
          iconBoxClass="size-[18px]"
          iconBgClass="bg-[#e1e2ed]"
          badgeLabel="Normal Mode"
          badgeVariant="neutral"
          value={metrics.avgTemp}
          label="Avg Temp"
          loading={rooms.status === "loading"}
          error={rooms.status === "error" ? rooms.message : null}
        />
        <MetricCard
          iconSrc={FIGMA_DASHBOARD.iconUsersHome}
          iconBoxClass="h-[14px] w-5"
          iconBgClass="bg-[rgba(37,99,235,0.1)]"
          badgeLabel="Detected"
          badgeVariant="active"
          value={String(metrics.usersHome)}
          label="Users Home"
          loading={presence.status === "loading"}
          error={presence.status === "error" ? presence.message : null}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <ZoneTemperaturesPanel state={rooms} />
        <RecentAccessTable state={logs} />
      </div>
    </div>
  );
}
