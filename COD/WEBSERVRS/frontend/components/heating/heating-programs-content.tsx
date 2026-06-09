"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { FIGMA_HEATING } from "@/components/heating/figma-heating-assets";
import { HeatingSubNav } from "@/components/heating/heating-subnav";
import { ProgramScheduleEditor } from "@/components/heating/program-schedule-editor";
import { ErrorBanner } from "@/components/ui/ErrorBanner";
import { DAY_NAMES } from "@/lib/heating/room-temp-join";
import {
  defaultWeekdayPeriod,
  validateProgramSchedule,
} from "@/lib/heating/validate-program-schedule";
import { getApiClient } from "@/lib/auth";
import { ApiError } from "@/lib/types/api";
import type { Period } from "@/lib/types/period";
import type { Room } from "@/lib/types/room";
import type { TempProgram } from "@/lib/types/temp-program";

type PanelMode = { kind: "new" } | { kind: "view"; programId: number };

function formatProgramDays(schedule: TempProgram["schedule"]): string {
  if (schedule.length === 0) return "—";
  const days = [...new Set(schedule.flatMap((p) => p.days))].sort((a, b) => a - b);
  if (days.length === 7) return "Zilnic";
  if (days.join(",") === "0,1,2,3,4") return "Lun–Vin";
  if (days.join(",") === "5,6") return "Sâm–Dum";
  return days.map((d) => DAY_NAMES[d]).join(", ");
}

