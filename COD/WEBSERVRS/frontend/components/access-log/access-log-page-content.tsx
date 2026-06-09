"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { parseReportDateRange } from "@/lib/reports/default-date-range";
import {
  AccessLogFilters,
  type AccessLogFilterDraft,
} from "@/components/access-log/access-log-filters";
import { AccessLogPagination } from "@/components/access-log/access-log-pagination";
import { AccessLogTable } from "@/components/access-log/access-log-table";
import { FIGMA_ACCESS_LOG } from "@/components/access-log/figma-access-log-assets";
import { ErrorBanner } from "@/components/ui/ErrorBanner";
import { exportAccessLogsCsv } from "@/lib/access-log/export-csv";
import {
  buildAccessLogRows,
  type AccessLogRow,
} from "@/lib/access-log/parse-access-log";
import { getApiClient, isAdmin, refreshSessionFromApi } from "@/lib/auth";
import { clampPage, paginateItems } from "@/lib/pagination";
import { ApiError } from "@/lib/types/api";
import type { UserPresenceItem } from "@/lib/types/user-presence";

const DEFAULT_FILTERS: AccessLogFilterDraft = {
  search: "",
  dateFrom: "",
  dateTo: "",
  userRole: "all",
  eventResult: "all",
};

const PAGE_SIZE = 5;

function applyFilters(
  rows: AccessLogRow[],
  filters: AccessLogFilterDraft,
): AccessLogRow[] {
  const q = filters.search.trim().toLowerCase();
  const from = filters.dateFrom ? new Date(`${filters.dateFrom}T00:00:00`) : null;
  const to = filters.dateTo ? new Date(`${filters.dateTo}T23:59:59`) : null;

  return rows.filter((row) => {
    if (q && !row.searchBlob.includes(q)) return false;
    if (from && row.occurredAt < from) return false;
    if (to && row.occurredAt > to) return false;
    if (filters.userRole === "admin" && !row.isAdmin) return false;
    if (filters.userRole === "user" && row.isAdmin) return false;
    if (filters.eventResult === "entry" && row.direction !== "entry") return false;
    if (filters.eventResult === "exit" && row.direction !== "exit") return false;
    return true;
  });
}

function buildInitialAccessFilters(
  dateFrom: string,
  dateTo: string,
): AccessLogFilterDraft {
  return { ...DEFAULT_FILTERS, dateFrom, dateTo };
}

export function AccessLogPageContent() {
  const searchParams = useSearchParams();
  const urlRange = parseReportDateRange(
    searchParams.get("dateFrom"),
    searchParams.get("dateTo"),
  );
  const initialFilters = useMemo(
    () => buildInitialAccessFilters(urlRange.dateFrom, urlRange.dateTo),
    [urlRange.dateFrom, urlRange.dateTo],
  );

  const [allRows, setAllRows] = useState<AccessLogRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [draftFilters, setDraftFilters] =
    useState<AccessLogFilterDraft>(initialFilters);
  const [appliedFilters, setAppliedFilters] =
    useState<AccessLogFilterDraft>(initialFilters);
  const [page, setPage] = useState(1);

  useEffect(() => {
    setDraftFilters(initialFilters);
    setAppliedFilters(initialFilters);
    setPage(1);
  }, [initialFilters]);

  const loadLogs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      await refreshSessionFromApi();
      const client = getApiClient();
      const [logs, presence] = await Promise.all([
        client.getLogs(),
        isAdmin() ? client.getPresence() : Promise.resolve([] as UserPresenceItem[]),
      ]);
      setAllRows(buildAccessLogRows(logs, presence));
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "Nu s-a putut încărca jurnalul de acces.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadLogs();
  }, [loadLogs]);

  const filtered = useMemo(
    () => applyFilters(allRows, appliedFilters),
    [allRows, appliedFilters],
  );

  const pagination = useMemo(
    () => paginateItems(filtered, page, PAGE_SIZE),
    [filtered, page],
  );

  useEffect(() => {
    const clamped = clampPage(page, pagination.totalPages);
    if (page !== clamped) setPage(clamped);
  }, [page, pagination.totalPages]);

  const handlePageChange = useCallback(
    (next: number) => {
      setPage(clampPage(next, pagination.totalPages));
    },
    [pagination.totalPages],
  );

  function handleApplyFilters() {
    setAppliedFilters({ ...draftFilters });
    setPage(1);
  }

  const paginationFooter =
    !loading ? (
      <AccessLogPagination
        page={pagination.currentPage}
        pageSize={PAGE_SIZE}
        totalItems={filtered.length}
        totalPages={pagination.totalPages}
        from={pagination.from}
        to={pagination.to}
        onPageChange={handlePageChange}
      />
    ) : null;

  return (
    <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <h1 className="text-2xl font-semibold tracking-[-0.24px] text-[#191b23]">
          Jurnal acces
        </h1>
        <button
          type="button"
          disabled={loading || filtered.length === 0}
          onClick={() => exportAccessLogsCsv(filtered)}
          className="inline-flex shrink-0 items-center gap-1 rounded bg-[#004ac6] px-4 py-2 text-sm text-white shadow-[0px_1px_1px_rgba(0,0,0,0.05)] hover:opacity-90 disabled:opacity-50"
        >
          <img alt="" src={FIGMA_ACCESS_LOG.exportIcon} className="size-3" />
          Export CSV
        </button>
      </div>

      {error && <ErrorBanner message={error} />}

      <AccessLogFilters
        draft={draftFilters}
        onChange={setDraftFilters}
        onApply={handleApplyFilters}
      />

      <AccessLogTable
        rows={pagination.rows}
        loading={loading}
        footer={paginationFooter}
      />
    </div>
  );
}
