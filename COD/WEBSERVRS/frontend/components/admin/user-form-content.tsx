"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import { AdminGuard } from "@/components/admin/admin-guard";
import { PageHeader } from "@/components/admin/page-header";
import { RoleBadge } from "@/components/admin/role-badge";
import { StatusBadge } from "@/components/admin/status-badge";
import { FigmaField } from "@/components/login/figma-field";
import { Button } from "@/components/ui/Button";
import { ErrorBanner } from "@/components/ui/ErrorBanner";
import { getApiClient } from "@/lib/auth";
import { ApiError } from "@/lib/types/api";
import type { AdminUserDetail, CreateUserRequest, UpdateUserRequest } from "@/lib/types/admin-user";

type UserFormContentProps = {
  mode: "create" | "edit";
  userId?: number;
};

type FieldErrors = Partial<
  Record<keyof CreateUserRequest | keyof UpdateUserRequest | "form", string>
>;

function isNumericString(value: string): boolean {
  return /^\d+$/.test(value);
}

export function UserFormContent({ mode, userId }: UserFormContentProps) {
  const router = useRouter();
  const isCreate = mode === "create";

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [cnp, setCnp] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [isAdminRole, setIsAdminRole] = useState(false);
  const [detail, setDetail] = useState<AdminUserDetail | null>(null);
  const [loading, setLoading] = useState(!isCreate);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [bannerError, setBannerError] = useState<string | null>(null);

  useEffect(() => {
    if (isCreate || userId === undefined || Number.isNaN(userId)) return;

    const id = userId;
    let cancelled = false;
    async function load() {
      setLoading(true);
      try {
        const data = await getApiClient().getUserById(id);
        if (!cancelled) {
          setDetail(data);
          setFirstName(data.first_name);
          setLastName(data.last_name);
          setCnp(data.cnp);
          setPhone(data.phone);
          setIsAdminRole(data.is_admin);
        }
      } catch (err) {
        if (!cancelled) {
          setBannerError(
            err instanceof ApiError ? err.message : "Nu s-au putut încărca datele utilizatorului.",
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, [isCreate, userId]);

  function validate(): boolean {
    const next: FieldErrors = {};
    if (!firstName.trim()) next.firstName = "Prenumele este obligatoriu.";
    if (!lastName.trim()) next.lastName = "Numele este obligatoriu.";
    if (isCreate) {
      if (cnp.length !== 13) next.cnp = "CNP-ul trebuie să aibă exact 13 cifre.";
      else if (!isNumericString(cnp)) next.cnp = "CNP-ul trebuie să conțină doar cifre.";
      if (phone.length < 10) next.phone = "Telefonul trebuie să aibă cel puțin 10 caractere.";
      if (password.length < 6) next.password_plaintext = "Parola trebuie să aibă minim 6 caractere.";
    } else {
      if (phone.length < 10) next.phone = "Telefonul trebuie să aibă cel puțin 10 caractere.";
      if (password.length > 0 && password.length < 6) {
        next.password_plaintext = "Parola nouă trebuie să aibă minim 6 caractere.";
      }
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setBannerError(null);
    if (!validate()) return;

    setSubmitting(true);

    try {
      if (isCreate) {
        const body: CreateUserRequest = {
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          cnp: cnp.trim(),
          phone: phone.trim(),
          password_plaintext: password,
          isAdmin: isAdminRole,
        };
        await getApiClient().registerUser(body);
      } else if (userId !== undefined) {
        const body: UpdateUserRequest = {
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          phone: phone.trim(),
          isAdmin: isAdminRole,
        };
        if (password.length >= 6) {
          body.password_plaintext = password;
        }
        await getApiClient().updateUser(userId, body);
      }
      router.push("/admin/users");
    } catch (err) {
      if (err instanceof ApiError && err.status === 409) {
        setErrors({
          phone: "Există deja un utilizator cu acest telefon.",
        });
      } else {
        setBannerError(
          err instanceof ApiError
            ? err.message
            : isCreate
              ? "Eroare la crearea utilizatorului."
              : "Eroare la salvarea modificărilor.",
        );
      }
    } finally {
      setSubmitting(false);
    }
  }

  if (!isCreate && (userId === undefined || Number.isNaN(userId))) {
    return (
      <AdminGuard>
        <PageHeader title="Editare utilizator" crumbs={[{ label: "Utilizatori", href: "/admin/users" }]} />
        <ErrorBanner message="Adresa paginii nu este validă." />
        <Link href="/admin/users" className="mt-4 inline-block text-sm font-medium text-[#004ac6] hover:underline">
          Înapoi la listă
        </Link>
      </AdminGuard>
    );
  }

  if (loading) {
    return (
      <AdminGuard>
        <p className="text-sm text-[#555f6d]">Se încarcă formularul…</p>
      </AdminGuard>
    );
  }

  return (
    <AdminGuard>
      <PageHeader
        title={isCreate ? "Creare utilizator" : "Editare utilizator"}
        subtitle={
          !isCreate && detail
            ? `${detail.first_name} ${detail.last_name} · ${detail.phone}`
            : undefined
        }
        crumbs={[
          { label: "Utilizatori", href: "/admin/users" },
          { label: isCreate ? "Utilizator nou" : `${firstName} ${lastName}`.trim() || "Editare" },
        ]}
      />

      {bannerError && <ErrorBanner message={bannerError} />}

      <form onSubmit={handleSubmit} className="mx-auto max-w-3xl space-y-6">
        <section className="rounded-lg border border-[#c3c6d7] bg-[#faf8ff] p-6">
          <h2 className="text-lg font-semibold text-[#191b23]">Informații de bază</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <FigmaField
              label="Prenume"
              name="firstName"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              error={errors.firstName}
              required
            />
            <FigmaField
              label="Nume"
              name="lastName"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              error={errors.lastName}
              required
            />
            <div className="sm:col-span-2">
              <FigmaField
                label="Telefon"
                name="phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                error={errors.phone}
                required
              />
            </div>
          </div>
        </section>

        <section className="rounded-lg border border-[#c3c6d7] bg-[#faf8ff] p-6">
          <h2 className="text-lg font-semibold text-[#191b23]">Identificare</h2>
          <p className="mt-1 text-[13px] text-[#555f6d]">
            CNP-ul nu poate fi modificat după crearea contului.
          </p>
          <div className="mt-4">
            <FigmaField
              label="CNP"
              name="cnp"
              value={cnp}
              onChange={(e) => setCnp(e.target.value)}
              error={errors.cnp}
              disabled={!isCreate}
              maxLength={13}
              required={isCreate}
            />
          </div>
        </section>

        <section className="rounded-lg border border-[#c3c6d7] bg-[#faf8ff] p-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <h2 className="text-lg font-semibold text-[#191b23]">Control acces</h2>
            {detail && (
              <div className="flex flex-wrap items-center gap-2">
                <StatusBadge
                  active={!detail.is_suspended}
                  suspended={detail.is_suspended}
                />
              </div>
            )}
          </div>
          <div className="mt-4 space-y-4">
            <label className="flex items-center gap-3 text-sm text-[#191b23]">
              <input
                type="checkbox"
                checked={isAdminRole}
                onChange={(e) => setIsAdminRole(e.target.checked)}
                className="size-4 rounded border-[#c3c6d7]"
              />
              Rol administrator
              {!isCreate && <RoleBadge isAdmin={isAdminRole} />}
            </label>
            <FigmaField
              label={isCreate ? "Parolă inițială" : "Parolă nouă (opțional)"}
              name="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              error={errors.password_plaintext}
              required={isCreate}
              minLength={isCreate ? 6 : undefined}
              autoComplete="new-password"
            />
            {!isCreate && (
              <p className="text-xs text-[#555f6d]">
                Lasă gol pentru a păstra parola curentă. Pentru suspendare folosește lista
                utilizatorilor.
              </p>
            )}
          </div>
        </section>

        {!isCreate && userId !== undefined && (
          <div className="flex gap-3">
            <Link href={`/admin/users/${userId}/device`}>
              <Button type="button" variant="secondary">
                Asociere telefon
              </Button>
            </Link>
          </div>
        )}

        <div className="flex justify-end gap-3">
          <Link href="/admin/users">
            <Button type="button" variant="secondary">
              Anulează
            </Button>
          </Link>
          <Button
            type="submit"
            disabled={submitting}
            className="!bg-[#004ac6] !text-white hover:!opacity-90"
          >
            {submitting
              ? "Se salvează…"
              : isCreate
                ? "Salvează utilizatorul"
                : "Salvează modificările"}
          </Button>
        </div>
      </form>
    </AdminGuard>
  );
}
