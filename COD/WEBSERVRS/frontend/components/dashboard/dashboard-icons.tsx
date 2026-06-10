import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

function iconClass(defaultSize: string, className?: string): string {
  return `block shrink-0 ${defaultSize}${className ? ` ${className}` : ""}`;
}

/** Status sistem — bifă în cerc */
export function IconSystemCheck({ className, ...props }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden className={iconClass("size-[23px]", className)} {...props}>
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5" />
      <path d="M8 12l3 3 5-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/** Camere aprinse — bec */
export function IconRoomsOn({ className, ...props }: IconProps) {
  return (
    <svg viewBox="0 0 16 20" fill="none" aria-hidden className={iconClass("h-5 w-[15px]", className)} {...props}>
      <path d="M8 2v2M5 14h6" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
      <path d="M8 4a5 5 0 015 5v3H3V9a5 5 0 015-5z" stroke="currentColor" strokeWidth="1.2" />
    </svg>
  );
}

/** Temperatură medie — termometru */
export function IconAvgTemp({ className, ...props }: IconProps) {
  return (
    <svg viewBox="0 0 18 18" fill="none" aria-hidden className={iconClass("size-[18px]", className)} {...props}>
      <path d="M9 3v10" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
      <circle cx="9" cy="15" r="2" stroke="currentColor" strokeWidth="1.2" />
      <path d="M11 5h-1.5a2.5 2.5 0 100 5H11" stroke="currentColor" strokeWidth="1.2" />
    </svg>
  );
}

/** Acasă acum — utilizatori */
export function IconUsersHome({ className, ...props }: IconProps) {
  return (
    <svg viewBox="0 0 20 14" fill="none" aria-hidden className={iconClass("h-[14px] w-5", className)} {...props}>
      <circle cx="7" cy="4" r="3" stroke="currentColor" strokeWidth="1.2" />
      <path d="M1 13c0-3.3 2.7-6 6-6s6 2.7 6 6" stroke="currentColor" strokeWidth="1.2" />
      <circle cx="14" cy="5" r="2.5" stroke="currentColor" strokeWidth="1.2" />
      <path d="M11 13c0-2.5 1.5-4.5 4-4.5" stroke="currentColor" strokeWidth="1.2" />
    </svg>
  );
}

/** Intrare */
export function IconEntry({ className, ...props }: IconProps) {
  return (
    <svg viewBox="0 0 12 12" fill="none" aria-hidden className={iconClass("size-3", className)} {...props}>
      <path d="M7 2v2h2l-3 3 3 3H7v2L2 6l5-4z" fill="currentColor" />
    </svg>
  );
}

/** Ieșire */
export function IconExit({ className, ...props }: IconProps) {
  return (
    <svg viewBox="0 0 12 12" fill="none" aria-hidden className={iconClass("size-3", className)} {...props}>
      <path d="M5 2v2H3l3 3-3 3h2v2l5-4-5-4z" fill="currentColor" />
    </svg>
  );
}
