import type { ReactNode } from "react";

type InfoBannerProps = {
  title: string;
  message: ReactNode;
  variant?: "info" | "warning";
};

export function InfoBanner({ title, message, variant = "info" }: InfoBannerProps) {
  const styles =
    variant === "warning"
      ? "border-amber-200 bg-amber-50 text-amber-900"
      : "border-[#c3c6d7] bg-[#faf8ff] text-[#434655]";

  return (
    <div className={`rounded-lg border px-4 py-3 text-sm ${styles}`} role="status">
      <p className="font-semibold text-[#191b23]">{title}</p>
      <div className="mt-1 leading-relaxed">{message}</div>
    </div>
  );
}
