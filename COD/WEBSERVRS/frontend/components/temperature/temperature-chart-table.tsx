import type { TemperaturePoint } from "@/lib/temperature/types";

type TemperatureChartTableProps = {
  points: TemperaturePoint[];
};

export function TemperatureChartTable({ points }: TemperatureChartTableProps) {
  return (
    <div className="overflow-hidden rounded-lg border border-[#c3c6d7] bg-white">
      <table className="w-full text-left">
        <thead className="border-b border-[#c3c6d7] bg-[#f3f3fe]">
          <tr className="text-xs font-bold uppercase tracking-[0.6px] text-[#555f6d]">
            <th className="px-4 py-2">Data și ora</th>
            <th className="px-4 py-2 text-right">Temperatură</th>
          </tr>
        </thead>
        <tbody>
          {points.length === 0 && (
            <tr>
              <td colSpan={2} className="px-4 py-8 text-center text-sm text-[#555f6d]">
                Niciun rând de afișat.
              </td>
            </tr>
          )}
          {points.map((point) => (
            <tr key={point.time} className="border-b border-[#c3c6d7] last:border-0">
              <td className="px-4 py-3 text-sm text-[#191b23]">{point.label}</td>
              <td className="px-4 py-3 text-right text-sm font-semibold text-[#191b23]">
                {point.value.toFixed(1)}°C
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
