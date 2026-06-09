import { AccessLogPagination } from "@/components/access-log/access-log-pagination";
import { FIGMA_PRESENCE_REPORT } from "@/components/presence-report/figma-presence-report-assets";
import type { PresenceBreakdownRow } from "@/lib/presence/compute-presence-analytics";

type PresenceReportTableProps = {
  rows: PresenceBreakdownRow[];
  loading?: boolean;
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  from: number;
  to: number;
  onPageChange: (page: number) => void;
};

function StatusBadge({ status }: { status: "present" | "away" }) {
  const present = status === "present";
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-xl px-1 py-0.5 text-xs font-medium ${
        present
          ? "bg-[rgba(0,74,198,0.1)] text-[#004ac6]"
          : "bg-[rgba(195,198,215,0.3)] text-[#555f6d]"
      }`}
    >
      <span
        className={`size-1.5 rounded-full ${present ? "bg-[#004ac6]" : "bg-[#555f6d]"}`}
        aria-hidden
      />
      {present ? "Acasă" : "Plecat"}
    </span>
  );
}

export function PresenceReportTable({
  rows,
  loading,
  page,
  pageSize,
  totalItems,
  totalPages,
  from,
  to,
  onPageChange,
}: PresenceReportTableProps) {
  return (
    <div className="overflow-hidden rounded border border-[#c3c6d7] bg-white">
      <div className="flex items-center justify-between border-b border-[#c3c6d7] bg-[rgba(243,243,254,0.5)] px-4 py-4">
        <h2 className="text-lg font-semibold text-[#191b23]">Detaliu prezență</h2>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[800px] text-left">
          <thead className="border-b border-[#c3c6d7]">
            <tr className="text-xs font-semibold uppercase tracking-[0.6px] text-[#555f6d]">
              <th className="px-4 py-2">Utilizator</th>
              <th className="px-4 py-2">Locație</th>
              <th className="px-4 py-2">Durată totală</th>
              <th className="px-4 py-2">Ultima activitate</th>
              <th className="px-4 py-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan={5} className="px-4 py-12 text-center text-sm text-[#555f6d]">
                  Se încarcă…
                </td>
              </tr>
            )}
            {!loading && rows.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-12 text-center text-sm text-[#555f6d]">
                  Niciun rezultat în interval.
                </td>
              </tr>
            )}
            {!loading &&
              rows.map((row, index) => (
                <tr
                  key={row.key}
                  className={
                    index % 2 === 1
                      ? "border-t border-[#c3c6d7] bg-[rgba(243,243,254,0.2)]"
                      : "border-t border-[#c3c6d7]"
                  }
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className="flex size-6 items-center justify-center rounded-xl bg-[#e1e2ed]">
                        <img
                          alt=""
                          src={FIGMA_PRESENCE_REPORT.deviceBadge}
                          className="size-3 max-w-none"
                        />
                      </span>
                      <span className="text-[13px] text-[#191b23]">{row.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-[13px] text-[#555f6d]">
                    {row.locationLabel}
                  </td>
                  <td className="px-4 py-3 text-[13px] font-medium text-[#191b23]">
                    {row.totalDurationLabel}
                  </td>
                  <td className="px-4 py-3 text-[13px] text-[#555f6d]">
                    {row.lastSeenLabel}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={row.status} />
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {!loading && totalItems > 0 && (
        <AccessLogPagination
          page={page}
          pageSize={pageSize}
          totalItems={totalItems}
          totalPages={totalPages}
          from={from}
          to={to}
          onPageChange={onPageChange}
        />
      )}
    </div>
  );
}
