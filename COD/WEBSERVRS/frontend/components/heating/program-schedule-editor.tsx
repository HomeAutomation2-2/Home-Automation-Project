import { DAY_NAMES } from "@/lib/heating/room-temp-join";
import type { Period } from "@/lib/types/period";
import type { TimeSlot } from "@/lib/types/time-slot";

const DAY_PRESETS: { label: string; days: number[] }[] = [
  { label: "Luni–Vineri", days: [0, 1, 2, 3, 4] },
  { label: "Weekend", days: [5, 6] },
  { label: "Toată săptămâna", days: [0, 1, 2, 3, 4, 5, 6] },
];

type ProgramScheduleEditorProps = {
  periods: Period[];
  onChange: (periods: Period[]) => void;
};

function updatePeriod(
  periods: Period[],
  index: number,
  patch: Partial<Period>,
): Period[] {
  return periods.map((p, i) => (i === index ? { ...p, ...patch } : p));
}

export function ProgramScheduleEditor({ periods, onChange }: ProgramScheduleEditorProps) {
  function toggleDay(periodIndex: number, day: number) {
    const period = periods[periodIndex];
    const hasDay = period.days.includes(day);
    let nextDays: number[];

    if (hasDay) {
      nextDays = period.days.filter((d) => d !== day);
    } else {
      const cleared = periods.map((p, idx) =>
        idx === periodIndex
          ? p
          : { ...p, days: p.days.filter((d) => d !== day) },
      );
      nextDays = [...period.days, day].sort((a, b) => a - b);
      onChange(
        cleared.map((p, idx) =>
          idx === periodIndex ? { ...p, days: nextDays } : p,
        ),
      );
      return;
    }

    onChange(updatePeriod(periods, periodIndex, { days: nextDays }));
  }

  function applyPreset(periodIndex: number, days: number[]) {
    onChange(
      periods.map((p, idx) =>
        idx === periodIndex ? { ...p, days: [...days] } : p,
      ),
    );
  }

  function updateSlot(periodIndex: number, slotIndex: number, slot: TimeSlot) {
    const period = periods[periodIndex];
    const slots = period.slots.map((s, i) => (i === slotIndex ? slot : s));
    onChange(updatePeriod(periods, periodIndex, { slots }));
  }

  function addSlot(periodIndex: number) {
    const period = periods[periodIndex];
    if (period.slots.length >= 4) return;
    onChange(
      updatePeriod(periods, periodIndex, {
        slots: [...period.slots, { time: "12:00", temp: 20 }],
      }),
    );
  }

  function removeSlot(periodIndex: number, slotIndex: number) {
    const period = periods[periodIndex];
    if (period.slots.length <= 1) return;
    onChange(
      updatePeriod(periods, periodIndex, {
        slots: period.slots.filter((_, i) => i !== slotIndex),
      }),
    );
  }

  function addPeriod() {
    if (periods.length >= 3) return;
    onChange([
      ...periods,
      { days: [5, 6], slots: [{ time: "08:00", temp: 21 }] },
    ]);
  }

  function removePeriod(index: number) {
    if (periods.length <= 1) return;
    onChange(periods.filter((_, i) => i !== index));
  }

  return (
    <div className="flex flex-col gap-4">
      {periods.map((period, periodIndex) => (
        <div
          key={`period-${periodIndex}`}
          className="rounded-lg border border-[#c3c6d7] bg-[#faf8ff] p-4"
        >
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <h4 className="text-sm font-semibold text-[#191b23]">
              Perioada {periodIndex + 1}
            </h4>
            {periods.length > 1 && (
              <button
                type="button"
                onClick={() => removePeriod(periodIndex)}
                className="text-xs text-[#b42318] hover:underline"
              >
                Elimină perioada
              </button>
            )}
          </div>

          <div className="mb-3 flex flex-wrap gap-1">
            {DAY_PRESETS.map((preset) => (
              <button
                key={preset.label}
                type="button"
                onClick={() => applyPreset(periodIndex, preset.days)}
                className="rounded border border-[#c3c6d7] bg-white px-2 py-0.5 text-xs text-[#555f6d] hover:border-[#004ac6]"
              >
                {preset.label}
              </button>
            ))}
          </div>

          <div className="mb-4 flex flex-wrap gap-1">
            {DAY_NAMES.map((label, day) => (
              <button
                key={label}
                type="button"
                onClick={() => toggleDay(periodIndex, day)}
                className={`min-w-[40px] rounded px-2 py-1 text-xs font-medium ${
                  period.days.includes(day)
                    ? "bg-[#004ac6] text-white"
                    : "border border-[#c3c6d7] bg-white text-[#555f6d]"
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          <div className="space-y-2">
            {period.slots.map((slot, slotIndex) => (
              <div key={`slot-${slotIndex}`} className="flex flex-wrap items-center gap-2">
                <input
                  type="time"
                  value={slot.time}
                  onChange={(e) =>
                    updateSlot(periodIndex, slotIndex, {
                      ...slot,
                      time: e.target.value.slice(0, 5),
                    })
                  }
                  className="rounded border border-[#c3c6d7] bg-white px-2 py-1 text-sm"
                />
                <select
                  value={String(slot.temp)}
                  onChange={(e) => {
                    const v = e.target.value;
                    const temp =
                      v === "off" || v === "antifreeze" ? v : Number(v);
                    updateSlot(periodIndex, slotIndex, { ...slot, temp });
                  }}
                  className="rounded border border-[#c3c6d7] bg-white px-2 py-1 text-sm"
                >
                  <option value="off">Oprit</option>
                  <option value="antifreeze">Antigel</option>
                  {[18, 19, 20, 21, 22, 23].map((t) => (
                    <option key={t} value={t}>
                      {t}°C
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => removeSlot(periodIndex, slotIndex)}
                  className="text-xs text-[#555f6d] hover:text-[#b42318]"
                >
                  Elimină
                </button>
              </div>
            ))}
          </div>

          {period.slots.length < 4 && (
            <button
              type="button"
              onClick={() => addSlot(periodIndex)}
              className="mt-2 text-xs font-semibold text-[#004ac6] hover:underline"
            >
              + Interval nou
            </button>
          )}
        </div>
      ))}

      {periods.length < 3 && (
        <button
          type="button"
          onClick={addPeriod}
          className="self-start text-sm font-semibold text-[#004ac6] hover:underline"
        >
          + Perioadă nouă (ex. vacanță)
        </button>
      )}
    </div>
  );
}
