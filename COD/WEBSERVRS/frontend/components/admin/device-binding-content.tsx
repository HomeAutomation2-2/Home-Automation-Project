"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { AdminGuard } from "@/components/admin/admin-guard";
import { InfoBanner } from "@/components/admin/info-banner";
import { PageHeader } from "@/components/admin/page-header";
import { RoleBadge } from "@/components/admin/role-badge";
import { StatusBadge } from "@/components/admin/status-badge";
import { Button } from "@/components/ui/Button";
import { ErrorBanner } from "@/components/ui/ErrorBanner";
import { getApiClient } from "@/lib/auth";
import { ApiError } from "@/lib/types/api";
import type { AdminUserDetail, DeviceBindingStatus, InitiateDeviceBindingResponse } from "@/lib/types/admin-user";

function formatSyncDate(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("ro-RO", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function UserDetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 border-b border-[#e8e9f0] py-2.5 last:border-0">
      <dt className="text-[13px] text-[#555f6d]">{label}</dt>
      <dd className="text-right text-[13px] font-medium text-[#191b23]">{value}</dd>
    </div>
  );
}

export function DeviceBindingContent() {
  const params = useParams();
  const userId = Number(params.id);

  const [user, setUser] = useState<AdminUserDetail | null>(null);
  const [binding, setBinding] = useState<DeviceBindingStatus | null>(null);
  const [pairing, setPairing] = useState<InitiateDeviceBindingResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copyOk, setCopyOk] = useState(false);

  const loadAll = useCallback(async () => {
    if (Number.isNaN(userId)) {
      setError("Nu am găsit utilizatorul.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const client = getApiClient();
      const [userData, bindingData] = await Promise.all([
        client.getUserById(userId),
        client.getDeviceBinding(userId),
      ]);
      setUser(userData);
      setBinding(bindingData);
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "Datele nu s-au încărcat. Încearcă din nou.",
      );
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    void loadAll();
  }, [loadAll]);

  async function handleInitiate() {
    if (binding?.bound) {
      const ok = window.confirm(
        "Telefonul este deja asociat. Codul nou îl înlocuiește pe cel vechi.\n\nContinui?",
      );
      if (!ok) return;
    }

    setBusy(true);
    setError(null);
    setPairing(null);
    try {
      const result = await getApiClient().initiateDeviceBinding(userId);
      setPairing(result);
      await loadAll();
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "Codul nu a putut fi generat.",
      );
    } finally {
      setBusy(false);
    }
  }

  async function handleRevoke() {
    if (
      !window.confirm(
        "Telefonul nu va mai avea acces la sistem până la o nouă asociere.\n\nContinui?",
      )
    ) {
      return;
    }

    setBusy(true);
    setError(null);
    setPairing(null);
    try {
      await getApiClient().revokeDeviceBinding(userId);
      await loadAll();
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "Dezasocierea nu a reușit.",
      );
    } finally {
      setBusy(false);
    }
  }

  async function handleCopyToken() {
    if (!pairing) return;
    try {
      await navigator.clipboard.writeText(pairing.pairing_token);
      setCopyOk(true);
      setTimeout(() => setCopyOk(false), 2000);
    } catch {
      setError("Copierea a eșuat. Selectează codul manual.");
    }
  }

  const fullName = user ? `${user.first_name} ${user.last_name}` : "";
  const bound = binding?.bound ?? false;

  return (
    <AdminGuard>
      <PageHeader
        title="Asociere telefon"
        subtitle={user ? fullName : undefined}
        crumbs={[
          { label: "Utilizatori", href: "/admin/users" },
          {
            label: fullName || "Utilizator",
            href: user ? `/admin/users/${userId}` : undefined,
          },
          { label: "Asociere telefon" },
        ]}
      />

      {error && <ErrorBanner message={error} />}
      {loading && <p className="text-sm text-[#555f6d]">Se încarcă…</p>}

      {pairing && (
        <InfoBanner
          variant="warning"
          title="Cod de asociere"
          message={
            <span className="block space-y-3">
              <span className="block text-[#434655]">
                Valabil până la <strong>{formatSyncDate(pairing.expires_at)}</strong>. Copiază
                codul și introdu-l în aplicația mobilă, la setările de asociere. Dacă părăsești
                pagina, codul nu mai apare aici — generează altul.
              </span>
              <code className="block break-all rounded border border-[#e1e2ed] bg-white px-3 py-2 font-mono text-sm tracking-wide text-[#191b23]">
                {pairing.pairing_token}
              </code>
              <Button
                type="button"
                variant="secondary"
                className="!py-1.5 !text-xs"
                onClick={() => void handleCopyToken()}
              >
                {copyOk ? "Copiat" : "Copiază codul"}
              </Button>
            </span>
          }
        />
      )}

      {user && !loading && binding && (
        <div className="grid gap-6 lg:grid-cols-3">
          <aside className="rounded-lg border border-[#c3c6d7] bg-white lg:col-span-1">
            <div className="border-b border-[#c3c6d7] bg-[#faf8ff] px-5 py-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-[#555f6d]">
                Utilizator
              </p>
              <p className="mt-1 text-lg font-semibold text-[#191b23]">{fullName}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <RoleBadge isAdmin={user.is_admin} />
                <StatusBadge
                  active={!user.is_suspended}
                  suspended={user.is_suspended}
                />
              </div>
            </div>
            <dl className="px-5 py-2">
              <UserDetailRow label="Telefon" value={user.phone} />
              <UserDetailRow label="CNP" value={user.cnp} />
            </dl>
          </aside>

          <div className="space-y-6 lg:col-span-2">
            <section className="rounded-lg border border-[#c3c6d7] bg-white p-6">
              <h2 className="text-base font-semibold text-[#191b23]">Telefon asociat</h2>
              <div className="mt-4 flex flex-col gap-4 rounded-md border border-[#e8e9f0] bg-[#faf8ff] p-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-medium text-[#191b23]">
                    {bound
                      ? (binding.device_label ?? "Telefon legat de cont")
                      : "Niciun telefon legat"}
                  </p>
                  <p className="mt-0.5 text-[13px] text-[#555f6d]">
                    {bound
                      ? `Ultima activitate: ${formatSyncDate(binding.last_sync)}`
                      : "Generează un cod și finalizează asocierea din aplicația de pe telefon."}
                  </p>
                </div>
                <span
                  className={`inline-flex shrink-0 items-center gap-2 rounded-full px-3 py-1 text-xs font-medium ${
                    bound
                      ? "bg-[rgba(37,99,235,0.12)] text-[#004ac6]"
                      : "bg-zinc-100 text-zinc-600"
                  }`}
                >
                  <span
                    className={`size-1.5 rounded-full ${bound ? "bg-[#004ac6]" : "bg-zinc-400"}`}
                  />
                  {bound ? "Asociat" : "Neasociat"}
                </span>
              </div>
              <div className="mt-4 flex flex-wrap justify-end gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  disabled={!bound || busy}
                  onClick={() => void handleRevoke()}
                >
                  Dezasociază
                </Button>
                <Button
                  type="button"
                  disabled={busy}
                  className="!bg-[#004ac6] !text-white hover:!opacity-90"
                  onClick={() => void handleInitiate()}
                >
                  {bound ? "Cod nou" : "Generează cod"}
                </Button>
              </div>
            </section>

            <section className="rounded-lg border border-[#c3c6d7] bg-white p-6">
              <h2 className="text-base font-semibold text-[#191b23]">
                Pași pentru administrator
              </h2>
              <div className="mt-3 space-y-3 text-[13px] leading-relaxed text-[#434655]">
                <p>
                  <span className="font-medium text-[#191b23]">1.</span> Apasă «Generează cod»
                  și transmite codul utilizatorului (sau copiază-l tu, dacă configurezi telefonul
                  la fața locului).
                </p>
                <p>
                  <span className="font-medium text-[#191b23]">2.</span> În aplicația mobilă,
                  utilizatorul deschide asocierea dispozitivului și introduce codul. Codul
                  expiră după 15 minute — dacă nu a reușit, generează altul.
                </p>
                <p>
                  <span className="font-medium text-[#191b23]">3.</span> La schimbarea
                  telefonului sau la probleme de conectare, folosește «Dezasociază», apoi
                  repetă pașii de mai sus.
                </p>
              </div>
              <p className="mt-4 border-t border-[#e8e9f0] pt-4 text-xs text-[#737686]">
                Verifică identitatea utilizatorului după telefon și CNP înainte de a genera un
                cod nou.
              </p>
            </section>
          </div>
        </div>
      )}

      <div className="mt-6">
        <Link
          href={userId ? `/admin/users/${userId}` : "/admin/users"}
          className="text-sm font-medium text-[#004ac6] hover:underline"
        >
          Înapoi la fișa utilizatorului
        </Link>
      </div>
    </AdminGuard>
  );
}
