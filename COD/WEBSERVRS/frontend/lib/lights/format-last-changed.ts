export function formatLastChanged(value: string | undefined, now = new Date()): string | null {
  if (!value) return null;

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;

  const isToday = date.toDateString() === now.toDateString();
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  const isYesterday = date.toDateString() === yesterday.toDateString();

  const time = date.toLocaleTimeString("ro-RO", {
    hour: "2-digit",
    minute: "2-digit",
  });

  if (isToday) return time;
  if (isYesterday) return `Ieri, ${time}`;
  return date.toLocaleString("ro-RO", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}
