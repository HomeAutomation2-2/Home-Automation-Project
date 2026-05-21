interface TimeSlot {
    time: string
    temp: number | 'off' | 'antifreeze'
}

interface Period {
    days: number[]
    slots: TimeSlot[]
}

interface Program {
    id: string
    name: string
    periods: Period[]
}

const programs: Program[] = [
    {
        id: "1",
        name: "Winter school week",
        periods: [
            {
                days: [0, 1, 2, 3, 4],
                slots: [
                    { time: "08:10", temp: 17.5 },
                    { time: "11:20", temp: 24 },
                    { time: "15:00", temp: 20 },
                    { time: "21:00", temp: 22.1 },
                ]
            },
            {
                days: [5, 6],
                slots: [
                    { time: "08:00", temp: "off" },
                    { time: "15:00", temp: 22 },
                ]
            }
        ]
    },
    {
        id: "2",
        name: "After-hour program",
        periods: [
            {
                days: [1, 2, 3, 4],
                slots: [
                    { time: "08:10", temp: 17 },
                    { time: "11:20", temp: 19 },
                    { time: "15:00", temp: 18 },
                    { time: "21:00", temp: "off" },
                ]
            },
            {
                days: [5, 6, 7],
                slots: [
                    { time: "00:00", temp: "off" },
                ]
            }
        ]
    },
    {
        id: "3",
        name: "Away holiday",
        periods: [
            {
                days: [0, 1, 2, 3, 4, 5, 6],
                slots: [
                    { time: "00:00", temp: "antifreeze" }
                ]
            }
        ]
    }
]



export class TempProgramsController
{
    programs = $state(programs)
}