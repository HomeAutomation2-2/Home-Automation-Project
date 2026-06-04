"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { ErrorBanner } from "@/components/ui/ErrorBanner";
import { PageHeader } from "@/components/admin/page-header";
import { StatusBadge } from "@/components/admin/status-badge";
import { useAuth } from "@/hooks/useAuth";

function ProfileField({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between border-t border-[#c3c6d7] py-3 first:border-t-0">
      <span className="text-[13px] text-[#555f6d]">{label}</span>
      <span className="text-[13px] font-semibold text-[#191b23]">{value}</span>
    </div>
  );
}

export function ProfilePageContent() {
  const { user, isLoading, error, logout, refreshProfile } = useAuth();
  const [confirmLogout, setConfirmLogout] = useState(false);

  if (isLoading) {
    return <p className="text-sm text-[#555f6d]">Se încarcă profilul…</p>;
  }

  const initials = user
    ? `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase()
    : "?";

  async function handleLogout() {
    if (!confirmLogout) {
      setConfirmLogout(true);
      return;
    }
    await logout();
  }

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader
        title="Profil utilizator"
        subtitle="Datele contului tău și sesiunea curentă."
        crumbs={[{ label: "Profil" }]}
      />

      {error && <ErrorBanner message={error} />}

      {user ? (
        <div className="grid gap-6 md:grid-cols-[240px_1fr]">
          <div className="flex flex-col items-center rounded-lg border border-[#c3c6d7] bg-[#faf8ff] p-6">
            <div className="flex size-24 items-center justify-center rounded-xl border-2 border-[#e1e2ed] bg-white text-2xl font-semibold text-[#004ac6]">
              {initials}
            </div>
            <p className="mt-4 text-lg font-semibold text-[#191b23]">
              {user.firstName} {user.lastName}
            </p>
            <p className="mt-1 text-[13px] text-[#555f6d]">{user.phone}</p>
            <div className="mt-4">
              <StatusBadge active={!user.isSuspended} suspended={user.isSuspended} />
            </div>
          </div>

          <div className="rounded-lg border border-[#c3c6d7] bg-[#faf8ff] p-6">
            <h2 className="text-xs font-semibold uppercase tracking-wide text-[#555f6d]">
              Informații cont
            </h2>
            <div className="mt-4">
              <ProfileField
                label="Rol"
                value={user.isAdmin ? "Administrator" : "Utilizator"}
              />
              <ProfileField label="Telefon" value={user.phone} />
              <ProfileField label="CNP" value={user.cnp} />
              <ProfileField label="Prezență acasă" value={user.isHome ? "Da" : "Nu"} />
              <ProfileField
                label="Cont suspendat"
                value={user.isSuspended ? "Da" : "Nu"}
              />
            </div>

            <p className="mt-6 text-xs text-[#737686]">
              Token-ul de sesiune nu este afișat din motive de securitate.
            </p>
          </div>
        </div>
      ) : (
        <p className="text-sm text-[#555f6d]">Profil indisponibil.</p>
      )}

      <div className="mt-8 flex flex-wrap justify-end gap-3">
        <Button type="button" variant="secondary" onClick={() => void refreshProfile()}>
          Reîncarcă datele
        </Button>
        {confirmLogout ? (
          <>
            <Button type="button" variant="secondary" onClick={() => setConfirmLogout(false)}>
              Anulează
            </Button>
            <Button type="button" variant="danger" onClick={() => void handleLogout()}>
              Confirmă deconectarea
            </Button>
          </>
        ) : (
          <Button type="button" variant="danger" onClick={() => void handleLogout()}>
            Deconectare
          </Button>
        )}
      </div>
      {confirmLogout && (
        <p className="mt-2 text-right text-xs text-[#555f6d]">
          Apasă din nou pentru a confirma deconectarea.
        </p>
      )}
    </div>
  );
}
