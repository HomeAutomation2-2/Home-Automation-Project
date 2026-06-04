import Link from "next/link";
import type { ReactNode } from "react";

type Crumb = { label: string; href?: string };

type PageHeaderProps = {
  title: string;
  subtitle?: string;
  crumbs?: Crumb[];
  actions?: ReactNode;
};

export function PageHeader({ title, subtitle, crumbs, actions }: PageHeaderProps) {
  return (
    <div className="mb-6 flex flex-col gap-4 border-b border-[#c3c6d7] pb-4 sm:flex-row sm:items-start sm:justify-between">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-[#191b23]">{title}</h1>
        {crumbs && crumbs.length > 0 && (
          <nav className="mt-1 flex flex-wrap items-center gap-1 text-[13px] text-[#555f6d]">
            {crumbs.map((crumb, index) => (
              <span key={`${crumb.label}-${index}`} className="flex items-center gap-1">
                {index > 0 && <span aria-hidden>/</span>}
                {crumb.href ? (
                  <Link href={crumb.href} className="hover:text-[#004ac6]">
                    {crumb.label}
                  </Link>
                ) : (
                  <span>{crumb.label}</span>
                )}
              </span>
            ))}
          </nav>
        )}
        {subtitle && <p className="mt-2 max-w-2xl text-sm text-[#555f6d]">{subtitle}</p>}
      </div>
      {actions && <div className="flex shrink-0 flex-wrap gap-2">{actions}</div>}
    </div>
  );
}
