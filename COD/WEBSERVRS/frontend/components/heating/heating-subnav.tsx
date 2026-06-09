import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/heating", label: "Prezentare", exact: true },
  { href: "/heating/programs", label: "Programe", exact: false },
  { href: "/heating/override", label: "Forțare", exact: false },
] as const;

export function HeatingSubNav() {
  const pathname = usePathname();

  return (
    <nav className="flex flex-wrap gap-2 border-b border-[#c3c6d7] pb-3">
      {LINKS.map((link) => {
        const active = link.exact
          ? pathname === link.href
          : pathname === link.href || pathname.startsWith(`${link.href}/`);
        return (
          <Link
            key={link.href}
            href={link.href}
            className={`rounded px-3 py-1.5 text-sm font-medium ${
              active
                ? "bg-[rgba(37,99,235,0.1)] text-[#004ac6]"
                : "text-[#555f6d] hover:bg-[#faf8ff] hover:text-[#191b23]"
            }`}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
