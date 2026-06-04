import { FIGMA_DASHBOARD } from "@/components/dashboard/figma-dashboard-assets";

type SystemStatusBannerProps = {
  online: boolean;
  lastSyncLabel: string;
  loading?: boolean;
};

export function SystemStatusBanner({
  online,
  lastSyncLabel,
  loading,
}: SystemStatusBannerProps) {
  if (loading) {
    return (
      <div
        className="animate-pulse rounded-lg border border-[#c3c6d7] bg-white p-[17px] shadow-[0px_1px_1px_rgba(0,0,0,0.05)]"
        aria-hidden
      >
        <div className="flex items-center gap-6">
          <div className="size-12 rounded-xl bg-[#e8e9f0]" />
          <div className="flex-1 space-y-2">
            <div className="h-7 w-48 rounded bg-[#e8e9f0]" />
            <div className="h-4 w-64 rounded bg-[#e8e9f0]" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between rounded-lg border border-[#c3c6d7] bg-white py-[17px] pl-[17px] pr-[17px] shadow-[0px_1px_1px_rgba(0,0,0,0.05)]">
      <div className="flex items-center gap-6">
        <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-[rgba(37,99,235,0.1)]">
          <img
            alt=""
            src={FIGMA_DASHBOARD.systemCheck}
            className="size-[23px] max-w-none"
          />
        </div>
        <div>
          <h2 className="text-lg font-semibold leading-7 text-[#191b23]">
            System Status: {online ? "Online" : "Offline"}
          </h2>
          <p className="text-[13px] leading-[18px] text-[#555f6d]">
            {online
              ? "All systems operating within normal parameters."
              : "Unele servicii nu răspund. Verifică backend-ul."}
          </p>
        </div>
      </div>
      <div className="text-right">
        <p className="text-xs font-semibold tracking-[0.6px] text-[#555f6d]">Last Sync</p>
        <p className="text-[13px] font-semibold leading-[18px] text-[#191b23]">
          {lastSyncLabel}
        </p>
      </div>
    </div>
  );
}
