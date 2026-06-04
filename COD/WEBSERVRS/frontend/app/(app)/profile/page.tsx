"use client";

import { Button } from "@/components/ui/Button";
import { ErrorBanner } from "@/components/ui/ErrorBanner";
import { useAuth } from "@/hooks/useAuth";

export default function ProfilePage() {
  const { user, isLoading, error, logout, refreshProfile } = useAuth();

  if (isLoading) {
    return <p className="text-sm text-zinc-600">Se încarcă profilul…</p>;
  }

  return (
    <div className="max-w-lg space-y-4">
      <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">Profil</h1>
      {error && <ErrorBanner message={error} />}
      {user ? (
        <dl className="space-y-2 rounded-lg border border-zinc-200 p-4 text-sm dark:border-zinc-800">
          <div>
            <dt className="text-zinc-500">Nume</dt>
            <dd className="font-medium">
              {user.firstName} {user.lastName}
            </dd>
          </div>
          <div>
            <dt className="text-zinc-500">Telefon</dt>
            <dd className="font-medium">{user.phone}</dd>
          </div>
          <div>
            <dt className="text-zinc-500">CNP</dt>
            <dd className="font-medium font-mono text-xs">{user.cnp}</dd>
          </div>
          <div>
            <dt className="text-zinc-500">Rol</dt>
            <dd className="font-medium">{user.isAdmin ? "Administrator" : "Utilizator"}</dd>
          </div>
          <div>
            <dt className="text-zinc-500">Acasă</dt>
            <dd className="font-medium">{user.isHome ? "Da" : "Nu"}</dd>
          </div>
          <div>
            <dt className="text-zinc-500">Cont suspendat</dt>
            <dd className="font-medium">{user.isSuspended ? "Da" : "Nu"}</dd>
          </div>
        </dl>
      ) : (
        <p className="text-sm text-zinc-600">Profil indisponibil.</p>
      )}
      <div className="flex flex-wrap gap-2">
        <Button type="button" variant="secondary" onClick={() => void refreshProfile()}>
          Reîncarcă
        </Button>
        <Button type="button" variant="danger" onClick={() => void logout()}>
          Deconectare
        </Button>
      </div>
    </div>
  );
}
