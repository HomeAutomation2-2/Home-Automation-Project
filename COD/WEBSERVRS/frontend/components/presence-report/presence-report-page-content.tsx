"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { FIGMA_PRESENCE_REPORT } from "@/components/presence-report/figma-presence-report-assets";
import { PresenceReportSummaryCards } from "@/components/presence-report/presence-report-summary-cards";
import { PresenceReportTable } from "@/components/presence-report/presence-report-table";
import { ErrorBanner } from "@/components/ui/ErrorBanner";
import { computePresenceAnalytics } from "@/lib/presence/compute-presence-analytics";
import { exportPresenceReportCsv } from "@/lib/presence/export-presence-report-csv";
import {
  parseReportDateRange,
  validateReportDateRange,
} from "@/lib/reports/default-date-range";
import { getApiClient, isAdmin, refreshSessionFromApi } from "@/lib/auth";
import { clampPage, paginateItems } from "@/lib/pagination";
import { ApiError } from "@/lib/types/api";
import type { UnifiedLog } from "@/lib/types/log";
import type { UserPresenceItem } from "@/lib/types/user-presence";

const PAGE_SIZE = 5;

export function PresenceReportPageContent() {
  const searchParams = useSearchParams();
  const urlRange = parseReportDateRange(
    searchParams.get("dateFrom"),
    searchParams.get("dateTo"),
  );

  const [presence, setPresence] = useState<UserPresenceItem[]>([]);
  const [logs, setLogs] = useState<UnifiedLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dateFrom, setDateFrom] = useState(urlRange.dateFrom);
  const [dateTo, setDateTo] = useState(urlRange.dateTo);
  const [userId, setUserId] = useState("");
  const [page, setPage] = useState(1);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      await refreshSessionFromApi();
      const client = getApiClient();
      const [presenceData, logsData] = await Promise.all([
        client.getPresence(),
        client.getLogs(),
      ]);
      setPresence(presenceData);
      setLogs(logsData);
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "Nu s-a putut încărca raportul.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    setDateFrom(urlRange.dateFrom);
    setDateTo(urlRange.dateTo);
  }, [urlRange.dateFrom, urlRange.dateTo]);

  const rangeError = useMemo(
    () => validateReportDateRange(dateFrom, dateTo),
    [dateFrom, dateTo],
  );

  const report = useMemo(() => {
    if (rangeError) return null;
    return computePresenceAnalytics(
      logs,
      presence,
      new Date(`${dateFrom}T00:00:00`),
      new Date(`${dateTo}T23:59:59.999`),
      userId ? Number(userId) : null,
    );
  }, [logs, presence, dateFrom, dateTo, userId, rangeError]);

  const pagination = useMemo(
    () => paginateItems(report?.breakdownRows ?? [], page, PAGE_SIZE),
    [report?.breakdownRows, page],
  );

  useEffect(() => {
    const clamped = clampPage(page, pagination.totalPages);
    if (page !== clamped) setPage(clamped);
  }, [page, pagination.totalPages]);

  const showUserFilter = isAdmin();

  return (
    <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <Link href="/reports" className="text-sm text-[#004ac6] hover:underline">
            ← Rapoarte
          </Link>
          <h1 className="mt-2 text-2xl font-semibold tracking-[-0.6px] text-[#191b23]">
            Raport prezență
          </h1>
        </div>
      </div>

      {error && <ErrorBanner message={error} />}
      {rangeError && <ErrorBanner message={rangeError} />}

      <div className="flex flex-wrap items-end justify-between gap-4 rounded border border-[#c3c6d7] bg-white p-[17px]">
        <div className="flex flex-wrap items-end gap-3">
          <label className="flex flex-col gap-1">
            <span className="text-xs font-semibold uppercase tracking-[0.6px] text-[#555f6d]">
              De la
            </span>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => {
                setDateFrom(e.target.value);
                setPage(1);
              }}
              className="rounded border border-[#c3c6d7] bg-[#faf8ff] px-3 py-2 text-sm"
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-xs font-semibold uppercase tracking-[0.6px] text-[#555f6d]">
              Până la
            </span>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => {
                setDateTo(e.target.value);
                setPage(1);
              }}
              className="rounded border border-[#c3c6d7] bg-[#faf8ff] px-3 py-2 text-sm"
            />
          </label>
          {showUserFilter && (
            <label className="flex flex-col gap-1">
              <span className="text-xs font-semibold uppercase tracking-[0.6px] text-[#555f6d]">
                Utilizator
              </span>
              <select
                value={userId}
                onChange={(e) => {
                  setUserId(e.target.value);
                  setPage(1);
                }}
                className="min-w-[160px] rounded border border-[#c3c6d7] bg-[#faf8ff] px-3 py-2 text-sm"
              >
                <option value="">Toți</option>
                {presence.map((u) => (
                  <option key={u.id} value={String(u.id)}>
                    {u.first_name} {u.last_name}
                  </option>
                ))}
              </select>
            </label>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            disabled={loading || !report || report.breakdownRows.length === 0}
            onClick={() => report && exportPresenceReportCsv(report.breakdownRows)}
            className="inline-flex items-center gap-1 rounded border border-[#c3c6d7] bg-white px-4 py-2 text-sm text-[#191b23] disabled:opacity-50"
          >
            <img alt="" src={FIGMA_PRESENCE_REPORT.exportIcon} className="size-3" />
            Export
          </button>
          <button
            type="button"
            disabled={loading}
            onClick={() => void load()}
            className="inline-flex items-center gap-1 rounded bg-[#004ac6] px-4 py-2 text-sm text-white disabled:opacity-50"
          >
            <img alt="" src={FIGMA_PRESENCE_REPORT.refreshIcon} className="size-3" />
            Reîmprospătează
          </button>
        </div>
      </div>

      {report && !rangeError && <PresenceReportSummaryCards report={report} />}

      <PresenceReportTable
        rows={pagination.rows}
        loading={loading}
        page={pagination.currentPage}
        pageSize={PAGE_SIZE}
        totalItems={report?.breakdownRows.length ?? 0}
        totalPages={pagination.totalPages}
        from={pagination.from}
        to={pagination.to}
        onPageChange={(next) => setPage(clampPage(next, pagination.totalPages))}
      />
    </div>
  );
}
