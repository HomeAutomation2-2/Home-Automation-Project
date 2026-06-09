import { FIGMA_PRESENCE } from "@/components/presence/figma-presence-assets";
import type { PresenceHighlight } from "@/lib/presence/compute-presence-report";

type PresenceSummaryCardsProps = {
  totalHomeNow: number;
  lastEntry: PresenceHighlight | null;
  lastExit: PresenceHighlight | null;
};

function SummaryCard({
  title,
  iconSrc,
  iconBg,
  children,
}: {
  title: string;
  iconSrc: string;
  iconBg: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2 rounded-lg border border-[#c3c6d7] bg-white p-[17px]">
      <div className="flex items-start justify-between">
        <span className="text-xs font-bold uppercase tracking-[0.6px] text-[#555f6d]">
          {title}
        </span>
        <span
          className={`flex size-8 items-center justify-center rounded-xl ${iconBg}`}
        >
          <img alt="" src={iconSrc} className="size-4 max-w-none" />
        </span>
      </div>
      <div className="pt-2">{children}</div>
    </div>
  );
}

export function PresenceSummaryCards({
  totalHomeNow,
  lastEntry,
  lastExit,
}: PresenceSummaryCardsProps) {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
      <SummaryCard
        title="Total Home Now"
        iconSrc={FIGMA_PRESENCE.iconHomeNow}
        iconBg="bg-[rgba(37,99,235,0.1)]"
      >
        <p className="flex items-baseline gap-1">
          <span className="text-[30px] font-bold leading-[38px] tracking-[-0.6px] text-[#191b23]">
            {totalHomeNow}
          </span>
          <span className="text-[13px] text-[#555f6d]">Residents</span>
        </p>
      </SummaryCard>

      <SummaryCard
        title="Last Entry"
        iconSrc={FIGMA_PRESENCE.iconLastEntry}
        iconBg="bg-[#ededf9]"
      >
        {lastEntry ? (
          <>
            <p className="text-sm font-bold text-[#191b23]">{lastEntry.name}</p>
            <p className="text-xs text-[#555f6d]">{lastEntry.timestampLabel}</p>
          </>
        ) : (
          <p className="text-sm text-[#555f6d]">—</p>
        )}
      </SummaryCard>

      <SummaryCard
        title="Last Exit"
        iconSrc={FIGMA_PRESENCE.iconLastExit}
        iconBg="bg-[#ededf9]"
      >
        {lastExit ? (
          <>
            <p className="text-sm font-bold text-[#191b23]">{lastExit.name}</p>
            <p className="text-xs text-[#555f6d]">{lastExit.timestampLabel}</p>
          </>
        ) : (
          <p className="text-sm text-[#555f6d]">—</p>
        )}
      </SummaryCard>
    </div>
  );
}
