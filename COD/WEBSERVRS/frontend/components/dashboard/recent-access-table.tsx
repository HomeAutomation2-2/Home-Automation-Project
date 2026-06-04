import Link from "next/link";
import { FIGMA_DASHBOARD } from "@/components/dashboard/figma-dashboard-assets";
import { parseAccessLogForTable } from "@/lib/dashboard/parse-access-log";
import type { DataState } from "@/lib/dashboard/load-state";
import type { UnifiedLog } from "@/lib/types/log";

const RECENT_LIMIT = 5;

type RecentAccessTableProps = {
  state: DataState<UnifiedLog[]>;
};

export function RecentAccessTable({ state }: RecentAccessTableProps) {
  const loading = state.status === "loading";
  const error = state.status === "error" ? state.message : null;

  const sortedRows =
    state.status === "ok"
      ? state.data
          .filter((l) => l.type === "access")
          .sort(
            (a, b) =>
              new Date(b.occurred_at).getTime() - new Date(a.occurred_at).getTime(),
          )
          .slice(0, RECENT_LIMIT)
          .map(parseAccessLogForTable)
          .filter((r): r is NonNullable<typeof r> => r !== null)
      : [];

  return (
    <div className="rounded-lg border border-[#c3c6d7] bg-white">
      <div className="flex items-center justify-between border-b border-[#c3c6d7] px-4 pb-[17px] pt-4">
        <h2 className="text-lg font-semibold leading-7 text-[#191b23]">Recent Access</h2>
        <Link
          href="/access-log"
          className="text-[13px] leading-[18px] text-[#004ac6] hover:underline"
        >
          View All
        </Link>
      </div>

      {loading && (
        <div className="animate-pulse space-y-2 p-4" aria-hidden>
          <div className="h-8 rounded bg-[#e8e9f0]" />
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-10 rounded bg-[#f3f3fe]" />
          ))}
        </div>
      )}

      {error && <p className="px-4 py-6 text-sm text-[#b42318]">{error}</p>}

      {!loading && !error && (
        <div className="overflow-hidden">
          <div className="border-b border-[#c3c6d7] bg-[#f3f3fe]">
            <div className="grid grid-cols-[1fr_auto_auto] text-xs font-semibold tracking-[0.6px] text-[#555f6d]">
              <span className="px-4 py-2">User</span>
              <span className="px-4 py-2">Time</span>
              <span className="px-4 py-2">Event</span>
            </div>
          </div>

          {sortedRows.length === 0 ? (
            <p className="px-4 py-6 text-sm text-[#555f6d]">
              Niciun eveniment de acces înregistrat.
            </p>
          ) : (
            <ul>
              {sortedRows.map((row, index) => (
                <li
                  key={row.key}
                  className={`grid grid-cols-[1fr_auto_auto] items-center ${
                    index < sortedRows.length - 1 ? "border-b border-[#c3c6d7]" : ""
                  }`}
                >
                  <div className="flex items-center gap-2 px-4 py-2">
                    <span className="flex size-6 items-center justify-center rounded-xl bg-[rgba(37,99,235,0.2)] text-[10px] font-bold text-[#004ac6]">
                      {row.initials}
                    </span>
                    <span className="text-[13px] leading-4 text-[#191b23]">{row.name}</span>
                  </div>
                  <span className="px-4 py-3 text-[13px] text-[#555f6d]">{row.timeLabel}</span>
                  <div className="flex items-center gap-1 px-4 py-3">
                    <img
                      alt=""
                      src={
                        row.event === "entry"
                          ? FIGMA_DASHBOARD.iconEntry
                          : FIGMA_DASHBOARD.iconExit
                      }
                      className="size-3 max-w-none"
                    />
                    <span
                      className={`text-[13px] leading-4 ${
                        row.event === "entry" ? "text-[#004ac6]" : "text-[#555f6d]"
                      }`}
                    >
                      {row.event === "entry" ? "Entry" : "Exit"}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
