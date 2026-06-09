import { FIGMA_PRESENCE_REPORT } from "@/components/presence-report/figma-presence-report-assets";
import type { PresenceAnalyticsReport } from "@/lib/presence/compute-presence-analytics";

type PresenceReportSummaryCardsProps = {
  report: PresenceAnalyticsReport;
};

export function PresenceReportSummaryCards({
  report,
}: PresenceReportSummaryCardsProps) {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
      <div className="flex flex-col justify-between rounded border border-[#c3c6d7] bg-white p-[17px]">
        <div className="mb-2 flex items-center gap-1">
          <img
            alt=""
            src={FIGMA_PRESENCE_REPORT.metricOccupancy}
            className="h-[16px] w-[14px] max-w-none"
          />
          <span className="text-xs font-semibold uppercase tracking-[0.6px] text-[#555f6d]">
            Medie zilnică
          </span>
        </div>
        <p className="text-[30px] font-semibold tracking-[-0.6px] text-[#191b23]">
          {report.avgDailyOccupancyLabel}
        </p>
      </div>

      <div className="flex flex-col justify-between rounded border border-[#c3c6d7] bg-white p-[17px]">
        <div className="mb-2 flex items-center gap-1">
          <img
            alt=""
            src={FIGMA_PRESENCE_REPORT.metricPeak}
            className="h-[9px] w-[15px] max-w-none"
          />
          <span className="text-xs font-semibold uppercase tracking-[0.6px] text-[#555f6d]">
            Ore de vârf
          </span>
        </div>
        <p className="text-[30px] font-semibold tracking-[-0.6px] text-[#191b23]">
          {report.peakHoursLabel}
        </p>
      </div>

      <div className="flex flex-col justify-between rounded border border-[#c3c6d7] bg-white p-[17px]">
        <div className="mb-2 flex items-center gap-1">
          <img
            alt=""
            src={FIGMA_PRESENCE_REPORT.metricUser}
            className="size-3 max-w-none"
          />
          <span className="text-xs font-semibold uppercase tracking-[0.6px] text-[#555f6d]">
            Cel mai activ
          </span>
        </div>
        {report.mostActiveUser ? (
          <div className="flex items-center gap-2">
            <span className="flex size-10 items-center justify-center rounded-xl bg-[rgba(37,99,235,0.15)] text-sm font-bold text-[#004ac6]">
              {report.mostActiveUser.initials}
            </span>
            <div>
              <p className="text-base font-semibold text-[#191b23]">
                {report.mostActiveUser.name}
              </p>
              <p className="text-[13px] text-[#555f6d]">
                {report.mostActiveUser.totalLabel}
              </p>
            </div>
          </div>
        ) : (
          <p className="text-sm text-[#555f6d]">—</p>
        )}
      </div>
    </div>
  );
}
