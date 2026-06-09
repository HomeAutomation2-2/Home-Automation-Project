/** Iconițe inline — echivalent Figma (phone, lock, eye-off, shield, alert) */

export function PhoneIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      className={className}
      width="13"
      height="18"
      viewBox="0 0 13 18"
      fill="none"
      aria-hidden
    >
      <path
        d="M2.5 1h8a1.5 1.5 0 0 1 1.5 1.5v13a1.5 1.5 0 0 1-1.5 1.5h-8A1.5 1.5 0 0 1 1 15.5v-13A1.5 1.5 0 0 1 2.5 1Z"
        stroke="#737686"
        strokeWidth="1.2"
      />
      <path d="M5.5 14h2" stroke="#737686" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}

export function LockIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      className={className}
      width="14"
      height="18"
      viewBox="0 0 14 18"
      fill="none"
      aria-hidden
    >
      <rect
        x="2"
        y="8"
        width="10"
        height="9"
        rx="1.5"
        stroke="#737686"
        strokeWidth="1.2"
      />
      <path
        d="M4.5 8V5.5a2.5 2.5 0 0 1 5 0V8"
        stroke="#737686"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function EyeOffIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      className={className}
      width="18"
      height="17"
      viewBox="0 0 18 17"
      fill="none"
      aria-hidden
    >
      <path
        d="M1 8.5s3-5.5 8-5.5 8 5.5 8 5.5-3 5.5-8 5.5S1 8.5 1 8.5Z"
        stroke="#737686"
        strokeWidth="1.2"
      />
      <circle cx="9" cy="8.5" r="2.5" stroke="#737686" strokeWidth="1.2" />
      <path d="M2 2l14 13" stroke="#737686" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}

export function EyeIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      className={className}
      width="18"
      height="17"
      viewBox="0 0 18 17"
      fill="none"
      aria-hidden
    >
      <path
        d="M1 8.5s3-5.5 8-5.5 8 5.5 8 5.5-3 5.5-8 5.5S1 8.5 1 8.5Z"
        stroke="#737686"
        strokeWidth="1.2"
      />
      <circle cx="9" cy="8.5" r="2.5" stroke="#737686" strokeWidth="1.2" />
    </svg>
  );
}

export function ShieldIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      className={className}
      width="11"
      height="13"
      viewBox="0 0 11 13"
      fill="none"
      aria-hidden
    >
      <path
        d="M5.5 1 1 3v4c0 2.8 1.9 5.4 4.5 6 2.6-.6 4.5-3.2 4.5-6V3L5.5 1Z"
        stroke="#555f6d"
        strokeWidth="1.1"
        strokeLinejoin="round"
      />
      <path
        d="M3.5 6.5 5 8l2.5-3"
        stroke="#555f6d"
        strokeWidth="1.1"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function AlertIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      className={className}
      width="17"
      height="17"
      viewBox="0 0 17 17"
      fill="none"
      aria-hidden
    >
      <circle cx="8.5" cy="8.5" r="7" stroke="#ba1a1a" strokeWidth="1.2" />
      <path d="M8.5 5v4" stroke="#ba1a1a" strokeWidth="1.2" strokeLinecap="round" />
      <circle cx="8.5" cy="11.5" r="0.75" fill="#ba1a1a" />
    </svg>
  );
}
