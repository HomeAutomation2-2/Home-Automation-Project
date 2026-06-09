export function defaultReportDateRange(): { dateFrom: string; dateTo: string } {
  const to = new Date();
  const from = new Date();
  from.setDate(to.getDate() - 7);
  return {
    dateFrom: from.toISOString().slice(0, 10),
    dateTo: to.toISOString().slice(0, 10),
  };
}

export function parseReportDateRange(
  dateFrom: string | null | undefined,
  dateTo: string | null | undefined,
): { dateFrom: string; dateTo: string } {
  const defaults = defaultReportDateRange();
  return {
    dateFrom: dateFrom?.trim() || defaults.dateFrom,
    dateTo: dateTo?.trim() || defaults.dateTo,
  };
}

export function validateReportDateRange(
  dateFrom: string,
  dateTo: string,
): string | null {
  if (!dateFrom || !dateTo) return "Selectează intervalul de date.";
  if (dateFrom > dateTo) return "Data de început trebuie să fie înainte de data de sfârșit.";
  return null;
}
