"use client";



import Link from "next/link";

import { useMemo, useState } from "react";

import {

  IconHeatingActive,

  IconHeatingIdle,

  IconHeatingManual,

  IconHeatingMenu,

  IconHeatingSchedule,

} from "@/components/heating/heating-icons";

import {

  formatDisplayTemp,

  type RoomForDisplay,

} from "@/lib/heating/room-temp-join";



type HeatingRoomCardProps = {

  room: RoomForDisplay;

};



function ModeBadge({ room }: { room: RoomForDisplay }) {

  const manual = room.program_name === null;

  const label = manual ? "Manual" : room.program_name;



  return (

    <span

      className="inline-flex max-w-[120px] shrink-0 items-center gap-1 border border-[#c3c6d7] bg-[#ededf9] px-[9px] py-[5px] text-xs font-semibold uppercase tracking-[0.6px] text-[#555f6d]"

      title={manual ? undefined : room.program_name ?? undefined}

    >

      {manual ? (

        <IconHeatingManual className="shrink-0 text-[#555f6d]" />

      ) : (

        <IconHeatingSchedule className="shrink-0 text-[#555f6d]" />

      )}

      <span className="truncate">{label}</span>

    </span>

  );

}



function buildScheduleHint(room: RoomForDisplay): string | null {

  if (room.program_name === null) return null;

  if (room.active_slot_since && room.next_change_at) {

    return `Interval ${room.active_slot_since} → ${room.next_change_at}`;

  }

  if (room.active_slot_since) {

    return `Interval activ de la ${room.active_slot_since}`;

  }

  return room.program_name;

}



export function HeatingRoomCard({ room }: HeatingRoomCardProps) {

  const [menuOpen, setMenuOpen] = useState(false);

  const heating = room.is_heating;

  const targetLabel =
    room.target_temp !== null ? formatDisplayTemp(room.target_temp) : "—";

  const currentLabel = formatDisplayTemp(room.current_temp);

  const scheduleHint = useMemo(() => buildScheduleHint(room), [room]);



  return (

    <article

      className={`relative flex h-full min-h-[168px] flex-col justify-between overflow-visible rounded border border-[#e1e2ed] bg-white p-[17px] shadow-[0px_1px_1px_rgba(0,0,0,0.05)] ${

        heating ? "shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)]" : ""

      }`}

    >

      {heating && (

        <span

          className="pointer-events-none absolute bottom-0 left-0 top-0 w-1 rounded-l bg-[#004ac6]"

          aria-hidden

        />

      )}



      <div className="flex items-start justify-between gap-2 pb-3">

        <h3 className="min-w-0 flex-1 truncate text-sm font-semibold text-[#191b23]">

          {room.name}

        </h3>

        <ModeBadge room={room} />

      </div>



      <div className="flex items-end gap-2 pb-2">

        <p

          className={`text-[30px] font-semibold leading-[30px] tracking-[-0.6px] ${

            heating ? "text-[#004ac6]" : "text-[#191b23]"

          }`}

        >

          {currentLabel}

        </p>

        <div className="min-w-0 pb-1">

          <p className="text-xs font-semibold uppercase tracking-[0.6px] text-[#555f6d]">

            Țintă

          </p>

          <p

            className={`truncate text-[13px] ${

              heating ? "font-medium text-[#191b23]" : "text-[#555f6d]"

            }`}

          >

            {targetLabel}

          </p>

        </div>

      </div>



      {scheduleHint && (

        <p className="truncate pb-2 text-[12px] text-[#8a93a3]" title={scheduleHint}>

          {scheduleHint}

        </p>

      )}



      <div className="flex items-center justify-between border-t border-[#e1e2ed] pt-[9px]">

        <div className="flex min-w-0 items-center gap-1">

          {heating ? (

            <IconHeatingActive className="shrink-0 text-[#004ac6]" />

          ) : (

            <IconHeatingIdle className="shrink-0 text-[#555f6d]" />

          )}

          <span

            className={`truncate text-[13px] ${heating ? "text-[#004ac6]" : "text-[#555f6d]"}`}

          >

            {heating ? "Încălzire activă" : "Inactiv"}

          </span>

        </div>



        <div className="relative shrink-0">

          <button

            type="button"

            aria-label="Acțiuni cameră"

            aria-expanded={menuOpen}

            onClick={() => setMenuOpen((o) => !o)}

            className="flex size-8 items-center justify-center rounded text-[#555f6d] hover:bg-[#faf8ff]"

          >

            <IconHeatingMenu />

          </button>

          {menuOpen && (

            <>

              <button

                type="button"

                className="fixed inset-0 z-10 cursor-default"

                aria-label="Închide meniul"

                onClick={() => setMenuOpen(false)}

              />

              <div className="absolute right-0 top-full z-20 mt-1 min-w-[160px] rounded border border-[#c3c6d7] bg-white py-1 shadow-sm">

                <Link

                  href={`/heating/${room.id}/settings`}

                  className="block px-3 py-2 text-sm text-[#191b23] hover:bg-[#faf8ff]"

                  onClick={() => setMenuOpen(false)}

                >

                  Setări cameră

                </Link>

                <Link

                  href="/heating/programs"

                  className="block px-3 py-2 text-sm text-[#191b23] hover:bg-[#faf8ff]"

                  onClick={() => setMenuOpen(false)}

                >

                  Programe

                </Link>

              </div>

            </>

          )}

        </div>

      </div>

    </article>

  );

}

