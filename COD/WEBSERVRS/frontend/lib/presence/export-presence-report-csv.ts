import type { PresenceBreakdownRow } from "@/lib/presence/compute-presence-analytics";

export function exportPresenceReportCsv(rows: PresenceBreakdownRow[]): void {
  const header = [
    "Utilizator",
    "Locație",
    "Durată totală",
    "Ultima activitate",
    "Status",
  ];
  const lines = rows.map((row) =>
    [
      row.name,
      row.locationLabel,
      row.totalDurationLabel,
      row.lastSeenLabel,
      row.status === "present" ? "Acasă" : "Plecat",
    ]
      .map((cell) => `"${cell.replace(/"/g, '""')}"`)
      .join(","),
  );
  const csv = [header.join(","), ...lines].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `raport-prezenta-${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}
