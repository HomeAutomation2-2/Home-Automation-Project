import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

export function IconHeatingSchedule(props: IconProps) {
  return (
    <svg viewBox="0 0 12 12" fill="none" aria-hidden className="size-3" {...props}>
      <rect x="1.5" y="2" width="9" height="8" rx="1" stroke="currentColor" strokeWidth="1.1" />
      <path d="M1.5 4.5h9" stroke="currentColor" strokeWidth="1.1" />
      <path d="M4 1v2M8 1v2" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" />
    </svg>
  );
}

export function IconHeatingManual(props: IconProps) {
  return (
    <svg viewBox="0 0 12 12" fill="none" aria-hidden className="size-3" {...props}>
      <circle cx="6" cy="3" r="1.5" stroke="currentColor" strokeWidth="1.1" />
      <path d="M3.5 10.5l2.5-4 2.5 4" stroke="currentColor" strokeWidth="1.1" strokeLinejoin="round" />
    </svg>
  );
}

export function IconHeatingActive(props: IconProps) {
  return (
    <svg viewBox="0 0 11 13" fill="none" aria-hidden className="h-3 w-[11px]" {...props}>
      <path
        d="M5.5 1c0 3-2.5 4-2.5 7a2.5 2.5 0 105 0c0-3-2.5-4-2.5-7z"
        fill="currentColor"
      />
    </svg>
  );
}

export function IconHeatingIdle(props: IconProps) {
  return (
    <svg viewBox="0 0 11 13" fill="none" aria-hidden className="h-3 w-[11px]" {...props}>
      <path
        d="M5.5 1c0 3-2.5 4-2.5 7a2.5 2.5 0 105 0c0-3-2.5-4-2.5-7z"
        stroke="currentColor"
        strokeWidth="1.1"
      />
    </svg>
  );
}

export function IconHeatingMenu(props: IconProps) {
  return (
    <svg viewBox="0 0 4 14" fill="none" aria-hidden className="h-[13px] w-1" {...props}>
      <circle cx="2" cy="2" r="1.2" fill="currentColor" />
      <circle cx="2" cy="7" r="1.2" fill="currentColor" />
      <circle cx="2" cy="12" r="1.2" fill="currentColor" />
    </svg>
  );
}

export function IconHeatingSystem(props: IconProps) {
  return (
    <svg viewBox="0 0 21 21" fill="none" aria-hidden className="size-[21px]" {...props}>
      <circle cx="10.5" cy="10.5" r="7.5" stroke="currentColor" strokeWidth="1.4" />
      <path d="M10.5 6v5l3 2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}
