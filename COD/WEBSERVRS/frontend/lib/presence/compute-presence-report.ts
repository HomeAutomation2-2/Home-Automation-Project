import { parseAccessLogEntry } from "@/lib/access-log/parse-access-log";
import type { UnifiedLog } from "@/lib/types/log";
import type { UserPresenceItem } from "@/lib/types/user-presence";

export type PresenceReportFilters = {
  dateFrom: Date;
  dateTo: Date;
  /** null = toți utilizatorii (admin) */
  userId: number | null;
  search: string;
};

export type PresenceActivityRow = {
  key: string;
  userId: number | null;
  name: string;
  initials: string;
  eventLabel: string;
  occurredAt: Date;
  timestampLabel: string;
  durationLabel: string;
  status: "active" | "away";
};

export type CurrentlyHomeCard = {
  userId: number;
  name: string;
  initials: string;
  sinceLabel: string;
};

export type PresenceHighlight = {
  name: string;
  timestampLabel: string;
};

export type PresenceReport = {
  totalHomeNow: number;
  lastEntry: PresenceHighlight | null;
  lastExit: PresenceHighlight | null;
  currentlyHome: CurrentlyHomeCard[];
  activityRows: PresenceActivityRow[];
};

type ParsedAccess = {
  key: string;
  name: string;
  userId: number | null;
  direction: "entry" | "exit";
  occurredAt: Date;
};

function fullName(user: UserPresenceItem): string {
  return `${user.first_name} ${user.last_name}`.trim();
}

