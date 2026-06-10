"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { IconProfile } from "@/components/shell/nav-icons";
import { FIGMA_SHELL } from "@/components/shell/figma-shell-assets";
import { isAdmin, logout } from "@/lib/auth";
import { getPageMeta } from "@/lib/nav-config";
import { NotificationBell } from "@/components/shell/notification-bell";

function FigmaIconButton({
  src,
  width,
  height,
  label,
  onClick,
}: {
  src: string;
  width: string;
  height: string;
  label: string;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      className="relative z-10 flex size-[40px] shrink-0 cursor-pointer content-stretch items-center justify-center rounded-[12px] hover:bg-[rgba(37,99,235,0.08)]"
      aria-label={label}
      title={label}
      onClick={onClick}
    >
      <div
        className={`pointer-events-none relative shrink-0 ${height} ${width}`}
      >
        <img alt="" className="block h-full w-full max-w-none" src={src} />
      </div>
    </button>
  );
}

/** Header - TopAppBar — flex (grid Figma bloca click-urile) */
export function TopAppBar() {
  const pathname = usePathname();
  const { title, crumbs } = getPageMeta(pathname);
  const onProfile = pathname === "/profile";

  return (
    <header className="sticky top-0 z-20 flex w-full shrink-0 content-stretch items-center justify-between border-b border-solid border-[#c3c6d7] bg-[#faf8ff] px-[24px] pb-[9px] pt-[8px] font-[family-name:var(--font-inter)]">
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
                  <span className="relative mx-0.5 h-[8px] w-[4.933px] shrink-0">
                    <img
                      alt=""
                      className="block h-full w-full max-w-none"
                      src={FIGMA_SHELL.topBar.breadcrumbChevron}
                    />
                  </span>
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
        <FigmaIconButton
          src={FIGMA_SHELL.topBar.help}
          width="w-[20px]"
          height="h-[20px]"
          label="Ajutor"
          onClick={() =>
            window.open("https://github.com", "_blank", "noopener,noreferrer")
          }
        />
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
