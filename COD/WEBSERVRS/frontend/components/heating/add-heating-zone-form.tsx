"use client";

import { FormEvent, useState } from "react";
import { getApiClient } from "@/lib/auth";
import { ApiError } from "@/lib/types/api";

type AddHeatingZoneFormProps = {
  onCreated: () => void;
};

export function AddHeatingZoneForm({ onCreated }: AddHeatingZoneFormProps) {
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) {
      setFormError("Numele zonei este obligatoriu.");
      return;
    }
    setSaving(true);
    setFormError(null);
    try {
      await getApiClient().createRoom(trimmed);
      setName("");
      onCreated();
    } catch (err) {
      setFormError(
        err instanceof ApiError ? err.message : "Zona nu a putut fi creată.",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="rounded border border-[#c3c6d7] bg-white p-[17px]">
      <h2 className="text-sm font-semibold text-[#191b23]">Adaugă zonă de temperatură</h2>
      <form
        onSubmit={(e) => void handleSubmit(e)}
        className="mt-3 flex flex-wrap items-end gap-2"
      >
        <label className="flex min-w-[220px] flex-1 flex-col gap-1">
          <span className="text-xs font-bold uppercase tracking-[0.6px] text-[#555f6d]">
            Nume cameră / zonă
          </span>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="ex. Living"
            className="rounded border border-[#c3c6d7] bg-[#faf8ff] px-3 py-2 text-sm outline-none focus:border-[#004ac6]"
          />
        </label>
        <button
          type="submit"
          disabled={saving}
          className="rounded bg-[#004ac6] px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
        >
          {saving ? "Se adaugă…" : "Adaugă"}
        </button>
      </form>
      {formError && (
        <p className="mt-2 text-sm text-[#b42318]" role="alert">
          {formError}
        </p>
      )}
    </div>
  );
}
