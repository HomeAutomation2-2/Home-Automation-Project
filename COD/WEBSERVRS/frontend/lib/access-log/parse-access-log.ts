import type { UnifiedLog } from "@/lib/types/log";
import type { UserPresenceItem } from "@/lib/types/user-presence";

export type AccessLogRow = {
  key: string;
  name: string;
  initials: string;
  identitySub: string;
  direction: "entry" | "exit";
  result: "authorized";
  accessPoint: string;
  occurredAt: Date;
  timestampLabel: string;
  isAdmin: boolean;
  searchBlob: string;
};

const DEFAULT_ACCESS_POINT = "Home — Access Control";

export function formatAccessTimestamp(date: Date): string {
  const parts = date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
  return parts.replace(",", ",");
}

function buildPresenceByName(
  presence: UserPresenceItem[],
): Map<string, UserPresenceItem> {
  const map = new Map<string, UserPresenceItem>();
  for (const user of presence) {
    map.set(`${user.first_name} ${user.last_name}`.toLowerCase(), user);
  }
  return map;
}

export function parseAccessLogEntry(
  log: UnifiedLog,
  presenceByName: Map<string, UserPresenceItem>,
): AccessLogRow | null {
  if (log.type !== "access") return null;

  const isEntry = log.message.includes("intrat");
  const isExit = log.message.includes("părăsit");
  if (!isEntry && !isExit) return null;

  const nameMatch = log.message.match(/^(.+?)\s+a\s+(intrat|părăsit)/);
  const name = nameMatch?.[1]?.trim() ?? "Unknown";
  const parts = name.split(/\s+/).filter(Boolean);
  const initials = parts
    .map((p) => p.charAt(0))
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const presence = presenceByName.get(name.toLowerCase());
  const identitySub = presence ? `Tel: ${presence.phone}` : "ID: —";
  const isAdmin = presence?.is_admin ?? false;

  const occurredAt = new Date(log.occurred_at);

  return {
    key: `${log.id}-${log.occurred_at}`,
    name,
    initials,
    identitySub,
    direction: isEntry ? "entry" : "exit",
    result: "authorized",
    accessPoint: DEFAULT_ACCESS_POINT,
    occurredAt,
    timestampLabel: formatAccessTimestamp(occurredAt),
    isAdmin,
    searchBlob: `${name} ${identitySub} ${DEFAULT_ACCESS_POINT}`.toLowerCase(),
  };
}

export function buildAccessLogRows(
  logs: UnifiedLog[],
  presence: UserPresenceItem[] = [],
): AccessLogRow[] {
  const presenceByName = buildPresenceByName(presence);
  return logs
    .map((log) => parseAccessLogEntry(log, presenceByName))
    .filter((row): row is AccessLogRow => row !== null)
    .sort((a, b) => b.occurredAt.getTime() - a.occurredAt.getTime());
}
