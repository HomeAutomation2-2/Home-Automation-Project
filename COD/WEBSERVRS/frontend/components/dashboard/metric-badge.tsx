type MetricBadgeProps = {
  label: string;
  variant: "active" | "neutral";
};

export function MetricBadge({ label, variant }: MetricBadgeProps) {
  const isActive = variant === "active";
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-1 text-xs font-semibold tracking-[0.6px] ${
        isActive
          ? "bg-[rgba(37,99,235,0.1)] text-[#004ac6]"
          : "bg-[#e1e2ed] text-[#434655]"
      }`}
    >
      <span
        className={`size-1.5 rounded-full ${isActive ? "bg-[#004ac6]" : "bg-[#434655]"}`}
      />
      {label}
    </span>
  );
}
