"use client";

import { useMemo, useState } from "react";
import { ReportTypeCard } from "@/components/reports/report-type-card";
import { ReportTypeSelector } from "@/components/reports/report-type-selector";
import { ReportsDateFilter } from "@/components/reports/reports-date-filter";
import {
  defaultReportDateRange,
  validateReportDateRange,
} from "@/lib/reports/default-date-range";
import { REPORT_TYPES, type ReportType } from "@/lib/reports/report-config";

export function ReportsPageContent() {
  const defaults = defaultReportDateRange();
  const [dateFrom, setDateFrom] = useState(defaults.dateFrom);
  const [dateTo, setDateTo] = useState(defaults.dateTo);
  const [selectedType, setSelectedType] = useState<ReportType>("events");

  const rangeError = useMemo(
    () => validateReportDateRange(dateFrom, dateTo),
    [dateFrom, dateTo],
  );

  const orderedCards = useMemo(() => {
    const selected = REPORT_TYPES.find((r) => r.id === selectedType);
    const rest = REPORT_TYPES.filter((r) => r.id !== selectedType);
    return selected ? [selected, ...rest] : REPORT_TYPES;
  }, [selectedType]);

  return (
    <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-6">
      <h1 className="text-2xl font-semibold tracking-[-0.6px] text-[#191b23]">
        Rapoarte
      </h1>

      <ReportsDateFilter
        dateFrom={dateFrom}
        dateTo={dateTo}
        onChange={({ dateFrom: from, dateTo: to }) => {
          setDateFrom(from);
          setDateTo(to);
        }}
      />

      <ReportTypeSelector selected={selectedType} onChange={setSelectedType} />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {orderedCards.map((config) => (
          <ReportTypeCard
            key={config.id}
            config={config}
            dateFrom={dateFrom}
            dateTo={dateTo}
            highlighted={config.id === selectedType}
            disabled={rangeError !== null}
          />
        ))}
      </div>
    </div>
  );
}
