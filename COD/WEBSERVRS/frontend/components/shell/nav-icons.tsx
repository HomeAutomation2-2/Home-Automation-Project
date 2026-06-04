import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

export function IconDashboard(props: IconProps) {
  return (
    <svg viewBox="0 0 16 16" fill="none" aria-hidden className="size-[15px]" {...props}>
      <rect x="1" y="1" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.2" />
      <rect x="9" y="1" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.2" />
      <rect x="1" y="9" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.2" />
      <rect x="9" y="9" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.2" />
    </svg>
  );
}

export function IconUsers(props: IconProps) {
  return (
    <svg viewBox="0 0 20 14" fill="none" aria-hidden className="h-[13px] w-[18px]" {...props}>
      <circle cx="7" cy="4" r="3" stroke="currentColor" strokeWidth="1.2" />
      <path d="M1 13c0-3.3 2.7-6 6-6s6 2.7 6 6" stroke="currentColor" strokeWidth="1.2" />
      <circle cx="14" cy="5" r="2.5" stroke="currentColor" strokeWidth="1.2" />
      <path d="M11 13c0-2.5 1.5-4.5 4-4.5" stroke="currentColor" strokeWidth="1.2" />
    </svg>
  );
}

export function IconAccess(props: IconProps) {
  return (
    <svg viewBox="0 0 14 18" fill="none" aria-hidden className="h-[17px] w-[13px]" {...props}>
      <rect x="2" y="7" width="10" height="9" rx="1" stroke="currentColor" strokeWidth="1.2" />
      <path d="M4 7V5a3 3 0 116 0v2" stroke="currentColor" strokeWidth="1.2" />
    </svg>
  );
}

export function IconPresence(props: IconProps) {
  return (
    <svg viewBox="0 0 18 12" fill="none" aria-hidden className="h-3 w-[17px]" {...props}>
      <path d="M1 6c2-4 14-4 16 0" stroke="currentColor" strokeWidth="1.2" />
      <path d="M4 6c1.5-2 8.5-2 10 0" stroke="currentColor" strokeWidth="1.2" />
      <circle cx="9" cy="6" r="1.5" fill="currentColor" />
    </svg>
  );
}

export function IconLighting(props: IconProps) {
  return (
    <svg viewBox="0 0 14 18" fill="none" aria-hidden className="h-4 w-3" {...props}>
      <path d="M7 1v10M4 11h6l-3 6" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}

export function IconHeating(props: IconProps) {
  return (
    <svg viewBox="0 0 15 15" fill="none" aria-hidden className="size-[15px]" {...props}>
      <path d="M7.5 2v8M5 12h5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
      <circle cx="7.5" cy="7" r="4" stroke="currentColor" strokeWidth="1.2" />
    </svg>
  );
}

export function IconReports(props: IconProps) {
  return (
    <svg viewBox="0 0 15 15" fill="none" aria-hidden className="size-[15px]" {...props}>
      <rect x="2" y="2" width="11" height="11" rx="1" stroke="currentColor" strokeWidth="1.2" />
      <path d="M5 10V7M7.5 10V5M10 10V8" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}

export function IconBell(props: IconProps) {
  return (
    <svg viewBox="0 0 16 20" fill="none" aria-hidden className="h-5 w-4" {...props}>
      <path d="M8 2a4 4 0 014 4v3l2 3H2l2-3V6a4 4 0 014-4z" stroke="currentColor" strokeWidth="1.2" />
      <path d="M6 18h4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}

export function IconSettings(props: IconProps) {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden className="size-5" {...props}>
      <circle cx="10" cy="10" r="3" stroke="currentColor" strokeWidth="1.2" />
      <path
        d="M10 2v2M10 16v2M2 10h2M16 10h2M4.9 4.9l1.4 1.4M13.7 13.7l1.4 1.4M4.9 15.1l1.4-1.4M13.7 6.3l1.4-1.4"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function IconHelp(props: IconProps) {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden className="size-5" {...props}>
      <circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="1.2" />
      <path
        d="M8 8a2 2 0 114 0c0 2-2 2-2 3"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
      <circle cx="10" cy="15" r="0.8" fill="currentColor" />
    </svg>
  );
}

export function IconLogo(props: IconProps) {
  return (
    <svg viewBox="0 0 20 14" fill="none" aria-hidden className="h-[13px] w-[18px]" {...props}>
      <path
        d="M10 2c-3 0-5 2-5 4.5S7 11 10 11s5-2 5-4.5S13 2 10 2z"
        stroke="currentColor"
        strokeWidth="1.2"
      />
      <path d="M4 12h12" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}
