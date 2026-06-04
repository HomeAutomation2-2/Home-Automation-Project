"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { ErrorBanner } from "@/components/ui/ErrorBanner";
import { Input } from "@/components/ui/Input";
import { useAuth } from "@/hooks/useAuth";

export default function LoginPage() {
  const router = useRouter();
  const { login, isLoading, error } = useAuth();
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [submitError, setSubmitError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitError(null);

    try {
      await login(phone.trim(), password);
      router.replace("/dashboard");
    } catch {
      setSubmitError(null);
    }
  }

  const displayError = submitError ?? error;

  return (
    <div className="flex min-h-full flex-col items-center justify-center p-6">
      <div className="w-full max-w-sm space-y-6 rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
        <div>
          <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
            Autentificare
          </h1>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            Home Automation Cloud — stub Faza 2
          </p>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <Input
            label="Telefon"
            name="phone"
            type="tel"
            autoComplete="tel"
            placeholder="07xxxxxxxx"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
          />
          <Input
            label="Parolă"
            name="password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
          />
          {displayError && <ErrorBanner message={displayError} />}
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Se autentifică…" : "Intră în cont"}
          </Button>
        </form>
      </div>
    </div>
  );
}
