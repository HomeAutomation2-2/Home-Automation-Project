"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FIGMA_SHELL } from "@/components/shell/figma-shell-assets";
import { NavIcon } from "@/components/shell/nav-icon";
import {
  SIDE_NAV_ITEMS,
  isNavItemActive,
  type NavItemConfig,
} from "@/lib/nav-config";
import { isAdmin } from "@/lib/auth";

const ICON_BOX: Record<string, string> = {
  dashboard: "size-[15px]",
  users: "h-[13.333px] w-[18.333px]",
  access: "h-[17.5px] w-[13.333px]",
  presence: "h-[11.792px] w-[16.667px]",
  lighting: "h-[16.667px] w-[12.5px]",
  heating: "size-[15px]",
  reports: "size-[15px]",
  settings: "size-[15px]",
};

function NavItem({ item, active }: { item: NavItemConfig; active: boolean }) {
  const src = FIGMA_SHELL.nav[item.iconKey];
  const iconBox = ICON_BOX[item.iconKey] ?? "size-[15px]";

  const linkClass = active
    ? "group relative flex w-full shrink-0 cursor-pointer content-stretch items-center gap-[8px] border-l-[3px] border-solid border-[#004ac6] bg-[rgba(37,99,235,0.1)] py-[8px] pl-[19px] pr-[16px]"
    : "group relative flex w-full shrink-0 cursor-pointer content-stretch items-center gap-[8px] px-[16px] py-[8px] hover:bg-[rgba(37,99,235,0.06)]";

  return (
    <Link
      href={item.href}
      className={linkClass}
      aria-current={active ? "page" : undefined}
    >
      <NavIcon src={src} className={iconBox} active={active} />
      <span
        className={`text-[16px] font-normal leading-[18px] ${
          active
            ? "text-[#004ac6]"
            : "text-[#555f6d] group-hover:text-[#434655]"
        }`}
      >
        {item.label}
      </span>
    </Link>
  );
}

/** SideNavBar — iconițe albastre doar pe elementul activ */
export function SideNav() {
  const pathname = usePathname();

  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden h-full w-[240px] flex-col border-r border-solid border-[#c3c6d7] bg-[#faf8ff] py-[16px] pl-[8px] pr-[9px] font-[family-name:var(--font-inter)] md:flex">
      <div className="relative w-full shrink-0 pb-[16px]">
        <Link
          href="/dashboard"
          className="relative block h-[77px] w-full shrink-0 border-b border-solid border-[#c3c6d7] hover:opacity-90"
        >
          <div className="absolute left-[8px] right-[8px] top-0 flex content-stretch items-center gap-[8px]">
            <div className="relative flex size-[32px] shrink-0 content-stretch items-center justify-center rounded-[2px] bg-[#004ac6]">
              <div className="relative h-[13.333px] w-[18.333px] shrink-0">
                <img
                  alt=""
                  className="absolute inset-0 block size-full max-w-none"
                  src={FIGMA_SHELL.logoIcon}
                />
              </div>
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
