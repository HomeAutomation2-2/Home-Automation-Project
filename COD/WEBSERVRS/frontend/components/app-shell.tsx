"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { isAdmin } from "@/lib/auth";

type NavItem = {
  href: string;
  label: string;
  adminOnly?: boolean;
};

const NAV_ITEMS: NavItem[] = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/lights", label: "Lumină" },
  { href: "/heating", label: "Încălzire" },
  { href: "/access-log", label: "Jurnal" },
  { href: "/reports", label: "Rapoarte" },
  { href: "/profile", label: "Profil" },
  { href: "/admin/users", label: "Utilizatori", adminOnly: true },
];

function NavLink({ href, label }: { href: string; label: string }) {
  const pathname = usePathname();
  const active = pathname === href || pathname.startsWith(`${href}/`);

  return (
    <Link
      href={href}
      className={`block rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
        active
          ? "bg-[#004ac6] text-white"
          : "text-[#191b23] hover:bg-white/80"
      }`}
    >
      {label}
    </Link>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const showAdmin = mounted && isAdmin();
  const visibleNav = NAV_ITEMS.filter((item) => !item.adminOnly || showAdmin);

  return (
    <div className="flex min-h-full flex-col md:flex-row">
      <aside className="border-b border-[#c3c6d7] bg-[#faf8ff] md:w-56 md:border-b-0 md:border-r">
        <div className="p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-[#555f6d]">
            BlueLock
          </p>
          <p className="mt-1 text-sm text-[#737686]">Home Automation</p>
        </div>
        <nav className="flex gap-1 overflow-x-auto px-2 pb-3 md:flex-col md:overflow-visible md:px-3 md:pb-4">
          {visibleNav.map((item) => (
            <NavLink key={item.href} href={item.href} label={item.label} />
          ))}
        </nav>
      </aside>
      <main className="flex flex-1 flex-col bg-white">
        <header className="border-b border-[#c3c6d7] px-4 py-3 text-sm text-[#555f6d] md:hidden">
          {visibleNav.find((n) => pathname === n.href || pathname.startsWith(`${n.href}/`))
            ?.label ?? "Aplicație"}
        </header>
        <div className="flex-1 p-4 md:p-6">{children}</div>
      </main>
    </div>
  );
}
