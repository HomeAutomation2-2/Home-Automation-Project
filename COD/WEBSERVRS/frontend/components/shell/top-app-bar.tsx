"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { IconChevronRight, IconHelp, IconProfile } from "@/components/shell/nav-icons";
import { isAdmin, logout } from "@/lib/auth";
import { getPageMeta } from "@/lib/nav-config";
import { NotificationBell } from "@/components/shell/notification-bell";

/** Header - TopAppBar */
export function TopAppBar() {
  const pathname = usePathname();
  const { title, crumbs } = getPageMeta(pathname);
  const onProfile = pathname === "/profile";

  return (
    <header className="sticky top-0 z-20 flex w-full shrink-0 content-stretch items-center justify-between border-b border-solid border-[#c3c6d7] bg-[#faf8ff] px-[24px] pb-[9px] pt-[8px] font-inter">
      <div className="relative min-w-0 shrink">
        <h1 className="whitespace-nowrap text-[24px] font-bold leading-[32px] tracking-[-0.24px] text-[#191b23]">
          {title}
        </h1>
        {crumbs.length > 0 && (
          <div className="flex w-full flex-wrap content-stretch items-center gap-[4px]">
            {crumbs.map((crumb, index) => (
              <span
                key={`${crumb.label}-${index}`}
                className="flex items-center gap-[4px]"
              >
                {index > 0 && (
                  <IconChevronRight className="mx-0.5 text-[#555f6d]" aria-hidden />
                )}
                {crumb.href ? (
                  <Link
                    href={crumb.href}
                    className="cursor-pointer whitespace-nowrap text-[13px] font-normal leading-[18px] text-[#555f6d] hover:text-[#004ac6]"
                  >
                    {crumb.label}
                  </Link>
                ) : (
                  <span className="whitespace-nowrap text-[13px] font-normal leading-[18px] text-[#555f6d]">
                    {crumb.label}
                  </span>
                )}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="relative z-10 flex shrink-0 items-center gap-[4px]">
        {isAdmin() && <NotificationBell />}
        <Link
          href="/profile"
          aria-label="Profil"
          title="Profil"
          aria-current={onProfile ? "page" : undefined}
          className={`relative z-10 flex size-[40px] shrink-0 cursor-pointer items-center justify-center rounded-[12px] text-[#555f6d] hover:bg-[rgba(37,99,235,0.08)] hover:text-[#004ac6] ${
            onProfile ? "bg-[rgba(37,99,235,0.1)] text-[#004ac6]" : ""
          }`}
        >
          <IconProfile />
        </Link>
        <button
          type="button"
          className="relative z-10 flex size-[40px] shrink-0 cursor-pointer content-stretch items-center justify-center rounded-[12px] text-[#555f6d] hover:bg-[rgba(37,99,235,0.08)] hover:text-[#004ac6]"
          aria-label="Ajutor"
          title="Ajutor"
          onClick={() =>
            window.open("https://github.com", "_blank", "noopener,noreferrer")
          }
        >
          <IconHelp />
        </button>
        <div className="mx-1 h-[24px] w-px shrink-0 bg-[#c3c6d7]" aria-hidden />
        <button
          type="button"
          onClick={() => void logout()}
          className="cursor-pointer rounded-[2px] px-[16px] py-[8px] hover:bg-[rgba(37,99,235,0.08)]"
        >
          <span className="whitespace-nowrap text-center text-[12px] font-semibold leading-[16px] tracking-[0.6px] text-[#004ac6]">
            Deconectare
          </span>
        </button>
      </div>
    </header>
  );
}
