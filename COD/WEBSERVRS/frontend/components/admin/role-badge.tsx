type RoleBadgeProps = {
  isAdmin: boolean;
};

export function RoleBadge({ isAdmin }: RoleBadgeProps) {
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${
        isAdmin
          ? "bg-[rgba(37,99,235,0.12)] text-[#004ac6]"
          : "bg-zinc-100 text-zinc-700"
      }`}
    >
      {isAdmin ? "Administrator" : "Utilizator"}
    </span>
  );
}
