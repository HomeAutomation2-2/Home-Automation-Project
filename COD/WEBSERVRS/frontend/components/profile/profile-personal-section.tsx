"use client";

import { useEffect, useState } from "react";
import { ProfileReadonlyField } from "@/components/profile/profile-readonly-field";
import { ProfileSectionCard } from "@/components/profile/profile-section-card";
import { ErrorBanner } from "@/components/ui/ErrorBanner";
import { getApiClient } from "@/lib/auth";
import { ApiError } from "@/lib/types/api";
import type { UserMe } from "@/lib/types/user-me";

type ProfilePersonalSectionProps = {
  user: UserMe;
  onSaved: () => Promise<void>;
};

type FieldErrors = {
  firstName?: string;
  lastName?: string;
  phone?: string;
  password?: string;
};

function ProfileFieldInput({
  label,
  id,
  value,
  onChange,
  error,
  type = "text",
  placeholder,
}: {
  label: string;
  id: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  type?: string;
  placeholder?: string;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label
        htmlFor={id}
        className="text-xs font-semibold uppercase tracking-[0.6px] text-[#555f6d]"
      >
        {label}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        aria-invalid={error ? true : undefined}
        className={`rounded border bg-[#faf8ff] px-[9px] py-[5px] text-base leading-6 text-[#191b23] outline-none focus:border-[#004ac6] ${
          error ? "border-[#b42318]" : "border-[#c3c6d7]"
        }`}
      />
      {error && (
        <span className="text-xs text-[#b42318]" role="alert">
          {error}
        </span>
      )}
    </div>
  );
}

function buildDraft(user: UserMe) {
  return {
    firstName: user.firstName,
    lastName: user.lastName,
    phone: user.phone,
    password: "",
  };
}

export function ProfilePersonalSection({ user, onSaved }: ProfilePersonalSectionProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(() => buildDraft(user));
  const [errors, setErrors] = useState<FieldErrors>({});
  const [bannerError, setBannerError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!editing) {
      setDraft(buildDraft(user));
      setErrors({});
      setBannerError(null);
    }
  }, [user, editing]);

  function validate(): boolean {
    const next: FieldErrors = {};
    if (!draft.firstName.trim()) next.firstName = "Prenumele este obligatoriu.";
    if (!draft.lastName.trim()) next.lastName = "Numele este obligatoriu.";
    if (!draft.phone.trim()) next.phone = "Telefonul este obligatoriu.";
    if (draft.password.length > 0 && draft.password.length < 6) {
      next.password = "Parola trebuie să aibă cel puțin 6 caractere.";
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  function handleCancel() {
    setEditing(false);
    setDraft(buildDraft(user));
    setErrors({});
    setBannerError(null);
  }

  async function handleSave() {
    setBannerError(null);
    if (!validate()) return;

    setSaving(true);
    try {
      const body = {
        firstName: draft.firstName.trim(),
        lastName: draft.lastName.trim(),
        phone: draft.phone.trim(),
        ...(draft.password.length >= 6
          ? { password_plaintext: draft.password }
          : {}),
      };
      await getApiClient().updateMe(body);
      await onSaved();
      setEditing(false);
      setDraft((prev) => ({ ...prev, password: "" }));
    } catch (err) {
      if (err instanceof ApiError && err.status === 409) {
        setErrors({ phone: "Există deja un cont cu acest telefon." });
      } else {
        setBannerError(
          err instanceof ApiError ? err.message : "Nu s-au putut salva modificările.",
        );
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <ProfileSectionCard title="Informații personale">
      {bannerError && (
        <div className="mb-4">
          <ErrorBanner message={bannerError} />
        </div>
      )}

      {editing ? (
        <>
          <div className="grid gap-4 sm:grid-cols-2">
            <ProfileFieldInput
              id="profile-firstName"
              label="Prenume"
              value={draft.firstName}
              onChange={(v) => setDraft((d) => ({ ...d, firstName: v }))}
              error={errors.firstName}
            />
            <ProfileFieldInput
              id="profile-lastName"
              label="Nume"
              value={draft.lastName}
              onChange={(v) => setDraft((d) => ({ ...d, lastName: v }))}
              error={errors.lastName}
            />
            <ProfileFieldInput
              id="profile-phone"
              label="Telefon"
              value={draft.phone}
              onChange={(v) => setDraft((d) => ({ ...d, phone: v }))}
              error={errors.phone}
            />
            <ProfileReadonlyField
              label="Rol"
              value={user.isAdmin ? "Administrator" : "Utilizator"}
            />
            <div className="sm:col-span-2">
              <ProfileFieldInput
                id="profile-password"
                label="Parolă nouă"
                type="password"
                value={draft.password}
                placeholder="Lasă gol pentru a păstra parola actuală"
                onChange={(v) => setDraft((d) => ({ ...d, password: v }))}
                error={errors.password}
              />
            </div>
          </div>

          <div className="mt-6 flex flex-wrap justify-end gap-2 border-t border-[#c3c6d7] pt-4">
            <button
              type="button"
              onClick={handleCancel}
              disabled={saving}
              className="rounded border border-[#c3c6d7] bg-[#faf8ff] px-[25px] py-[9px] text-xs font-semibold uppercase tracking-[0.6px] text-[#191b23] hover:bg-white disabled:opacity-50"
            >
              Anulează
            </button>
            <button
              type="button"
              onClick={() => void handleSave()}
              disabled={saving}
              className="rounded bg-[#004ac6] px-6 py-[9px] text-xs font-semibold uppercase tracking-[0.6px] text-white shadow-[0px_1px_1px_rgba(0,0,0,0.05)] hover:bg-[#003da3] disabled:opacity-50"
            >
              {saving ? "Se salvează…" : "Salvează"}
            </button>
          </div>
        </>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2">
            <ProfileReadonlyField label="Prenume" value={user.firstName} />
            <ProfileReadonlyField label="Nume" value={user.lastName} />
            <ProfileReadonlyField label="Telefon" value={user.phone} />
            <ProfileReadonlyField
              label="Rol"
              value={user.isAdmin ? "Administrator" : "Utilizator"}
            />
          </div>

          <div className="mt-6 flex justify-end border-t border-[#c3c6d7] pt-4">
            <button
              type="button"
              onClick={() => setEditing(true)}
              className="rounded border border-[#c3c6d7] bg-[#faf8ff] px-[25px] py-[9px] text-xs font-semibold uppercase tracking-[0.6px] text-[#191b23] hover:bg-white"
            >
              Editează
            </button>
          </div>
        </>
      )}
    </ProfileSectionCard>
  );
}
