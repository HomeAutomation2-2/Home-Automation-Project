import { Suspense } from "react";
import { AccessLogPageContent } from "@/components/access-log/access-log-page-content";

export default function AccessLogPage() {
  return (
    <Suspense fallback={<p className="text-sm text-[#555f6d]">Se încarcă…</p>}>
      <AccessLogPageContent />
    </Suspense>
  );
}
