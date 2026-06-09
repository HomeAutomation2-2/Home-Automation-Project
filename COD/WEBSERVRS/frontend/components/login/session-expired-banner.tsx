import { AlertIcon } from "@/components/login/login-icons";

type SessionExpiredBannerProps = {
  title?: string;
  description?: string;
};

/** Figma node 102:56 — alert sesiune expirată / eroare auth */
export function SessionExpiredBanner({
  title = "Sesiune expirată",
  description = "Autentifică-te din nou.",
}: SessionExpiredBannerProps) {
  return (
    <div
      role="alert"
      className="flex w-full gap-2 rounded-[2px] border border-[rgba(186,26,26,0.3)] bg-[rgba(255,218,214,0.2)] p-[17px]"
    >
      <AlertIcon className="mt-0.5 shrink-0" />
      <div className="flex min-w-0 flex-col gap-0.5">
        <p className="text-[13px] font-semibold leading-[18px] text-[#ba1a1a]">
          {title}
        </p>
        <p className="text-[13px] leading-[18px] text-[rgba(186,26,26,0.8)]">
          {description}
        </p>
      </div>
    </div>
  );
}
