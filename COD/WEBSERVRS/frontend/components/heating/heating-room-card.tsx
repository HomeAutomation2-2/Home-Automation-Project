import Link from "next/link";
import type { RoomForDisplay } from "@/lib/heating/room-temp-join";

type HeatingRoomCardProps = {
  room: RoomForDisplay;
};

export function HeatingRoomCard({ room }: HeatingRoomCardProps) {
  return (
    <article className="flex flex-col gap-4 rounded-lg border border-[#c3c6d7] bg-white p-[17px] shadow-[0px_2px_4px_-1px_rgba(0,0,0,0.02)]">
      <div className="flex items-start justify-between gap-2">
        <div>
          <h3 className="text-lg font-semibold text-[#191b23]">{room.name}</h3>
          <p className="mt-0.5 text-xs uppercase tracking-[0.6px] text-[#555f6d]">
            {room.program_name ?? "Fără program"}
          </p>
        </div>
        <span
          className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold ${
            room.is_heating
              ? "bg-[rgba(220,38,38,0.1)] text-[#b42318]"
              : "bg-[#ededf9] text-[#555f6d]"
          }`}
        >
          <span
            className={`size-1.5 rounded-full ${
              room.is_heating ? "bg-[#b42318]" : "bg-[#9ca3af]"
            }`}
            aria-hidden
          />
          {room.is_heating ? "Încălzește" : "Inactiv"}
        </span>
      </div>

      <div className="grid grid-cols-3 gap-3 rounded-lg border border-[#c3c6d7] bg-[#faf8ff] p-3 text-center">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.6px] text-[#555f6d]">
            Curentă
          </p>
          <p className="text-xl font-semibold text-[#191b23]">
            {room.current_temp.toFixed(1)}°C
          </p>
        </div>
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.6px] text-[#555f6d]">
            Țintă
          </p>
          <p className="text-xl font-semibold text-[#191b23]">
            {room.target_temp !== null ? `${room.target_temp.toFixed(1)}°C` : "—"}
          </p>
        </div>
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.6px] text-[#555f6d]">
            Offset
          </p>
          <p className="text-xl font-semibold text-[#191b23]">
            {room.offset_value >= 0 ? "+" : ""}
            {room.offset_value.toFixed(1)}°C
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <Link
          href={`/heating/${room.id}/settings`}
          className="rounded border border-[#c3c6d7] bg-white px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.6px] text-[#191b23] hover:border-[#004ac6] hover:text-[#004ac6]"
        >
          Setări cameră
        </Link>
        <Link
          href="/heating/programs"
          className="rounded border border-[#c3c6d7] bg-white px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.6px] text-[#555f6d] hover:text-[#004ac6]"
        >
          Programe
        </Link>
      </div>
    </article>
  );
}
