import Link from "next/link";
import { FIGMA_REPORTS } from "@/components/reports/figma-reports-assets";
import type { ReportTypeConfig } from "@/lib/reports/report-config";
import { getReportHref } from "@/lib/reports/report-config";

const ICONS: Record<ReportTypeConfig["iconKey"], string> = {
  events: FIGMA_REPORTS.iconEvents,
  temperature: FIGMA_REPORTS.iconTemperature,
  presence: FIGMA_REPORTS.iconPresence,
};

type ReportTypeCardProps = {
  config: ReportTypeConfig;
  dateFrom: string;
  dateTo: string;
  highlighted?: boolean;
  disabled?: boolean;
};

export function ReportTypeCard({
  config,
  dateFrom,
  dateTo,
  highlighted,
  disabled,
}: ReportTypeCardProps) {
  const href = getReportHref(config.href, dateFrom, dateTo);

  return (
    <article
      className={`flex flex-col rounded-lg border bg-white p-[17px] shadow-[0px_2px_4px_-1px_rgba(0,0,0,0.02)] ${
        highlighted ? "border-[#004ac6]" : "border-[#c3c6d7]"
      } ${disabled ? "opacity-60" : ""}`}
    >
      <span className="mb-4 flex size-12 items-center justify-center rounded-xl bg-[rgba(37,99,235,0.1)]">
        <img alt="" src={ICONS[config.iconKey]} className="size-[18px] max-w-none" />
      </span>

      <h3 className="flex-1 text-lg font-semibold text-[#191b23]">{config.title}</h3>

      <div className="mt-4 flex items-center justify-between border-t border-[#c3c6d7] pt-3">
        {disabled ? (
          <span className="text-xs font-semibold uppercase tracking-[0.6px] text-[#555f6d]">
            Corectați intervalul
          </span>
        ) : (
          <Link
            href={href}
            className="text-xs font-semibold uppercase tracking-[0.6px] text-[#004ac6] hover:underline"
          >
            {config.actionLabel}
          </Link>
        )}
        <img alt="" src={FIGMA_REPORTS.chevron} className="size-[11px] max-w-none" />
      </div>
    </article>
  );
}
