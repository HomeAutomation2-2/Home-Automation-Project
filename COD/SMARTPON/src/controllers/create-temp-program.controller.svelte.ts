import type { Period } from "@data-types/period";
import { api } from "@services/api";



export class CreateTempController 
{
    program_name = $state("")
    error = $state("")    
    periods = $state<Period[]>([
        { days: [0], slots: [{ time: "08:00", temp: 21.0 }] }
    ])


    /**
     * Toggle the selection of a day in a subprogram.
     * @param periodIndex The index of the subprogram.
     * @param day The index of the day in the week.
     */
    toggleDay = (periodIndex: number, day: number) =>
    {
        const period = this.periods[periodIndex]
        const dayIdx = period.days.indexOf(day)

        if (dayIdx > -1) 
        {
            period.days.splice(dayIdx, 1)
        } 
        else 
        {
            this.periods.forEach((p, idx) => 
            {
                if (idx !== periodIndex) 
                    {
                    const otherDayIdx = p.days.indexOf(day)
                    
                    if (otherDayIdx > -1) 
                    {
                        p.days.splice(otherDayIdx, 1)
                    }
                }
            })

            period.days.push(day)
            period.days.sort()
        }
    }


    /**
     * Get the first unselected week day in program.
     * @returns A list containing the first unselected week day in the program, else an empty list.
     */
    private getFirstUnselectedDay(): number[] 
    {
        const allSelectedDays = this.periods.flatMap(p => p.days)

        for (let day = 0; day <= 6; day++) 
        {
            if (!allSelectedDays.includes(day)) 
            {
                return [day]
            }
        }

        return []
    }


    /**
     * Validate the temp program does not have overlapping days or no days selected.
     * @returns `true` if the program is valid, else `false`.
     */
    validate(): boolean 
    {
        this.error = ""

        if (!this.program_name.trim()) 
        {
            this.error = "You need to set the program name"

            return false
        }

        for (let i = 0; i < this.periods.length; i++) 
        {
            if (this.periods[i].days.length === 0) 
            {
                this.error = `Subprogram ${i + 1} has no day selected`
                
                return false
            }
            if (this.periods[i].slots.length === 0) 
            {
                this.error = `Subprogram ${i + 1} needs at least one time interval`
                
                return false
            }
        }

        for (let i = 0; i < this.periods.length; i++) 
        {
            const slots = this.periods[i].slots
            const times = slots.map(s => s.time)
            
            const hasDuplicateTimes = times.some((val, i) => times.indexOf(val) !== i)

            if (hasDuplicateTimes) 
            {
                this.error = `In subprogram ${i + 1} are duplicate time intervals`
                
                return false
            }
        }

        return true
    }


    /**
     * Create a new subprogram.
     */
    addSubprogram() 
    {
        const default_days = this.getFirstUnselectedDay()

        this.periods.push({
            days: default_days,
            slots: [{ time: "08:00", temp: 21.0 }]
        })
    }


    /**
     * Delete a subprogram.
     * @param index The index of the subprogram.
     */
    removeSubprogram(index: number) 
    {
        if (this.periods.length > 1) 
        {
            this.periods.splice(index, 1)
        }
    }


    /**
     * Create a new program on the server.
     * @returns `true` if the program was created, else `false`.
     */
    async createProgram(): Promise<boolean>
    {
        if (!this.validate()) 
            return false

        const payload = {
            name: this.program_name,
            schedule: this.periods.map(period => ({
                days: period.days,
                slots: period.slots.map(slot => ({
                    time: slot.time,
                    temp: typeof slot.temp === 'string' ? slot.temp.toLowerCase() : slot.temp
                }))
            }))
        };

        try {
            const response = await api.post("/heating-programs", payload)

            return response.ok
        } 
        catch (err) {
            console.error(err)

            return false
        }
    }
}