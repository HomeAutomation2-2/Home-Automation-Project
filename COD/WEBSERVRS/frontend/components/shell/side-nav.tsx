"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  IconAccess,
  IconDashboard,
  IconHeating,
  IconLighting,
  IconLogo,
  IconPresence,
  IconReports,
  IconSettings,
  IconUsers,
} from "@/components/shell/nav-icons";
import {
  SIDE_NAV_ITEMS,
  isNavItemActive,
  type NavIconKey,
  type NavItemConfig,
} from "@/lib/nav-config";
import { isAdmin } from "@/lib/auth";
import type { ComponentType, SVGProps } from "react";

const NAV_ICON_COMPONENTS: Record<
  NavIconKey,
  ComponentType<SVGProps<SVGSVGElement>>
> = {
  dashboard: IconDashboard,
  users: IconUsers,
  access: IconAccess,
  presence: IconPresence,
  lighting: IconLighting,
  heating: IconHeating,
  reports: IconReports,
  settings: IconSettings,
};

function NavItem({ item, active }: { item: NavItemConfig; active: boolean }) {
  const Icon = NAV_ICON_COMPONENTS[item.iconKey];
  const colorClass = active
    ? "text-[#004ac6]"
    : "text-[#555f6d] group-hover:text-[#434655]";

  const linkClass = active
    ? "group relative flex w-full shrink-0 cursor-pointer content-stretch items-center gap-[8px] border-l-[3px] border-solid border-[#004ac6] bg-[rgba(37,99,235,0.1)] py-[8px] pl-[19px] pr-[16px]"
    : "group relative flex w-full shrink-0 cursor-pointer content-stretch items-center gap-[8px] px-[16px] py-[8px] hover:bg-[rgba(37,99,235,0.06)]";

  return (
    <Link
      href={item.href}
      className={linkClass}
      aria-current={active ? "page" : undefined}
    >
      <Icon className={colorClass} />
      <span
        className={`text-[16px] font-normal leading-[18px] ${
          active ? "text-[#004ac6]" : "text-[#555f6d] group-hover:text-[#434655]"
        }`}
      >
        {item.label}
      </span>
    </Link>
  );
}

/** SideNavBar — iconițe SVG locale (nu depind de URL-uri Figma expirate) */
export function SideNav() {
  const pathname = usePathname();

  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden h-full w-[240px] flex-col border-r border-solid border-[#c3c6d7] bg-[#faf8ff] py-[16px] pl-[8px] pr-[9px] font-inter md:flex">
      <div className="relative w-full shrink-0 pb-[16px]">
        <Link
          href="/dashboard"
          className="relative block h-[77px] w-full shrink-0 border-b border-solid border-[#c3c6d7] hover:opacity-90"
        >
          <div className="absolute left-[8px] right-[8px] top-0 flex content-stretch items-center gap-[8px]">
            <div className="relative flex size-[32px] shrink-0 content-stretch items-center justify-center rounded-[2px] bg-[#004ac6] text-white">
              <IconLogo />
            </div>
            <p className="whitespace-nowrap text-[18px] font-bold leading-[18px] text-[#004ac6]">
              BlueLock
            </p>
          </div>
          <p className="absolute left-[48px] top-[43.5px] -translate-y-1/2 whitespace-nowrap text-[12px] font-semibold leading-[16px] tracking-[0.6px] text-[#555f6d]">
            Admin Console
          </p>
        </Link>
      </div>

      <nav className="relative flex min-h-0 w-full flex-1 flex-col gap-[4px]">
        {SIDE_NAV_ITEMS.filter((item) => !item.adminOnly || isAdmin()).map(
          (item) => (
            <NavItem
              key={item.id}
              item={item}
              active={isNavItemActive(pathname, item.href)}
            />
          ),
        )}
      </nav>
    </aside>
  );
}
