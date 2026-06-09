"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import { HeatingSubNav } from "@/components/heating/heating-subnav";
import { ProgramScheduleEditor } from "@/components/heating/program-schedule-editor";
import { ErrorBanner } from "@/components/ui/ErrorBanner";
import {
  defaultWeekdayPeriod,
  validateProgramSchedule,
} from "@/lib/heating/validate-program-schedule";
import { getApiClient } from "@/lib/auth";
import { ApiError } from "@/lib/types/api";
import type { Period } from "@/lib/types/period";
import type { Room } from "@/lib/types/room";
import type { TempProgram } from "@/lib/types/temp-program";

export function HeatingProgramsContent() {
  const [programs, setPrograms] = useState<TempProgram[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [assignRoomId, setAssignRoomId] = useState("");
  const [assignProgramId, setAssignProgramId] = useState("");
  const [assigning, setAssigning] = useState(false);
  const [assignMessage, setAssignMessage] = useState<string | null>(null);

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
      setName("");
      setPeriods([defaultWeekdayPeriod()]);
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
      setAssignMessage("Programul a fost alocat camerei.");
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
    <div className="mx-auto flex w-full max-w-[960px] flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-[#191b23]">Programe încălzire</h1>
        <p className="mt-1 text-sm text-[#555f6d]">
          Creează programe orare și alocă-le camerelor.
        </p>
      </div>

      <HeatingSubNav />

      {error && <ErrorBanner message={error} />}

      <section className="rounded-lg border border-[#c3c6d7] bg-white p-[17px]">
        <h2 className="text-lg font-semibold text-[#191b23]">Programe existente</h2>
        {loading && <p className="mt-3 text-sm text-[#555f6d]">Se încarcă…</p>}
        {!loading && programs.length === 0 && (
          <p className="mt-3 text-sm text-[#555f6d]">Niciun program definit.</p>
        )}
        <ul className="mt-3 divide-y divide-[#c3c6d7]">
          {programs.map((program) => (
            <li
              key={program.id}
              className="flex flex-wrap items-center justify-between gap-2 py-3"
            >
              <div>
                <p className="font-medium text-[#191b23]">{program.name}</p>
                <p className="text-xs text-[#555f6d]">
                  {program.schedule.length} perioadă/perioade
                </p>
              </div>
              <button
                type="button"
                onClick={() => void handleDelete(program.id)}
                className="rounded border border-[#c3c6d7] px-3 py-1 text-xs text-[#b42318] hover:bg-[#faf8ff]"
              >
                Șterge
              </button>
            </li>
          ))}
        </ul>
      </section>

      <section className="rounded-lg border border-[#c3c6d7] bg-white p-[17px]">
        <h2 className="text-lg font-semibold text-[#191b23]">Alocă la cameră</h2>
        <form onSubmit={(e) => void handleAssign(e)} className="mt-3 flex flex-wrap gap-2">
          <select
            value={assignRoomId}
            onChange={(e) => setAssignRoomId(e.target.value)}
            className="rounded border border-[#c3c6d7] px-2 py-1.5 text-sm"
            aria-label="Cameră"
          >
            <option value="">Alege camera</option>
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
            <option value="">Alege programul</option>
            {programs.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
          <button
            type="submit"
            disabled={assigning || !assignRoomId || !assignProgramId}
            className="rounded bg-[#004ac6] px-4 py-1.5 text-sm text-white disabled:opacity-50"
          >
            Alocă
          </button>
        </form>
        {assignMessage && (
          <p className="mt-2 text-sm text-[#555f6d]">{assignMessage}</p>
        )}
      </section>

      <section className="rounded-lg border border-[#c3c6d7] bg-white p-[17px]">
        <h2 className="text-lg font-semibold text-[#191b23]">Program nou</h2>
        <form onSubmit={(e) => void handleCreate(e)} className="mt-4 flex flex-col gap-4">
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
          <button
            type="submit"
            disabled={saving}
            className="w-fit rounded bg-[#004ac6] px-4 py-2 text-sm text-white disabled:opacity-50"
          >
            {saving ? "Se creează…" : "Creează program"}
          </button>
        </form>
      </section>
    </div>
  );
}
