import { IconHeatingSystem } from "@/components/heating/heating-icons";

type HeatingSystemStatusBannerProps = {
  avgTempLabel: string;
  activeZones: number;
  totalZones: number;
  systemModeLabel: string;
  clockLabel?: string;
  lastUpdatedLabel?: string | null;
  loading?: boolean;
};

export function HeatingSystemStatusBanner({
  avgTempLabel,
  activeZones,
  totalZones,
  systemModeLabel,
  clockLabel,
  lastUpdatedLabel,
  loading,
}: HeatingSystemStatusBannerProps) {
  if (loading) {
    return (
      <div
        className="h-[82px] animate-pulse rounded border border-[#e1e2ed] bg-white"
        aria-hidden
      />
    );
  }

  return (
    <div className="flex flex-col gap-4 rounded border border-[#e1e2ed] bg-white p-[17px] shadow-[0px_1px_1px_rgba(0,0,0,0.05)] sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-4">
        <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-[rgba(0,74,198,0.1)] text-[#004ac6]">
          <IconHeatingSystem />
        </span>
        <div>
          <h2 className="text-lg font-semibold text-[#191b23]">Status sistem</h2>
          <p className="text-[13px] text-[#555f6d]">
            {clockLabel ? (
              <>
                Acum, <span className="font-medium text-[#191b23]">{clockLabel}</span>
                {lastUpdatedLabel ? (
                  <span className="text-[#8a93a3]"> · {lastUpdatedLabel}</span>
                ) : null}
              </>
            ) : (
              "Toate zonele raportează normal."
            )}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-6 sm:gap-8">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.6px] text-[#555f6d]">
            Temp. medie
          </p>
          <p className="text-[30px] font-semibold leading-[38px] tracking-[-0.6px] text-[#191b23]">
            {avgTempLabel}
          </p>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.6px] text-[#555f6d]">
            Zone active
          </p>
          <p className="text-[30px] font-semibold leading-[38px] tracking-[-0.6px] text-[#191b23]">
            {activeZones}
            <span className="text-lg font-normal text-[#555f6d]"> / {totalZones}</span>
          </p>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.6px] text-[#555f6d]">
            Mod sistem
          </p>
          <div className="mt-1 flex items-center gap-1">
            <span className="size-2 shrink-0 rounded-full bg-[#004ac6]" aria-hidden />
            <span className="text-sm text-[#191b23]">{systemModeLabel}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
