"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
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
          ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
          : "text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
      }`}
    >
      {label}
    </Link>
  );
}

/**
 * Fallback client: dacă tokenul există doar în localStorage fără cookie,
 * middleware nu protejează — acest layout redirecționează la login.
 */
export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const showAdmin = isAdmin();
  const visibleNav = NAV_ITEMS.filter((item) => !item.adminOnly || showAdmin);

  return (
    <div className="flex min-h-full flex-col md:flex-row">
      <aside className="border-b border-zinc-200 bg-zinc-50 md:w-56 md:border-b-0 md:border-r dark:border-zinc-800 dark:bg-zinc-950">
        <div className="p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
            Home Automation
          </p>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">Cloud WEB</p>
        </div>
        <nav className="flex gap-1 overflow-x-auto px-2 pb-3 md:flex-col md:overflow-visible md:px-3 md:pb-4">
          {visibleNav.map((item) => (
            <NavLink key={item.href} href={item.href} label={item.label} />
          ))}
        </nav>
        {showAdmin && (
          <p className="hidden px-4 pb-4 text-xs text-zinc-500 md:block">
            Secțiune admin activă
          </p>
        )}
      </aside>
      <main className="flex flex-1 flex-col">
        <header className="border-b border-zinc-200 px-4 py-3 text-sm text-zinc-600 dark:border-zinc-800 dark:text-zinc-400 md:hidden">
          {visibleNav.find((n) => pathname === n.href || pathname.startsWith(`${n.href}/`))
            ?.label ?? "Aplicație"}
        </header>
        <div className="flex-1 p-4 md:p-6">{children}</div>
      </main>
    </div>
  );
}
