/** Formatează data contului pentru cardul de profil (ro-RO). */
export function formatProfileMemberSince(iso: string, now = new Date()): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "—";

  const isToday = date.toDateString() === now.toDateString();
  const time = date.toLocaleTimeString("ro-RO", {
    hour: "2-digit",
    minute: "2-digit",
  });

  if (isToday) return `Azi, ${time}`;
  return date.toLocaleDateString("ro-RO", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}
