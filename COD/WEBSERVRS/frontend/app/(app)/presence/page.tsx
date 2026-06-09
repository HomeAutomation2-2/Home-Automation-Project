import { Suspense } from "react";
import { PresencePageContent } from "@/components/presence/presence-page-content";

export default function PresencePage() {
  return (
    <Suspense fallback={<p className="text-sm text-[#555f6d]">Se încarcă…</p>}>
      <PresencePageContent />
    </Suspense>
  );
}
