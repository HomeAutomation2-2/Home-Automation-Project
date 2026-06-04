"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { SIDE_NAV_ITEMS } from "@/lib/nav-config";

/** Mobil: toate linkurile din Figma, inclusiv Users */
export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="flex gap-[4px] overflow-x-auto border-b border-solid border-[#c3c6d7] bg-[#faf8ff] px-[8px] py-[8px] md:hidden">
      {SIDE_NAV_ITEMS.map((item) => {
        const active =
          pathname === item.href || pathname.startsWith(`${item.href}/`);
        return (
          <Link
            key={item.id}
            href={item.href}
            className={`shrink-0 cursor-pointer whitespace-nowrap px-[16px] py-[8px] text-[16px] leading-[18px] ${
              active
                ? "border-l-[3px] border-solid border-[#004ac6] bg-[rgba(37,99,235,0.1)] pl-[19px] text-[#004ac6]"
                : "text-[#555f6d]"
            }`}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
