"use client";

import { useState } from "react";
import { ProfilePersonalSection } from "@/components/profile/profile-personal-section";
import { ProfileSectionCard } from "@/components/profile/profile-section-card";
import { ProfileSummaryCard } from "@/components/profile/profile-summary-card";
import { ErrorBanner } from "@/components/ui/ErrorBanner";
import { useAuth } from "@/hooks/useAuth";

export function ProfilePageContent() {
  const { user, isLoading, error, logout, refreshProfile } = useAuth();
  const [confirmLogout, setConfirmLogout] = useState(false);

  async function handleLogout() {
    if (!confirmLogout) {
      setConfirmLogout(true);
      return;
    }
    await logout();
  }

  if (isLoading) {
    return (
      <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-6">
        <div className="h-8 w-48 animate-pulse rounded bg-[#e8e9f0]" aria-hidden />
        <div className="grid gap-6 lg:grid-cols-12">
          <div className="h-[269px] animate-pulse rounded bg-[#e8e9f0] lg:col-span-4" />
          <div className="h-[320px] animate-pulse rounded bg-[#e8e9f0] lg:col-span-8" />
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-[-0.24px] text-[#191b23]">
          Profil utilizator
        </h1>
      </header>

      {error && <ErrorBanner message={error} />}

      {user ? (
        <div className="grid gap-6 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <ProfileSummaryCard user={user} />
          </div>

          <div className="flex flex-col gap-6 lg:col-span-8">
            <ProfilePersonalSection
              user={user}
              onSaved={refreshProfile}
            />

            <ProfileSectionCard title="Cont și sesiune">
              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm font-semibold text-[#191b23]">Prezență acasă</p>
                    <p className="text-[13px] text-[#555f6d]">
                      Stare raportată de sistemul de acces.
                    </p>
                  </div>
                  <span className="text-[13px] font-semibold text-[#434655]">
                    {user.isHome ? "Acasă" : "Plecat"}
                  </span>
                </div>

                <div className="h-px bg-[#c3c6d7]" />

                <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm font-semibold text-[#191b23]">Deconectare</p>
                    <p className="text-[13px] text-[#555f6d]">
                      Încheie sesiunea curentă pe acest dispozitiv.
                    </p>
                  </div>
                  {confirmLogout ? (
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => setConfirmLogout(false)}
                        className="rounded border border-[#c3c6d7] bg-[#faf8ff] px-[25px] py-[9px] text-xs font-semibold uppercase tracking-[0.6px] text-[#191b23] hover:bg-white"
                      >
                        Anulează
                      </button>
                      <button
                        type="button"
                        onClick={() => void handleLogout()}
                        className="rounded bg-[#b42318] px-6 py-[9px] text-xs font-semibold uppercase tracking-[0.6px] text-white shadow-[0px_1px_1px_rgba(0,0,0,0.05)] hover:bg-[#912018]"
                      >
                        Confirmă
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => void handleLogout()}
                      className="rounded border border-[#c3c6d7] bg-[#faf8ff] px-[25px] py-[9px] text-xs font-semibold uppercase tracking-[0.6px] text-[#191b23] hover:bg-white"
                    >
                      Deconectare
                    </button>
                  )}
                </div>

                {confirmLogout && (
                  <p className="text-xs text-[#555f6d]">
                    Confirmă pentru a te redirecționa la pagina de autentificare.
                  </p>
                )}
              </div>
            </ProfileSectionCard>
          </div>
        </div>
      ) : (
        <p className="text-sm text-[#555f6d]">Profil indisponibil.</p>
      )}
    </div>
  );
}
