import { validateReportDateRange } from "@/lib/reports/default-date-range";

type ReportsDateFilterProps = {
  dateFrom: string;
  dateTo: string;
  onChange: (next: { dateFrom: string; dateTo: string }) => void;
};

export function ReportsDateFilter({
  dateFrom,
  dateTo,
  onChange,
}: ReportsDateFilterProps) {
  const rangeError = validateReportDateRange(dateFrom, dateTo);

  return (
    <div className="rounded-lg border border-[#c3c6d7] bg-white p-[17px] shadow-[0px_2px_4px_-1px_rgba(0,0,0,0.02)]">
      <p className="text-xs font-bold uppercase tracking-[0.6px] text-[#555f6d]">
        Interval raport
      </p>
      <div className="mt-2 flex flex-wrap items-end gap-3">
        <label className="flex flex-col gap-1">
          <span className="text-xs text-[#555f6d]">De la</span>
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => onChange({ dateFrom: e.target.value, dateTo })}
            className="rounded border border-[#c3c6d7] bg-[#faf8ff] px-2 py-1.5 text-sm text-[#191b23] outline-none focus:border-[#004ac6]"
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-xs text-[#555f6d]">Până la</span>
          <input
            type="date"
            value={dateTo}
            onChange={(e) => onChange({ dateFrom, dateTo: e.target.value })}
            className="rounded border border-[#c3c6d7] bg-[#faf8ff] px-2 py-1.5 text-sm text-[#191b23] outline-none focus:border-[#004ac6]"
          />
        </label>
      </div>
      {rangeError && (
        <p className="mt-2 text-xs text-[#b42318]" role="alert">
          {rangeError}
        </p>
      )}
    </div>
  );
}
