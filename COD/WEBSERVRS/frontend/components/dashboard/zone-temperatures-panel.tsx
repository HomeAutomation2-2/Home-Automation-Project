import Link from "next/link";
import type { DataState } from "@/lib/dashboard/load-state";
import type { Room } from "@/lib/types/room";

type ZoneTemperaturesPanelProps = {
  state: DataState<Room[]>;
};

export function ZoneTemperaturesPanel({ state }: ZoneTemperaturesPanelProps) {
  const loading = state.status === "loading";
  const error = state.status === "error" ? state.message : null;
  const rooms = state.status === "ok" ? state.data : [];

  return (
    <div className="rounded-lg border border-[#c3c6d7] bg-white">
      <div className="flex items-center justify-between border-b border-[#c3c6d7] px-4 pb-[17px] pt-4">
        <h2 className="text-lg font-semibold leading-7 text-[#191b23]">
          Temperaturi camere
        </h2>
        <Link
          href="/heating"
          className="text-[13px] leading-[18px] text-[#004ac6] hover:underline"
        >
          Gestionează
        </Link>
      </div>

      <div className="p-2 pb-[19px] pt-2">
        {loading && (
          <div className="grid animate-pulse grid-cols-2 gap-1 p-2" aria-hidden>
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-[62px] rounded bg-[#e8e9f0]" />
            ))}
          </div>
        )}

        {error && <p className="px-4 py-6 text-sm text-[#b42318]">{error}</p>}

        {!loading && !error && rooms.length === 0 && (
          <p className="px-4 py-6 text-sm text-[#555f6d]">Nicio cameră configurată.</p>
        )}

        {!loading && !error && rooms.length > 0 && (
          <div className="grid grid-cols-2 gap-1">
            {rooms.map((room) => (
              <div
                key={room.id}
                className="flex h-[62px] items-center justify-between rounded border border-[#c3c6d7] bg-[#faf8ff] p-[17px]"
              >
                <span className="text-sm leading-5 text-[#191b23]">{room.name}</span>
                <span
                  className={`text-lg font-semibold leading-7 ${
                    room.is_heating ? "text-[#004ac6]" : "text-[#555f6d]"
                  }`}
                >
                  {Number(room.current_temp).toFixed(1)}°C
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
