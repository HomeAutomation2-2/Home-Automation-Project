import { PresenceStatusBadge } from "@/components/presence/presence-status-badge";
import type { PresenceActivityRow } from "@/lib/presence/compute-presence-report";

type PresenceActivityTableProps = {
  rows: PresenceActivityRow[];
  loading?: boolean;
  emptyMessage: string;
  footer?: React.ReactNode;
};

export function PresenceActivityTable({
  rows,
  loading,
  emptyMessage,
  footer,
}: PresenceActivityTableProps) {
  return (
    <div className="overflow-hidden rounded-lg border border-[#c3c6d7] bg-white">
      {loading && (
        <p className="px-4 py-12 text-center text-sm text-[#555f6d]">
          Loading activity…
        </p>
      )}
      {!loading && (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left">
            <thead className="border-b border-[#c3c6d7] bg-[#f3f3fe]">
              <tr className="text-xs font-bold uppercase tracking-[0.6px] text-[#555f6d]">
                <th className="px-4 py-2">User</th>
                <th className="px-4 py-2">Event Type</th>
                <th className="px-4 py-2">Timestamp</th>
                <th className="px-4 py-2">Duration</th>
                <th className="px-4 py-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center text-sm text-[#555f6d]">
                    {emptyMessage}
                  </td>
                </tr>
              )}
              {rows.map((row, index) => (
                <tr
                  key={row.key}
                  className={index < rows.length - 1 ? "border-b border-[#c3c6d7]" : ""}
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-[rgba(37,99,235,0.15)] text-xs font-bold text-[#004ac6]">
                        {row.initials}
                      </span>
                      <span className="text-sm font-medium text-[#191b23]">{row.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-[#191b23]">{row.eventLabel}</td>
                  <td className="px-4 py-3 text-sm text-[#555f6d]">{row.timestampLabel}</td>
                  <td className="px-4 py-3 text-sm text-[#555f6d]">{row.durationLabel}</td>
                  <td className="px-4 py-3">
                    <PresenceStatusBadge status={row.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {footer}
    </div>
  );
}
