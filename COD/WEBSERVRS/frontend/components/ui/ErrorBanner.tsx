type ErrorBannerProps = {
  message: string;
};

export function ErrorBanner({ message }: ErrorBannerProps) {
  if (!message) return null;

  return (
    <div
      role="alert"
      className="rounded-xl border border-ha-red-border bg-ha-red-bg px-4 py-3 text-sm text-ha-red"
    >
      {message}
    </div>
  );
}
