import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Conectare — BlueLock",
};

export default function LoginLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-full bg-[#faf8ff]">{children}</div>
  );
}
