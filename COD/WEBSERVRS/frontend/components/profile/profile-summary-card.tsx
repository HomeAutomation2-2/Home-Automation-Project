import { formatProfileMemberSince } from "@/lib/profile/format-profile-date";
import type { UserMe } from "@/lib/types/user-me";

type ProfileSummaryCardProps = {
  user: UserMe;
};

function ProfileStatusPill({ suspended }: { suspended: boolean }) {
  if (suspended) {
    return (
      <span className="inline-flex items-center gap-1 rounded bg-[rgba(180,35,24,0.08)] px-2 py-1">
        <span className="size-2 rounded-full bg-[#b42318]" aria-hidden />
        <span className="text-[13px] font-semibold text-[#b42318]">Suspendat</span>
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1 rounded bg-[rgba(219,225,255,0.2)] px-2 py-1">
      <span className="size-2 rounded-full bg-[#004ac6]" aria-hidden />
      <span className="text-[13px] font-semibold text-[#004ac6]">Activ</span>
    </span>
  );
}

export function ProfileSummaryCard({ user }: ProfileSummaryCardProps) {
  const initials = `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase();
  const roleLabel = user.isAdmin ? "Administrator sistem" : "Utilizator";
  const memberSince = formatProfileMemberSince(user.createdAt);

  return (
    <aside className="flex flex-col items-center rounded border border-[#c3c6d7] bg-white p-4 pt-4 sm:p-6">
      <div className="relative">
        <div className="flex size-24 items-center justify-center rounded-xl border-2 border-[#e7e7f3] bg-[#faf8ff] text-2xl font-semibold text-[#004ac6]">
          {initials}
        </div>
      </div>

      <h2 className="mt-4 text-center text-lg font-semibold leading-7 text-[#191b23]">
        {user.firstName} {user.lastName}
      </h2>
      <p className="mt-1 text-center text-[13px] text-[#555f6d]">{roleLabel}</p>

      <div className="mt-4 w-full border-t border-[#c3c6d7] pt-4">
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs font-semibold uppercase tracking-[0.6px] text-[#555f6d]">
            Stare cont
          </span>
          <ProfileStatusPill suspended={user.isSuspended} />
        </div>
      </div>

      <div className="mt-3 flex w-full items-center justify-between gap-2">
        <span className="text-xs font-semibold uppercase tracking-[0.6px] text-[#555f6d]">
          Membru din
        </span>
        <span className="text-[13px] text-[#434655]">{memberSince}</span>
      </div>
    </aside>
  );
}
