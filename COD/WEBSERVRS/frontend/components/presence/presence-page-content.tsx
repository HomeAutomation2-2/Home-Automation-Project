"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { parseReportDateRange } from "@/lib/reports/default-date-range";
import { AccessLogPagination } from "@/components/access-log/access-log-pagination";
import { CurrentlyHomeSection } from "@/components/presence/currently-home-section";
import {
  PresenceFiltersBar,
  type PresenceFilterDraft,
} from "@/components/presence/presence-filters-bar";
import { PresenceActivityTable } from "@/components/presence/presence-activity-table";
import { PresenceSummaryCards } from "@/components/presence/presence-summary-cards";
import { ErrorBanner } from "@/components/ui/ErrorBanner";
import { usePolling } from "@/hooks/usePolling";
import {
  computePresenceReport,
  defaultPresenceRange,
} from "@/lib/presence/compute-presence-report";
import { PRESENCE_POLL_INTERVAL_MS } from "@/lib/presence/presence-poll-config";
import { getApiClient, isAdmin, refreshSessionFromApi } from "@/lib/auth";
import { clampPage, paginateItems } from "@/lib/pagination";
import { ApiError } from "@/lib/types/api";
import type { UnifiedLog } from "@/lib/types/log";
import type { UserPresenceItem } from "@/lib/types/user-presence";

const PAGE_SIZE = 5;
const EMPTY_ACTIVITY_MSG =
  "Nu există evenimente de acces în intervalul selectat.";

function buildDefaultDraft(dateFrom?: string, dateTo?: string): PresenceFilterDraft {
  const range =
    dateFrom && dateTo
      ? { dateFrom, dateTo }
      : defaultPresenceRange();
  return {
    search: "",
    dateFrom: range.dateFrom,
    dateTo: range.dateTo,
    userId: "",
  };
}

export function PresencePageContent() {
  const searchParams = useSearchParams();
  const urlRange = parseReportDateRange(
    searchParams.get("dateFrom"),
    searchParams.get("dateTo"),
  );
  const initialDraft = useMemo(
    () => buildDefaultDraft(urlRange.dateFrom, urlRange.dateTo),
    [urlRange.dateFrom, urlRange.dateTo],
  );
  const [presence, setPresence] = useState<UserPresenceItem[]>([]);
  const [logs, setLogs] = useState<UnifiedLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [draftFilters, setDraftFilters] = useState<PresenceFilterDraft>(initialDraft);
  const [appliedFilters, setAppliedFilters] =
    useState<PresenceFilterDraft>(initialDraft);
  const [page, setPage] = useState(1);
  const inFlightRef = useRef(false);

  useEffect(() => {
    setDraftFilters(initialDraft);
    setAppliedFilters(initialDraft);
    setPage(1);
  }, [initialDraft]);

  const loadData = useCallback(async (options?: { silent?: boolean }) => {
    if (inFlightRef.current) return;
    inFlightRef.current = true;
    const silent = options?.silent ?? false;
    if (!silent) {
      setLoading(true);
      setError(null);
    }
    try {
      await refreshSessionFromApi();
      const client = getApiClient();
      const [presenceData, logsData] = await Promise.all([
        client.getPresence(),
        client.getLogs(),
      ]);
      setPresence(presenceData);
      setLogs(logsData);
      if (silent) setError(null);
    } catch (err) {
      if (!silent) {
        setError(
          err instanceof ApiError ? err.message : "Nu s-a putut încărca raportul de prezență.",
        );
      }
    } finally {
      inFlightRef.current = false;
      if (!silent) setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  usePolling(
    () => loadData({ silent: true }),
    PRESENCE_POLL_INTERVAL_MS,
    { pauseWhenHidden: true },
  );

  const rangeError = useMemo(() => {
    if (!appliedFilters.dateFrom || !appliedFilters.dateTo) {
      return "Selectați intervalul de date.";
    }
    if (appliedFilters.dateFrom > appliedFilters.dateTo) {
      return "Data de început trebuie să fie înainte de data de sfârșit.";
    }
    return null;
  }, [appliedFilters.dateFrom, appliedFilters.dateTo]);

  const report = useMemo(() => {
    if (rangeError) return null;
    const dateFrom = new Date(`${appliedFilters.dateFrom}T00:00:00`);
    const dateTo = new Date(`${appliedFilters.dateTo}T23:59:59.999`);
    return computePresenceReport(logs, presence, {
      dateFrom,
      dateTo,
      userId: appliedFilters.userId ? Number(appliedFilters.userId) : null,
      search: appliedFilters.search,
    });
  }, [logs, presence, appliedFilters, rangeError]);

  const pagination = useMemo(
    () =>
      paginateItems(report?.activityRows ?? [], page, PAGE_SIZE),
    [report?.activityRows, page],
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
    !loading && !rangeError && (report?.activityRows.length ?? 0) > 0 ? (
      <AccessLogPagination
        page={pagination.currentPage}
        pageSize={PAGE_SIZE}
        totalItems={report?.activityRows.length ?? 0}
        totalPages={pagination.totalPages}
        from={pagination.from}
        to={pagination.to}
        onPageChange={handlePageChange}
      />
    ) : null;

  return (
    <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-6">
      <h1 className="text-2xl font-semibold tracking-[-0.24px] text-[#191b23]">
        Prezență
      </h1>

      {error && <ErrorBanner message={error} />}
      {rangeError && !loading && <ErrorBanner message={rangeError} />}

      <PresenceSummaryCards
        totalHomeNow={report?.totalHomeNow ?? 0}
        lastEntry={report?.lastEntry ?? null}
        lastExit={report?.lastExit ?? null}
      />

      <CurrentlyHomeSection residents={report?.currentlyHome ?? []} />

      <div className="overflow-hidden rounded-lg border border-[#c3c6d7] bg-white">
        <PresenceFiltersBar
          draft={draftFilters}
          onChange={setDraftFilters}
          onApply={handleApplyFilters}
          users={presence}
          showUserSelect={isAdmin()}
        />
        <PresenceActivityTable
          rows={pagination.rows}
          loading={loading}
          emptyMessage={
            rangeError
              ? "Corectați intervalul de date și apăsați Aplică."
              : EMPTY_ACTIVITY_MSG
          }
          footer={paginationFooter}
        />
      </div>
    </div>
  );
}
