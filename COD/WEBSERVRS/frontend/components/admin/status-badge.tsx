type StatusBadgeProps = {
  active: boolean;
  suspended?: boolean;
};

export function StatusBadge({ active, suspended }: StatusBadgeProps) {
  if (suspended) {
    return (
      <span className="inline-flex rounded-full bg-zinc-100 px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wide text-zinc-600">
        Suspendat
      </span>
    );
  }

  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wide ${
        active
          ? "bg-[rgba(37,99,235,0.12)] text-[#004ac6]"
          : "bg-zinc-100 text-zinc-600"
      }`}
    >
      {active ? "Activ" : "Inactiv"}
    </span>
  );
}
