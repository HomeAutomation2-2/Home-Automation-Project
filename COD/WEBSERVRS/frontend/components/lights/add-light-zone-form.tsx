"use client";

import { FormEvent, useState } from "react";
import { getApiClient } from "@/lib/auth";
import { ApiError } from "@/lib/types/api";
import type { Room } from "@/lib/types/room";

type AddLightZoneFormProps = {
  rooms: Room[];
  onCreated: () => void;
  onRoomCreated?: () => void;
};

export function AddLightZoneForm({
  rooms,
  onCreated,
  onRoomCreated,
}: AddLightZoneFormProps) {
  const [roomId, setRoomId] = useState("");
  const [zoneName, setZoneName] = useState("");
  const [newRoomName, setNewRoomName] = useState("");
  const [savingZone, setSavingZone] = useState(false);
  const [savingRoom, setSavingRoom] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  async function handleAddRoom(e: FormEvent) {
    e.preventDefault();
    const name = newRoomName.trim();
    if (!name) {
      setFormError("Numele camerei este obligatoriu.");
      return;
    }
    setSavingRoom(true);
    setFormError(null);
    try {
      const room = await getApiClient().createRoom(name);
      setNewRoomName("");
      setRoomId(String(room.id));
      onRoomCreated?.();
    } catch (err) {
      setFormError(
        err instanceof ApiError ? err.message : "Camera nu a putut fi creată.",
      );
    } finally {
      setSavingRoom(false);
    }
  }

  async function handleAddZone(e: FormEvent) {
    e.preventDefault();
    const name = zoneName.trim();
    if (!roomId) {
      setFormError("Selectează camera.");
      return;
    }
    if (!name) {
      setFormError("Numele zonei este obligatoriu.");
      return;
    }
    setSavingZone(true);
    setFormError(null);
    try {
      await getApiClient().createLightZone({
        room_id: Number(roomId),
        name,
      });
      setZoneName("");
      onCreated();
    } catch (err) {
      setFormError(
        err instanceof ApiError ? err.message : "Zona nu a putut fi creată.",
      );
    } finally {
      setSavingZone(false);
    }
  }

  return (
    <div className="rounded border border-[#c3c6d7] bg-white p-[17px]">
      <h2 className="text-sm font-semibold text-[#191b23]">Adaugă zonă de lumină</h2>

      {rooms.length === 0 && (
        <form onSubmit={(e) => void handleAddRoom(e)} className="mt-3 flex flex-wrap items-end gap-2">
          <label className="flex min-w-[200px] flex-1 flex-col gap-1">
            <span className="text-xs font-bold uppercase tracking-[0.6px] text-[#555f6d]">
              Cameră nouă
            </span>
            <input
              value={newRoomName}
              onChange={(e) => setNewRoomName(e.target.value)}
              placeholder="ex. Living"
              className="rounded border border-[#c3c6d7] bg-[#faf8ff] px-3 py-2 text-sm outline-none focus:border-[#004ac6]"
            />
          </label>
          <button
            type="submit"
            disabled={savingRoom}
            className="rounded border border-[#c3c6d7] bg-white px-4 py-2 text-sm font-medium text-[#191b23] disabled:opacity-50"
          >
            {savingRoom ? "Se creează…" : "Creează camera"}
          </button>
        </form>
      )}

      {rooms.length > 0 && (
        <form onSubmit={(e) => void handleAddZone(e)} className="mt-3 flex flex-wrap items-end gap-2">
          <label className="flex min-w-[160px] flex-col gap-1">
            <span className="text-xs font-bold uppercase tracking-[0.6px] text-[#555f6d]">
              Cameră
            </span>
            <select
              value={roomId}
              onChange={(e) => setRoomId(e.target.value)}
              className="rounded border border-[#c3c6d7] bg-[#faf8ff] px-3 py-2 text-sm outline-none focus:border-[#004ac6]"
            >
              <option value="">Alege camera</option>
              {rooms.map((room) => (
                <option key={room.id} value={room.id}>
                  {room.name}
                </option>
              ))}
            </select>
          </label>
          <label className="flex min-w-[200px] flex-1 flex-col gap-1">
            <span className="text-xs font-bold uppercase tracking-[0.6px] text-[#555f6d]">
              Nume zonă
            </span>
            <input
              value={zoneName}
              onChange={(e) => setZoneName(e.target.value)}
              placeholder="ex. Lustră centrală"
              className="rounded border border-[#c3c6d7] bg-[#faf8ff] px-3 py-2 text-sm outline-none focus:border-[#004ac6]"
            />
          </label>
          <button
            type="submit"
            disabled={savingZone}
            className="rounded bg-[#004ac6] px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
          >
            {savingZone ? "Se adaugă…" : "Adaugă"}
          </button>
        </form>
      )}

      {formError && (
        <p className="mt-2 text-sm text-[#b42318]" role="alert">
          {formError}
        </p>
      )}
    </div>
  );
}
