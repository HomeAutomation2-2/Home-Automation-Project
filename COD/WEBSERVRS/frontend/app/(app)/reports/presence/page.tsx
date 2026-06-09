import { Suspense } from "react";
import { PresenceReportPageContent } from "@/components/presence-report/presence-report-page-content";

export default function PresenceReportPage() {
  return (
    <Suspense fallback={<p className="text-sm text-[#555f6d]">Se încarcă…</p>}>
      <PresenceReportPageContent />
    </Suspense>
  );
}
