import { parseAccessLogEntry } from "@/lib/access-log/parse-access-log";
import {
  formatDurationMs,
  formatPresenceTimestamp,
} from "@/lib/presence/compute-presence-report";
import type { UnifiedLog } from "@/lib/types/log";
import type { UserPresenceItem } from "@/lib/types/user-presence";

export type PresenceBreakdownRow = {
  key: string;
  userId: number;
  name: string;
  initials: string;
  locationLabel: string;
  totalDurationMs: number;
  totalDurationLabel: string;
  lastSeenAt: Date | null;
  lastSeenLabel: string;
  status: "present" | "away";
};

export type PresenceAnalyticsReport = {
  avgDailyOccupancyLabel: string;
  peakHoursLabel: string;
  mostActiveUser: {
    name: string;
    initials: string;
    totalLabel: string;
  } | null;
  breakdownRows: PresenceBreakdownRow[];
};

type ParsedAccess = {
  name: string;
  userId: number;
  direction: "entry" | "exit";
  occurredAt: Date;
};

function fullName(user: UserPresenceItem): string {
  return `${user.first_name} ${user.last_name}`.trim();
}

function initialsFromName(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .map((p) => p.charAt(0))
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function parseEvents(
  logs: UnifiedLog[],
  presence: UserPresenceItem[],
): ParsedAccess[] {
  const byName = new Map(presence.map((u) => [fullName(u).toLowerCase(), u]));

  return logs
    .map((log) => {
      const row = parseAccessLogEntry(log, byName);
      if (!row) return null;
      const user = byName.get(row.name.toLowerCase());
      if (!user) return null;
      return {
        name: row.name,
        userId: user.id,
        direction: row.direction,
        occurredAt: row.occurredAt,
      };
    })
    .filter((e): e is ParsedAccess => e !== null)
    .sort((a, b) => a.occurredAt.getTime() - b.occurredAt.getTime());
}

function sumVisitDurationsInRange(
  events: ParsedAccess[],
  rangeStart: Date,
  rangeEnd: Date,
): number {
  let total = 0;
  let openEntry: Date | null = null;

  for (const event of events) {
    if (event.occurredAt < rangeStart) {
      if (event.direction === "entry") openEntry = event.occurredAt;
      else openEntry = null;
      continue;
    }
    if (event.occurredAt > rangeEnd) break;

    if (event.direction === "entry") {
      openEntry = event.occurredAt;
    } else if (openEntry) {
      total += event.occurredAt.getTime() - openEntry.getTime();
      openEntry = null;
    }
  }

  if (openEntry) {
    total += rangeEnd.getTime() - openEntry.getTime();
  }

  return total;
}

function computePeakHours(events: ParsedAccess[]): string {
  if (events.length === 0) return "—";

  const hourCounts = new Array(24).fill(0) as number[];
  for (const e of events) {
    if (e.direction === "entry") {
      hourCounts[e.occurredAt.getHours()] += 1;
    }
  }

  let bestStart = 0;
  let bestSum = 0;
  for (let h = 0; h < 24; h += 1) {
    const sum = hourCounts[h] + hourCounts[(h + 1) % 24];
    if (sum > bestSum) {
      bestSum = sum;
      bestStart = h;
    }
  }

  if (bestSum === 0) return "—";

  const pad = (n: number) => String(n).padStart(2, "0");
  const end = (bestStart + 2) % 24;
  return `${pad(bestStart)}:00 – ${pad(end)}:00`;
}

export function computePresenceAnalytics(
  logs: UnifiedLog[],
  presence: UserPresenceItem[],
  rangeStart: Date,
  rangeEnd: Date,
  userIdFilter: number | null,
  now = new Date(),
): PresenceAnalyticsReport {
  const activeUsers = presence.filter((u) => !u.is_suspended);
  const filteredUsers =
    userIdFilter !== null
      ? activeUsers.filter((u) => u.id === userIdFilter)
      : activeUsers;

  const allEvents = parseEvents(logs, activeUsers);

  const breakdownRows: PresenceBreakdownRow[] = filteredUsers.map((user) => {
    const name = fullName(user);
    const userEvents = allEvents.filter((e) => e.userId === user.id);
    const inRangeEvents = userEvents.filter(
      (e) => e.occurredAt >= rangeStart && e.occurredAt <= rangeEnd,
    );
    const totalDurationMs = sumVisitDurationsInRange(
      userEvents,
      rangeStart,
      rangeEnd,
    );
    const lastInRange = [...inRangeEvents].pop() ?? [...userEvents].pop();
    const lastSeenAt = lastInRange?.occurredAt ?? null;

    return {
      key: String(user.id),
      userId: user.id,
      name,
      initials: initialsFromName(name),
      locationLabel: "Acasă",
      totalDurationMs,
      totalDurationLabel: formatDurationMs(totalDurationMs),
      lastSeenAt,
      lastSeenLabel: lastSeenAt
        ? formatPresenceTimestamp(lastSeenAt, now)
        : "—",
      status: user.is_home ? "present" : "away",
    };
  });

  breakdownRows.sort((a, b) => b.totalDurationMs - a.totalDurationMs);

  const dayCount = Math.max(
    1,
    Math.ceil(
      (rangeEnd.getTime() - rangeStart.getTime()) / (24 * 60 * 60 * 1000),
    ),
  );

  const totalMs = breakdownRows.reduce((s, r) => s + r.totalDurationMs, 0);
  const userCount = Math.max(breakdownRows.length, 1);
  const avgDailyMs = totalMs / dayCount / userCount;

  const rangeEvents = allEvents.filter(
    (e) =>
      e.occurredAt >= rangeStart &&
      e.occurredAt <= rangeEnd &&
      (userIdFilter === null || e.userId === userIdFilter),
  );

  const top = breakdownRows[0];
  const mostActiveUser =
    top && top.totalDurationMs > 0
      ? {
          name: top.name,
          initials: top.initials,
          totalLabel: `${formatDurationMs(top.totalDurationMs)} total`,
        }
      : null;

  return {
    avgDailyOccupancyLabel: formatDurationMs(avgDailyMs),
    peakHoursLabel: computePeakHours(rangeEvents),
    mostActiveUser,
    breakdownRows,
  };
}
