import type { Room, RoomForTempDisplay } from "@data-types/room";
import type { TempProgram } from "@data-types/temp-program";
import type { TimeSlot } from "@data-types/time-slot";



const DAY_NAMES = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export function getNextProgramTemp(
    program: TempProgram, 
    now: Date = new Date()
): { temp: number, time: string, day?: string } | null 
{
    const currentDay = getCurrentDayIndex(now);
    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    const period = program.schedule.find(p => p.days.includes(currentDay));

    if (period && period.slots.length > 0) {
        const sortedSlots = [...period.slots].sort((a, b) => 
            timeToMinutes(a.time) - timeToMinutes(b.time)
        );

        let activeIndex = sortedSlots.length - 1;
        for (let i = sortedSlots.length - 1; i >= 0; i--) {
            if (timeToMinutes(sortedSlots[i].time) <= currentMinutes) {
                activeIndex = i;
                break;
            }
        }

        if (activeIndex < sortedSlots.length - 1) {
            const next = sortedSlots[activeIndex + 1];
            return { temp: parseTemp(next.temp), time: next.time };
        }
    }

    // No period today, or last slot of the day — walk forward through the week
    for (let offset = 1; offset <= 7; offset++) {
        const nextDay = (currentDay + offset) % 7;
        const nextPeriod = program.schedule.find(p => p.days.includes(nextDay));

        if (nextPeriod && nextPeriod.slots.length > 0) {
            const nextSorted = [...nextPeriod.slots].sort((a, b) =>
                timeToMinutes(a.time) - timeToMinutes(b.time)
            );
            return {
                temp: parseTemp(nextSorted[0].temp),
                time: nextSorted[0].time,
                day: DAY_NAMES[nextDay]
            };
        }
    }

    return null;
}

function timeToMinutes(timeStr: string): number 
{
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours * 60 + minutes;
}

function parseTemp(t: number | 'off' | 'antifreeze'): number 
{
    if (t === 'off') return 4.0;
    if (t === 'antifreeze') return 7.0;
    return t;
}

function getCurrentDayIndex(now: Date): number 
{
    const jsDay = now.getDay();
    return jsDay === 0 ? 6 : jsDay - 1;
}

function getActiveSlot(program: TempProgram, now: Date = new Date()): TimeSlot | null 
{
    const currentDay = getCurrentDayIndex(now);
    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    const period = program.schedule.find(p => p.days.includes(currentDay));
    if (!period || period.slots.length === 0) return null;

    const sortedSlots = [...period.slots].sort((a, b) => 
        timeToMinutes(a.time) - timeToMinutes(b.time)
    );

    let activeIndex = sortedSlots.length - 1;
    for (let i = sortedSlots.length - 1; i >= 0; i--) {
        if (timeToMinutes(sortedSlots[i].time) <= currentMinutes) {
            activeIndex = i;
            break;
        }
    }

    return sortedSlots[activeIndex];
}

function getNextSlot(program: TempProgram, now: Date = new Date()): TimeSlot | null 
{
    const currentDay = getCurrentDayIndex(now);
    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    const period = program.schedule.find(p => p.days.includes(currentDay));
    if (!period || period.slots.length === 0) return null;

    const sortedSlots = [...period.slots].sort((a, b) => 
        timeToMinutes(a.time) - timeToMinutes(b.time)
    );

    let activeIndex = sortedSlots.length - 1;
    for (let i = sortedSlots.length - 1; i >= 0; i--) {
        if (timeToMinutes(sortedSlots[i].time) <= currentMinutes) {
            activeIndex = i;
            break;
        }
    }

    const nextIndex = (activeIndex + 1) % sortedSlots.length;
    return sortedSlots[nextIndex];
}

export function getCurrentProgramTemp(program: TempProgram, now: Date = new Date()): number | null 
{
    const slot = getActiveSlot(program, now);
    return slot ? parseTemp(slot.temp) : null;
}

export function processRoomForDisplay(
    room: Room,
    programs: TempProgram[],
    now: Date = new Date()
): RoomForTempDisplay | Room 
{
    if (room.temp_program_id === null) return room;

    const program = programs.find(p => p.id === room.temp_program_id);
    if (!program) 
    {
        console.log(`Program with ID ${room.temp_program_id} is not in temp program list`);
        return room;
    }

    const currentTemp = getCurrentProgramTemp(program, now);
    const next = getNextProgramTemp(program, now);

    return {
        ...room,
        target_temp: currentTemp ?? 0,
        next_temp: next?.temp ?? 0,
        next_temp_time: next?.day ? `${next.day} ${next.time}` : next?.time ?? "--:--",
        program_name: program.name
    };
}