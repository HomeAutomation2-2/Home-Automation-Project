import { Suspense } from "react";
import { LoginPageContent } from "@/components/login/login-page-content";

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-full items-center justify-center bg-[#faf8ff]">
          <p className="text-sm text-[#555f6d]">Se încarcă…</p>
        </div>
      }
    >
      <LoginPageContent />
    </Suspense>
  );
}
