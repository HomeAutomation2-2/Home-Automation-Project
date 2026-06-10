import type { ReactNode } from "react";
import { MetricBadge } from "@/components/dashboard/metric-badge";

type MetricCardProps = {
  icon: ReactNode;
  iconBgClass: string;
  badgeLabel: string;
  badgeVariant: "active" | "neutral";
  value: string;
  label: string;
  loading?: boolean;
  error?: string | null;
};

function MetricSkeleton() {
  return (
    <div className="animate-pulse space-y-6" aria-hidden>
      <div className="flex justify-between">
        <div className="size-10 rounded-xl bg-[#e8e9f0]" />
        <div className="h-6 w-20 rounded bg-[#e8e9f0]" />
      </div>
      <div className="h-9 w-16 rounded bg-[#e8e9f0]" />
    </div>
  );
}

export function MetricCard({
  icon,
  iconBgClass,
  badgeLabel,
  badgeVariant,
  value,
  label,
  loading,
  error,
}: MetricCardProps) {
  return (
    <div className="flex min-h-[154px] flex-col justify-between rounded-lg border border-[#c3c6d7] bg-white p-[17px]">
      {loading && <MetricSkeleton />}
      {!loading && error && (
        <p className="text-sm text-[#b42318]">{error}</p>
      )}
      {!loading && !error && (
        <>
          <div className="mb-6 flex items-start justify-between">
            <div
              className={`flex size-10 items-center justify-center rounded-xl ${iconBgClass}`}
            >
              {icon}
            </div>
            <MetricBadge label={badgeLabel} variant={badgeVariant} />
          </div>
          <div>
            <p className="text-[30px] font-semibold leading-[38px] tracking-[-0.6px] text-[#191b23]">
              {value}
            </p>
            <p className="text-[13px] leading-[18px] text-[#555f6d]">{label}</p>
          </div>
        </>
      )}
    </div>
  );
}
