"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { FIGMA_SHELL } from "@/components/shell/figma-shell-assets";
import { logout } from "@/lib/auth";
import { getPageMeta } from "@/lib/nav-config";

function FigmaIconButton({
  src,
  width,
  height,
  label,
  onClick,
  href,
}: {
  src: string;
  width: string;
  height: string;
  label: string;
  onClick?: () => void;
  href?: string;
}) {
  const className =
    "relative z-10 flex size-[40px] shrink-0 cursor-pointer content-stretch items-center justify-center rounded-[12px] hover:bg-[rgba(37,99,235,0.08)]";

  const icon = (
    <div className={`pointer-events-none relative shrink-0 ${height} ${width}`}>
      <img alt="" className="block h-full w-full max-w-none" src={src} />
    </div>
  );

  if (href) {
    return (
      <Link href={href} className={className} aria-label={label} title={label}>
        {icon}
      </Link>
    );
  }

  return (
    <button
      type="button"
      className={className}
      aria-label={label}
      title={label}
      onClick={onClick}
    >
      {icon}
    </button>
  );
}

/** Header - TopAppBar — flex (grid Figma bloca click-urile) */
export function TopAppBar() {
  const pathname = usePathname();
  const router = useRouter();
  const { title, crumbs } = getPageMeta(pathname);

  return (
    <header className="sticky top-0 z-20 flex w-full shrink-0 content-stretch items-center justify-between border-b border-solid border-[#c3c6d7] bg-[#faf8ff] px-[24px] pb-[9px] pt-[8px] font-[family-name:var(--font-inter)]">
      <div className="relative min-w-0 shrink">
        <h1 className="whitespace-nowrap text-[24px] font-bold leading-[32px] tracking-[-0.24px] text-[#191b23]">
          {title}
        </h1>
        {crumbs.length > 0 && (
          <div className="flex w-full flex-wrap content-stretch items-center gap-[4px]">
            {crumbs.map((crumb, index) => (
              <span key={`${crumb.label}-${index}`} className="flex items-center gap-[4px]">
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
        <FigmaIconButton
          src={FIGMA_SHELL.topBar.bell}
          width="w-[16px]"
          height="h-[20px]"
          label="Notifications"
          onClick={() => router.push("/access-log")}
        />
        <FigmaIconButton
          src={FIGMA_SHELL.topBar.settings}
          width="w-[20.1px]"
          height="h-[20px]"
          label="Settings"
          href="/profile"
        />
        <FigmaIconButton
          src={FIGMA_SHELL.topBar.help}
          width="w-[20px]"
          height="h-[20px]"
          label="Help"
          onClick={() =>
            window.open(
              "https://github.com",
              "_blank",
              "noopener,noreferrer",
            )
          }
        />
        <div className="mx-1 h-[24px] w-px shrink-0 bg-[#c3c6d7]" aria-hidden />
        <button
          type="button"
          onClick={() => void logout()}
          className="cursor-pointer rounded-[2px] px-[16px] py-[8px] hover:bg-[rgba(37,99,235,0.08)]"
        >
          <span className="whitespace-nowrap text-center text-[12px] font-semibold leading-[16px] tracking-[0.6px] text-[#004ac6]">
            Logout
          </span>
        </button>
      </div>
    </header>
  );
}