export function HeatingProgramsContent() {
  const [programs, setPrograms] = useState<TempProgram[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [panel, setPanel] = useState<PanelMode>({ kind: "new" });
  const [assignRoomId, setAssignRoomId] = useState("");
  const [assignProgramId, setAssignProgramId] = useState("");
  const [assigning, setAssigning] = useState(false);
  const [assignMessage, setAssignMessage] = useState<string | null>(null);
  const [listInitialized, setListInitialized] = useState(false);

  const [name, setName] = useState("");
  const [periods, setPeriods] = useState<Period[]>([defaultWeekdayPeriod()]);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const client = getApiClient();
      const [programsData, roomsData] = await Promise.all([
        client.getHeatingPrograms(),
        client.getRooms(),
      ]);
      setPrograms(programsData);
      setRooms(roomsData);
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "Nu s-au putut încărca programele.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    if (!listInitialized && programs.length > 0) {
      setPanel({ kind: "view", programId: programs[0].id });
      setListInitialized(true);
    }
  }, [programs, listInitialized]);

  const selectedProgram = useMemo(
    () =>
      panel.kind === "view"
        ? programs.find((p) => p.id === panel.programId) ?? null
        : null,
    [panel, programs],
  );

  function resetCreateForm() {
    setName("");
    setPeriods([defaultWeekdayPeriod()]);
    setFormError(null);
    setPanel({ kind: "new" });
  }

  async function handleCreate(e: FormEvent) {
    e.preventDefault();
    const validation = validateProgramSchedule(name, periods);
    if (validation) {
      setFormError(validation);
      return;
    }
    setFormError(null);
    setSaving(true);
    try {
      await getApiClient().createHeatingProgram({ name: name.trim(), schedule: periods });
      resetCreateForm();
      await load();
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : "Crearea nu a reușit.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("Ștergi acest program?")) return;
    try {
      await getApiClient().deleteHeatingProgram(id);
      if (panel.kind === "view" && panel.programId === id) {
        setPanel({ kind: "new" });
      }
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Ștergerea nu a reușit.");
    }
  }

  async function handleAssign(e: FormEvent) {
    e.preventDefault();
    if (!assignRoomId || !assignProgramId) return;
    setAssigning(true);
    setAssignMessage(null);
    try {
      await getApiClient().setRoomTempProgram(
        Number(assignRoomId),
        Number(assignProgramId),
      );
      setAssignMessage("Program alocat.");
      await load();
    } catch (err) {
      setAssignMessage(
        err instanceof ApiError ? err.message : "Alocarea nu a reușit.",
      );
    } finally {
      setAssigning(false);
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-[#c3c6d7] pb-3">
        <h1 className="text-[30px] font-semibold leading-[38px] tracking-[-0.6px] text-[#191b23]">
          Programe încălzire
        </h1>
        {panel.kind === "new" && (
          <div className="flex gap-2">
            <button
              type="button"
              onClick={resetCreateForm}
              className="rounded border border-[#c3c6d7] bg-white px-4 py-2 text-sm text-[#191b23]"
            >
              Renunță
            </button>
            <button
              type="submit"
              form="heating-program-create"
              disabled={saving}
              className="inline-flex items-center gap-1 rounded bg-[#004ac6] px-4 py-2 text-sm text-white disabled:opacity-50"
            >
              <img alt="" src={FIGMA_HEATING.saveIcon} className="size-3 max-w-none" />
              Salvează
            </button>
          </div>
        )}
      </div>

      <HeatingSubNav />
      {error && <ErrorBanner message={error} />}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[280px_1fr]">
        <aside className="flex flex-col gap-3">
          <p className="text-xs font-semibold uppercase tracking-[0.6px] text-[#555f6d]">
            Programe active
          </p>

          {loading && (
            <div className="h-24 animate-pulse rounded border border-[#c3c6d7] bg-white" />
          )}

          {!loading &&
            programs.map((program) => {
              const selected =
                panel.kind === "view" && panel.programId === program.id;
              return (
                <button
                  key={program.id}
                  type="button"
                  onClick={() => setPanel({ kind: "view", programId: program.id })}
                  className={`relative w-full rounded border bg-white p-4 text-left transition-colors ${
                    selected
                      ? "border-[#c3c6d7] shadow-sm"
                      : "border-[#c3c6d7] hover:bg-[#faf8ff]"
                  }`}
                >
                  {selected && (
                    <span
                      className="absolute bottom-0 left-0 top-0 w-1 bg-[#004ac6]"
                      aria-hidden
                    />
                  )}
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <p className="font-semibold text-[#191b23]">{program.name}</p>
                      <p className="text-xs text-[#555f6d]">
                        {formatProgramDays(program.schedule)}
                      </p>
                    </div>
                    <img
                      alt=""
                      src={FIGMA_HEATING.programsChevron}
                      className="size-3 max-w-none opacity-60"
                    />
                  </div>
                </button>
              );
            })}

          <button
            type="button"
            onClick={resetCreateForm}
            className="w-full rounded border border-dashed border-[#c3c6d7] bg-white px-4 py-3 text-sm font-medium text-[#004ac6] hover:bg-[#faf8ff]"
          >
            + Program nou
          </button>

          <div className="mt-2 rounded border border-[#c3c6d7] bg-white p-4">
            <p className="text-sm font-semibold text-[#191b23]">Alocă la cameră</p>
            <form onSubmit={(e) => void handleAssign(e)} className="mt-3 flex flex-col gap-2">
              <select
                value={assignRoomId}
                onChange={(e) => setAssignRoomId(e.target.value)}
                className="rounded border border-[#c3c6d7] px-2 py-1.5 text-sm"
                aria-label="Cameră"
              >
                <option value="">Cameră</option>
                {rooms.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name}
                  </option>
                ))}
              </select>
              <select
                value={assignProgramId}
                onChange={(e) => setAssignProgramId(e.target.value)}
                className="rounded border border-[#c3c6d7] px-2 py-1.5 text-sm"
                aria-label="Program"
              >
                <option value="">Program</option>
                {programs.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
              <button
                type="submit"
                disabled={assigning || !assignRoomId || !assignProgramId}
                className="rounded bg-[#004ac6] px-3 py-1.5 text-sm text-white disabled:opacity-50"
              >
                Alocă
              </button>
            </form>
            {assignMessage && (
              <p className="mt-2 text-xs text-[#555f6d]">{assignMessage}</p>
            )}
          </div>
        </aside>

        <div className="rounded border border-[#c3c6d7] bg-white">
          {panel.kind === "new" ? (
            <form
              id="heating-program-create"
              onSubmit={(e) => void handleCreate(e)}
              className="flex flex-col gap-4 p-[17px]"
            >
              <div className="flex items-center gap-2 border-b border-[#c3c6d7] pb-4">
                <img
                  alt=""
                  src={FIGMA_HEATING.programsCalendarIcon}
                  className="size-[18px] max-w-none"
                />
                <div>
                  <h2 className="text-lg font-semibold text-[#191b23]">Program nou</h2>
                  <p className="text-sm text-[#555f6d]">Definește intervalele orare.</p>
                </div>
              </div>
              <label className="flex flex-col gap-1">
                <span className="text-xs font-bold uppercase tracking-[0.6px] text-[#555f6d]">
                  Nume
                </span>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="rounded border border-[#c3c6d7] bg-[#faf8ff] px-3 py-2 text-sm"
                  placeholder="ex. Confort zile lucrătoare"
                />
              </label>
              <ProgramScheduleEditor periods={periods} onChange={setPeriods} />
              {formError && <p className="text-sm text-[#b42318]">{formError}</p>}
            </form>
          ) : selectedProgram ? (
            <div className="flex flex-col gap-4 p-[17px]">
              <div className="flex items-center justify-between gap-2 border-b border-[#c3c6d7] pb-4">
                <div className="flex items-center gap-2">
                  <img
                    alt=""
                    src={FIGMA_HEATING.programsCalendarIcon}
                    className="size-[18px] max-w-none"
                  />
                  <div>
                    <h2 className="text-lg font-semibold text-[#191b23]">
                      {selectedProgram.name}
                    </h2>
                    <p className="text-sm text-[#555f6d]">
                      {formatProgramDays(selectedProgram.schedule)}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => void handleDelete(selectedProgram.id)}
                  className="rounded border border-[#c3c6d7] px-3 py-1 text-xs text-[#b42318]"
                >
                  Șterge
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[480px] text-left text-sm">
                  <thead>
                    <tr className="border-b border-[#c3c6d7] text-xs font-semibold uppercase tracking-[0.6px] text-[#555f6d]">
                      <th className="px-2 py-2">Zi</th>
                      <th className="px-2 py-2">Oră</th>
                      <th className="px-2 py-2">Temperatură</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedProgram.schedule.flatMap((period, pi) =>
                      period.slots.map((slot, si) => (
                        <tr
                          key={`${pi}-${si}`}
                          className="border-b border-[#c3c6d7] last:border-0"
                        >
                          <td className="px-2 py-2 text-[#555f6d]">
                            {period.days.map((d) => DAY_NAMES[d]).join(", ")}
                          </td>
                          <td className="px-2 py-2">{slot.time}</td>
                          <td className="px-2 py-2 font-medium text-[#191b23]">
                            {String(slot.temp)}°C
                          </td>
                        </tr>
                      )),
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <p className="p-[17px] text-sm text-[#555f6d]">Selectează un program.</p>
          )}
        </div>
      </div>
    </div>
  );
}
