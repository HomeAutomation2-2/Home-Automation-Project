import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/heating", label: "Prezentare", exact: true },
  { href: "/heating/programs", label: "Programe", exact: false },
] as const;

export function HeatingSubNav() {
  const pathname = usePathname();

  return (
    <nav
      className="flex flex-wrap gap-1 border-b border-[#c3c6d7]"
      aria-label="Secțiuni încălzire"
    >
      {LINKS.map((link) => {
        const active = link.exact
          ? pathname === link.href
          : pathname === link.href || pathname.startsWith(`${link.href}/`);
        return (
          <Link
            key={link.href}
            href={link.href}
            className={`border-b-2 px-4 py-2 text-sm font-semibold transition-colors ${
              active
                ? "border-[#004ac6] text-[#004ac6]"
                : "border-transparent text-[#555f6d] hover:text-[#191b23]"
            }`}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
