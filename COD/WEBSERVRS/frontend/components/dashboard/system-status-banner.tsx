import { IconSystemCheck } from "@/components/dashboard/dashboard-icons";

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
          <IconSystemCheck className="text-[#004ac6]" />
        </div>
        <div>
          <h2 className="text-lg font-semibold leading-7 text-[#191b23]">
            Status sistem: {online ? "Online" : "Offline"}
          </h2>
          <p className="text-[13px] leading-[18px] text-[#555f6d]">
            {online
              ? "Totul funcționează normal."
              : "Datele nu s-au putut încărca. Reîncarcă pagina sau încearcă mai târziu."}
          </p>
        </div>
      </div>
      <div className="text-right">
        <p className="text-xs font-semibold tracking-[0.6px] text-[#555f6d]">Ultima sincronizare</p>
        <p className="text-[13px] font-semibold leading-[18px] text-[#191b23]">
          {lastSyncLabel}
        </p>
      </div>
    </div>
  );
}
