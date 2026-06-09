import { Suspense } from "react";
import { TemperatureChartsContent } from "@/components/temperature/temperature-charts-content";

export default function HeatingChartsPage() {
  return (
    <Suspense
      fallback={
        <p className="text-sm text-[#555f6d]">Se încarcă graficele…</p>
      }
    >
      <TemperatureChartsContent />
    </Suspense>
  );
}
