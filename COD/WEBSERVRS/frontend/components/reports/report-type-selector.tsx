import type { ReportType } from "@/lib/reports/report-config";

const OPTIONS: { id: ReportType; label: string }[] = [
  { id: "events", label: "Evenimente" },
  { id: "presence", label: "Prezență" },
  { id: "temperature", label: "Temperaturi" },
];

type ReportTypeSelectorProps = {
  selected: ReportType;
  onChange: (type: ReportType) => void;
};

export function ReportTypeSelector({ selected, onChange }: ReportTypeSelectorProps) {
  return (
    <nav
      className="flex flex-wrap gap-2 border-b border-[#c3c6d7] pb-3"
      aria-label="Tip raport"
    >
      {OPTIONS.map((opt) => {
        const active = selected === opt.id;
        return (
          <button
            key={opt.id}
            type="button"
            onClick={() => onChange(opt.id)}
            className={`rounded px-3 py-1.5 text-sm font-medium ${
              active
                ? "bg-[rgba(37,99,235,0.1)] text-[#004ac6]"
                : "text-[#555f6d] hover:bg-[#faf8ff] hover:text-[#191b23]"
            }`}
          >
            {opt.label}
          </button>
        );
      })}
    </nav>
  );
}
