/** Același markup pe server și client — evită hydration mismatch în AuthGuard */
export function AuthCheckFallback() {
  return (
    <div className="flex min-h-full items-center justify-center bg-[#faf8ff] p-6">
      <p className="text-sm text-[#555f6d]">Se verifică sesiunea…</p>
    </div>
  );
}
