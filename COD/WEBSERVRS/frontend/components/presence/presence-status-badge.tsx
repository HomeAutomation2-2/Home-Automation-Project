type PresenceStatusBadgeProps = {
  status: "active" | "away";
};

export function PresenceStatusBadge({ status }: PresenceStatusBadgeProps) {
  const active = status === "active";
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-semibold tracking-[0.6px] ${
        active
          ? "bg-[rgba(37,99,235,0.1)] text-[#004ac6]"
          : "bg-[#ededf9] text-[#555f6d]"
      }`}
    >
      <span
        className={`size-1.5 rounded-full ${active ? "bg-[#004ac6]" : "bg-[#9ca3af]"}`}
        aria-hidden
      />
      {active ? "Acasă" : "Plecat"}
    </span>
  );
}