function buildNameToUser(
  presence: UserPresenceItem[],
): Map<string, UserPresenceItem> {
  const map = new Map<string, UserPresenceItem>();
  for (const user of presence) {
    map.set(fullName(user).toLowerCase(), user);
  }
  return map;
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

export function formatPresenceTimestamp(date: Date, now = new Date()): string {
  const isToday = date.toDateString() === now.toDateString();
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  const isYesterday = date.toDateString() === yesterday.toDateString();

  const time = date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

  if (isToday) return `Today, ${time}`;
  if (isYesterday) return `Yesterday, ${time}`;
  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

export function formatSinceTime(date: Date): string {
  return `Since ${date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  })}`;
}

export function formatDurationMs(ms: number): string {
  if (ms <= 0) return "—";
  const totalMinutes = Math.floor(ms / 60_000);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (hours > 0 && minutes > 0) return `${hours}h ${minutes}m`;
  if (hours > 0) return `${hours}h`;
  return `${Math.max(minutes, 1)}m`;
}

function parseAllAccessEvents(
  logs: UnifiedLog[],
  presenceByName: Map<string, UserPresenceItem>,
): ParsedAccess[] {
  return logs
    .map((log) => {
      const row = parseAccessLogEntry(log, presenceByName);
      if (!row) return null;
      const user = presenceByName.get(row.name.toLowerCase());
      return {
        key: row.key,
        name: row.name,
        userId: user?.id ?? null,
        direction: row.direction,
        occurredAt: row.occurredAt,
      };
    })
    .filter((e): e is ParsedAccess => e !== null)
    .sort((a, b) => a.occurredAt.getTime() - b.occurredAt.getTime());
}

function findNextExit(
  events: ParsedAccess[],
  entry: ParsedAccess,
): ParsedAccess | undefined {
  return events.find(
    (e) =>
      e.name === entry.name &&
      e.direction === "exit" &&
      e.occurredAt > entry.occurredAt,
  );
}

function findPrevEntry(
  events: ParsedAccess[],
  exit: ParsedAccess,
): ParsedAccess | undefined {
  return [...events]
    .reverse()
    .find(
      (e) =>
        e.name === exit.name &&
        e.direction === "entry" &&
        e.occurredAt < exit.occurredAt,
    );
}

function findSessionStart(
  events: ParsedAccess[],
  userName: string,
): Date | null {
  const userEvents = events.filter((e) => e.name === userName);
  if (userEvents.length === 0) return null;

  let inside = false;
  let sessionStart: Date | null = null;

  for (const event of userEvents) {
    if (event.direction === "entry") {
      if (!inside) sessionStart = event.occurredAt;
      inside = true;
    } else {
      inside = false;
      sessionStart = null;
    }
  }

  return inside ? sessionStart : null;
}

/**
 * Algoritm prezență (derivat din evenimente access in/out):
 *
 * 1. Fiecare log `type === 'access'` devine intrare (intrat) sau ieșire (părăsit).
 * 2. Starea utilizatorului e un automat: OUTSIDE --[entry]--> INSIDE --[exit]--> OUTSIDE.
 * 3. Pentru intervalul [dateFrom, dateTo]:
 *    - fiecare eveniment din interval apare în Activity Log (cronologic desc);
 *    - la ENTRY: Active dacă nu există EXIT ulterior (vizită deschisă la capătul intervalului);
 *    - la EXIT: Away, durata = timp între ENTRY-ul pereche și EXIT.
 * 4. „Currently Home” folosește GET /users/presence (is_home); „Since” = ora ultimului ENTRY
 *    fără EXIT după el, din întregul jurnal.
 * 5. Last Entry / Last Exit = cele mai recente evenimente globale (nu doar în interval).
 */
export function computePresenceReport(
  logs: UnifiedLog[],
  presence: UserPresenceItem[],
  filters: PresenceReportFilters,
  now = new Date(),
): PresenceReport {
  const presenceByName = buildNameToUser(presence);
  const allEvents = parseAllAccessEvents(logs, presenceByName);

  const rangeStart = filters.dateFrom;
  const rangeEnd = filters.dateTo;

  const matchesUser = (event: ParsedAccess) => {
    if (filters.userId !== null && event.userId !== filters.userId) return false;
    if (filters.search.trim()) {
      const q = filters.search.trim().toLowerCase();
      if (!event.name.toLowerCase().includes(q)) return false;
    }
    return true;
  };

  const inRange = allEvents.filter(
    (e) =>
      e.occurredAt >= rangeStart &&
      e.occurredAt <= rangeEnd &&
      matchesUser(e),
  );

  const activityRows: PresenceActivityRow[] = inRange
    .map((event) => {
      if (event.direction === "entry") {
        const nextExit = findNextExit(allEvents, event);
        const visitOpen = !nextExit || nextExit.occurredAt > rangeEnd;
        const durationMs =
          !visitOpen && nextExit
            ? nextExit.occurredAt.getTime() - event.occurredAt.getTime()
            : 0;

        return {
          key: event.key,
          userId: event.userId,
          name: event.name,
          initials: initialsFromName(event.name),
          eventLabel: "Home Entry",
          occurredAt: event.occurredAt,
          timestampLabel: formatPresenceTimestamp(event.occurredAt, now),
          durationLabel: visitOpen ? "—" : formatDurationMs(durationMs),
          status: visitOpen ? ("active" as const) : ("away" as const),
        };
      }

      const prevEntry = findPrevEntry(allEvents, event);
      const durationMs = prevEntry
        ? event.occurredAt.getTime() - prevEntry.occurredAt.getTime()
        : 0;

      return {
        key: event.key,
        userId: event.userId,
        name: event.name,
        initials: initialsFromName(event.name),
        eventLabel: "Home Exit",
        occurredAt: event.occurredAt,
        timestampLabel: formatPresenceTimestamp(event.occurredAt, now),
        durationLabel: formatDurationMs(durationMs),
        status: "away" as const,
      };
    })
    .sort((a, b) => b.occurredAt.getTime() - a.occurredAt.getTime());

  const activeResidents = presence.filter((u) => u.is_home && !u.is_suspended);
  const currentlyHome: CurrentlyHomeCard[] = activeResidents.map((user) => {
    const name = fullName(user);
    const since = findSessionStart(allEvents, name);
    return {
      userId: user.id,
      name,
      initials: initialsFromName(name),
      sinceLabel: since ? formatSinceTime(since) : "Since —",
    };
  });

  const lastEntryEvent = [...allEvents].reverse().find((e) => e.direction === "entry");
  const lastExitEvent = [...allEvents].reverse().find((e) => e.direction === "exit");

  return {
    totalHomeNow: activeResidents.length,
    lastEntry: lastEntryEvent
      ? {
          name: lastEntryEvent.name,
          timestampLabel: formatPresenceTimestamp(lastEntryEvent.occurredAt, now),
        }
      : null,
    lastExit: lastExitEvent
      ? {
          name: lastExitEvent.name,
          timestampLabel: formatPresenceTimestamp(lastExitEvent.occurredAt, now),
        }
      : null,
    currentlyHome,
    activityRows,
  };
}

export function defaultPresenceRange(): { dateFrom: string; dateTo: string } {
  const to = new Date();
  const from = new Date();
  from.setDate(to.getDate() - 7);
  return {
    dateFrom: from.toISOString().slice(0, 10),
    dateTo: to.toISOString().slice(0, 10),
  };
}
