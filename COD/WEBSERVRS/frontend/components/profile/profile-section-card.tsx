import type { ReactNode } from "react";

type ProfileSectionCardProps = {
  title: string;
  children: ReactNode;
};

export function ProfileSectionCard({ title, children }: ProfileSectionCardProps) {
  return (
    <section className="rounded border border-[#c3c6d7] bg-white">
      <header className="border-b border-[#c3c6d7] px-4 py-2">
        <h2 className="text-lg font-semibold leading-7 text-[#191b23]">{title}</h2>
      </header>
      <div className="p-4">{children}</div>
    </section>
  );
}
