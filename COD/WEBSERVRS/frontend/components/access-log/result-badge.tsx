type ResultBadgeProps = {
  result: "authorized";
};

export function ResultBadge({ result }: ResultBadgeProps) {
  if (result === "authorized") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded border border-[rgba(37,99,235,0.2)] bg-[rgba(37,99,235,0.12)] px-2 py-0.5 text-[11px] font-bold uppercase tracking-[0.275px] text-[#004ac6]">
        <span className="size-1.5 rounded-full bg-[#004ac6]" />
        Authorized
      </span>
    );
  }
  return null;
}
