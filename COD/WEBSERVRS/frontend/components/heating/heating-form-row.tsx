import type { ReactNode } from "react";

type HeatingFormRowProps = {
  label: string;
  children: ReactNode;
};

/** Rând formular stil Figma 102:4615 — etichetă stânga, control dreapta */
export function HeatingFormRow({ label, children }: HeatingFormRowProps) {
  return (
    <>
      <div className="grid grid-cols-1 gap-4 border-t border-[#c3c6d7] pt-6 first:border-t-0 first:pt-0 md:grid-cols-12 md:items-center">
        <div className="md:col-span-4">
          <p className="text-xs font-semibold uppercase tracking-[0.6px] text-[#434655]">
            {label}
          </p>
        </div>
        <div className="md:col-span-8">{children}</div>
      </div>
    </>
  );
}
