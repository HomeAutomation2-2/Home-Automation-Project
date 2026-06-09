import { FIGMA_ACCESS_LOG } from "@/components/access-log/figma-access-log-assets";
import { ResultBadge } from "@/components/access-log/result-badge";
import type { AccessLogRow } from "@/lib/access-log/parse-access-log";

type AccessLogTableProps = {
  rows: AccessLogRow[];
  loading?: boolean;
  footer?: React.ReactNode;
};

export function AccessLogTable({ rows, loading, footer }: AccessLogTableProps) {
  return (
    <div className="overflow-hidden rounded border border-[#c3c6d7] bg-white shadow-[0px_2px_4px_-1px_rgba(0,0,0,0.02)]">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[900px] text-left">
          <thead className="border-b border-[#c3c6d7] bg-[#ededf9]">
            <tr className="text-xs font-semibold uppercase tracking-[0.6px] text-[#555f6d]">
              <th className="px-4 py-2">Utilizator</th>
              <th className="px-4 py-2">Punct acces</th>
              <th className="px-4 py-2">Direcție</th>
              <th className="px-4 py-2">Rezultat</th>
              <th className="px-4 py-2 text-right">Data și ora</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan={5} className="px-4 py-12 text-center text-sm text-[#555f6d]">
                  Se încarcă evenimentele…
                </td>
              </tr>
            )}
            {!loading && rows.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-12 text-center text-sm text-[#555f6d]">
                  Niciun eveniment în interval.
                </td>
              </tr>
            )}
            {!loading &&
              rows.map((row, index) => (
                <tr
                  key={row.key}
                  className={index < rows.length - 1 ? "border-b border-[#c3c6d7]" : ""}
                >
                  <td className="px-4 py-2">
                    <div className="flex items-center gap-2">
                      <span className="flex size-6 shrink-0 items-center justify-center rounded-xl bg-[rgba(37,99,235,0.2)] text-[10px] font-bold text-[#004ac6]">
                        {row.initials}
                      </span>
                      <div>
                        <p className="text-[13px] font-medium leading-4 text-[#191b23]">
                          {row.name}
                        </p>
                        <p className="text-xs text-[#555f6d]">{row.identitySub}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-2">
                    <div className="flex items-center gap-2">
                      <img
                        alt=""
                        src={FIGMA_ACCESS_LOG.accessPointIcon}
                        className="size-3.5 max-w-none"
                      />
                      <span className="text-[13px] text-[#191b23]">{row.accessPoint}</span>
                    </div>
                  </td>
                  <td className="px-4 py-2">
                    <div className="flex items-center gap-1">
                      <img
                        alt=""
                        src={
                          row.direction === "entry"
                            ? FIGMA_ACCESS_LOG.directionEntry
                            : FIGMA_ACCESS_LOG.directionExit
                        }
                        className="size-3 max-w-none"
                      />
                      <span
                        className={`text-[13px] ${
                          row.direction === "entry" ? "text-[#004ac6]" : "text-[#555f6d]"
                        }`}
                      >
                        {row.direction === "entry" ? "Intrare" : "Ieșire"}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-2">
                    <ResultBadge result={row.result} />
                  </td>
                  <td className="px-4 py-2 text-right text-[13px] text-[#555f6d]">
                    {row.timestampLabel}
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
      {footer}
    </div>
  );
}
