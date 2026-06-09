import type { UnifiedLog } from "@/lib/types/log";

export type AccessTableRow = {
  key: string;
  name: string;
  initials: string;
  timeLabel: string;
  event: "entry" | "exit";
};

export function parseAccessLogForTable(log: UnifiedLog): AccessTableRow | null {
  if (log.type !== "access") return null;

  const isEntry = log.message.includes("intrat");
  const isExit = log.message.includes("părăsit");
  if (!isEntry && !isExit) return null;

  const nameMatch = log.message.match(/^(.+?)\s+a\s+(intrat|părăsit)/);
  const name = nameMatch?.[1]?.trim() ?? "Utilizator";
  const parts = name.split(/\s+/).filter(Boolean);
  const initials = parts
    .map((p) => p.charAt(0))
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const occurred = new Date(log.occurred_at);
  const now = new Date();
  const isToday = occurred.toDateString() === now.toDateString();
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  const isYesterday = occurred.toDateString() === yesterday.toDateString();

  let timeLabel: string;
  if (isToday) {
    timeLabel = occurred.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  } else if (isYesterday) {
    timeLabel = "Yesterday";
  } else {
    timeLabel = occurred.toLocaleDateString("ro-RO", {
      day: "numeric",
      month: "short",
    });
  }

  return {
    key: `${log.id}-${log.occurred_at}`,
    name,
    initials,
    timeLabel,
    event: isEntry ? "entry" : "exit",
  };
}
