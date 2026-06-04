"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  EyeIcon,
  EyeOffIcon,
  LockIcon,
  PhoneIcon,
  ShieldIcon,
} from "@/components/login/login-icons";
import { FigmaField } from "@/components/login/figma-field";
import { SessionExpiredBanner } from "@/components/login/session-expired-banner";
import { useAuth } from "@/hooks/useAuth";
import { isAuthenticated } from "@/lib/auth";

const PHONE_LENGTH = 10;
const PASSWORD_MIN = 6;

function normalizePhone(value: string): string {
  return value.replace(/\D/g, "").slice(0, PHONE_LENGTH);
}

function validatePhone(phone: string): string | undefined {
  if (phone.length === 0) return "Phone number is required.";
  if (phone.length !== PHONE_LENGTH)
    return `Enter a ${PHONE_LENGTH}-digit phone number.`;
  return undefined;
}

function validatePassword(password: string): string | undefined {
  if (password.length === 0) return "Password is required.";
  if (password.length < PASSWORD_MIN)
    return `Password must be at least ${PASSWORD_MIN} characters.`;
  return undefined;
}

export function LoginPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, isLoading, error } = useAuth();
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [touched, setTouched] = useState({ phone: false, password: false });

  const sessionExpired =
    searchParams.get("reason") === "session_expired";

  const phoneError = useMemo(
    () => (touched.phone ? validatePhone(phone) : undefined),
    [phone, touched.phone],
  );
  const passwordError = useMemo(
    () => (touched.password ? validatePassword(password) : undefined),
    [password, touched.password],
  );

  const canSubmit = useMemo(
    () =>
      !validatePhone(phone) &&
      !validatePassword(password) &&
      !isLoading,
    [phone, password, isLoading],
  );

  useEffect(() => {
    if (isAuthenticated()) {
      router.replace("/dashboard");
    }
  }, [router]);

  const handlePhoneChange = useCallback(
    (value: string) => setPhone(normalizePhone(value)),
    [],
  );

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setTouched({ phone: true, password: true });

    if (validatePhone(phone) || validatePassword(password)) return;

    try {
      await login(phone, password);
      router.replace("/dashboard");
    } catch {
      /* useAuth.error */
    }
  }

  const showSessionBanner = sessionExpired || Boolean(error);
  const bannerTitle = sessionExpired ? "Session Expired" : "Sign in failed";
  const bannerDescription = sessionExpired
    ? "Please sign in again to continue managing your infrastructure."
    : (error ??
      "Please check your phone number and password, then try again.");

  return (
    <div className="flex min-h-full items-center justify-center px-4 py-16 sm:py-[231px]">
      <div className="flex w-full max-w-[448px] flex-col gap-6">
        <div className="flex flex-col items-center">
          <h1 className="text-center text-[30px] font-semibold leading-[38px] tracking-[-0.6px] text-[#004ac6]">
            BlueLock
          </h1>
        </div>

        <div className="relative w-full rounded-[4px] border border-[#c3c6d7] bg-white px-[33px] pb-[49px] pt-[41px] shadow-[0px_4px_6px_-1px_rgba(0,0,0,0.1),0px_2px_4px_-1px_rgba(0,0,0,0.06)]">
          <form
            className="flex flex-col gap-6"
            onSubmit={handleSubmit}
            noValidate
          >
            {showSessionBanner && (
              <SessionExpiredBanner
                title={bannerTitle}
                description={bannerDescription}
              />
            )}

            <div className="flex flex-col gap-6">
              <FigmaField
                label="Phone Number"
                name="phone"
                type="tel"
                inputMode="numeric"
                autoComplete="tel"
                placeholder="07xxxxxxxx"
                value={phone}
                onChange={(e) => handlePhoneChange(e.target.value)}
                onBlur={() => setTouched((t) => ({ ...t, phone: true }))}
                error={phoneError}
                leftIcon={<PhoneIcon />}
              />

              <div className="flex flex-col gap-1 pb-2">
                <FigmaField
                  label="Password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onBlur={() => setTouched((t) => ({ ...t, password: true }))}
                  error={passwordError}
                  leftIcon={<LockIcon />}
                  labelExtra={
                    <span
                      className="cursor-default text-[13px] leading-[18px] text-[#004ac6]"
                      title="Contact your system administrator"
                    >
                      Forgot password?
                    </span>
                  }
                  rightSlot={
                    <button
                      type="button"
                      className="flex items-center justify-center rounded p-1 hover:bg-[#faf8ff]"
                      onClick={() => setShowPassword((v) => !v)}
                      aria-label={
                        showPassword ? "Hide password" : "Show password"
                      }
                    >
                      {showPassword ? <EyeIcon /> : <EyeOffIcon />}
                    </button>
                  }
                />
              </div>

              <button
                type="submit"
                disabled={!canSubmit}
                className="flex w-full items-center justify-center rounded-[2px] bg-[#004ac6] px-6 py-4 text-[14px] font-semibold leading-5 text-white transition-opacity disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isLoading ? "Signing in…" : "Sign In"}
              </button>
            </div>
          </form>
        </div>

        <div className="flex items-center justify-center gap-1">
          <ShieldIcon />
          <p className="text-center text-[13px] leading-[18px] text-[#555f6d]">
            Enterprise-grade encryption active.
          </p>
        </div>
      </div>
    </div>
  );
}
