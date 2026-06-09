type ErrorBannerProps = {
  message: string;
};

export function ErrorBanner({ message }: ErrorBannerProps) {
  if (!message) return null;

  return (
    <div
      role="alert"
      className="rounded-xl border border-[var(--ha-red-border)] bg-[var(--ha-red-bg)] px-4 py-3 text-sm text-[var(--ha-red-text)]"
    >
      {message}
    </div>
  );
}
