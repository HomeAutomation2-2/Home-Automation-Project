import type { AccessLogRow } from "@/lib/access-log/parse-access-log";

export function exportAccessLogsCsv(rows: AccessLogRow[]): void {
  const header = [
    "Utilizator",
    "Identitate",
    "Punct acces",
    "Direcție",
    "Rezultat",
    "Data și ora",
  ];
  const lines = rows.map((row) =>
    [
      row.name,
      row.identitySub,
      row.accessPoint,
      row.direction === "entry" ? "Intrare" : "Ieșire",
      "Autorizat",
      row.timestampLabel,
    ]
      .map((cell) => `"${cell.replace(/"/g, '""')}"`)
      .join(","),
  );
  const csv = [header.join(","), ...lines].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `jurnal-acces-${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}
