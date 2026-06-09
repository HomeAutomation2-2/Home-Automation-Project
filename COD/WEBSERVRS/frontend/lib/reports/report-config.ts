export type ReportType = "events" | "presence" | "temperature";

export type ReportTypeConfig = {
  id: ReportType;
  title: string;
  href: string;
  actionLabel: string;
  iconKey: ReportType;
};

export const REPORT_TYPES: ReportTypeConfig[] = [
  {
    id: "events",
    title: "Evenimente",
    href: "/access-log",
    actionLabel: "Deschide",
    iconKey: "events",
  },
  {
    id: "temperature",
    title: "Temperaturi",
    href: "/heating/charts",
    actionLabel: "Deschide",
    iconKey: "temperature",
  },
  {
    id: "presence",
    title: "Prezență",
    href: "/reports/presence",
    actionLabel: "Deschide",
    iconKey: "presence",
  },
];

export function getReportHref(
  baseHref: string,
  dateFrom: string,
  dateTo: string,
): string {
  const params = new URLSearchParams();
  if (dateFrom) params.set("dateFrom", dateFrom);
  if (dateTo) params.set("dateTo", dateTo);
  const qs = params.toString();
  return qs ? `${baseHref}?${qs}` : baseHref;
}
