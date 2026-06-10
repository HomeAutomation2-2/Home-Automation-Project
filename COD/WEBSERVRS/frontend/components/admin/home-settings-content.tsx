"use client";

import { FormEvent, useEffect, useState } from "react";
import { AdminGuard } from "@/components/admin/admin-guard";
import { PageHeader } from "@/components/admin/page-header";
import { FigmaField } from "@/components/login/figma-field";
import { Button } from "@/components/ui/Button";
import { ErrorBanner } from "@/components/ui/ErrorBanner";
import { getApiClient } from "@/lib/auth";
import { ApiError } from "@/lib/types/api";
import type { HomeSettings } from "@/lib/types/home-settings";

export function HomeSettingsContent() {
  const [settings, setSettings] = useState<HomeSettings | null>(null);
  const [fireAlert, setFireAlert] = useState("45");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [bannerError, setBannerError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      try {
        const data = await getApiClient().getHomeSettings();
        if (!cancelled) {
          setSettings(data);
          setFireAlert(String(data.fire_alert_celsius));
        }
      } catch (err) {
        if (!cancelled) {
          setBannerError(
            err instanceof ApiError ? err.message : "Nu s-au putut încărca setările.",
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
  }, []);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setBannerError(null);
    setSuccess(null);

    const value = Number(fireAlert);
    if (!Number.isFinite(value) || value <= 0) {
      setBannerError("Pragul de temperatură trebuie să fie un număr pozitiv.");
      return;
    }

    setSubmitting(true);
    try {
      const updated = await getApiClient().updateHomeSettings({
        fire_alert_celsius: value,
      });
      setSettings(updated);
      setFireAlert(String(updated.fire_alert_celsius));
      setSuccess("Setările au fost salvate.");
    } catch (err) {
      setBannerError(
        err instanceof ApiError ? err.message : "Nu s-au putut salva setările.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AdminGuard>
      <PageHeader
        title="Setări casă"
        subtitle="Configurare globală pentru alerte și parametri de sistem."
      />

      {bannerError && (
        <div className="mb-4">
          <ErrorBanner message={bannerError} />
        </div>
      )}
      {success && (
        <p className="mb-4 rounded-lg border border-[#abefc6] bg-[#ecfdf3] px-4 py-3 text-sm text-[#067647]">
          {success}
        </p>
      )}

      {loading ? (
        <p className="text-sm text-[#555f6d]">Se încarcă…</p>
      ) : (
        <form onSubmit={(e) => void handleSubmit(e)} className="max-w-xl space-y-6">
          <section className="rounded-lg border border-[#c3c6d7] bg-[#faf8ff] p-6">
            <h2 className="text-lg font-semibold text-[#191b23]">Alertă temperatură</h2>
            <p className="mt-1 text-[13px] text-[#555f6d]">
              Notificare admin când o cameră depășește pragul (ex. risc de supraîncălzire).
            </p>
            <div className="mt-4">
              <FigmaField
                label="Prag alertă foc (°C)"
                name="fire_alert_celsius"
                type="number"
                step="0.1"
                min={1}
                value={fireAlert}
                onChange={(e) => setFireAlert(e.target.value)}
                required
              />
            </div>
            {settings && (
              <p className="mt-3 text-xs text-[#555f6d]">
                Valoare curentă în sistem: {settings.fire_alert_celsius}°C
              </p>
            )}
          </section>

          <div className="flex justify-end">
            <Button
              type="submit"
              disabled={submitting}
              className="!bg-[#004ac6] !text-white hover:!opacity-90"
            >
              {submitting ? "Se salvează…" : "Salvează"}
            </Button>
          </div>
        </form>
      )}
    </AdminGuard>
  );
}
