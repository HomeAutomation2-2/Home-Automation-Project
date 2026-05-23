import type { Period } from "@data-types/period";
import { authStore } from "@services/auth-store.svelte";



export class CreateTempController 
{
    program_name = $state("")
    error = $state("")    
    periods = $state<Period[]>([
        { days: [0], slots: [{ time: "08:00", temp: 21.0 }] }
    ])


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


    addSubprogram() 
    {
        const default_days = this.getFirstUnselectedDay()

        this.periods.push({
            days: default_days,
            slots: [{ time: "08:00", temp: 21.0 }]
        })
    }


    removeSubprogram(index: number) 
    {
        if (this.periods.length > 1) 
        {
            this.periods.splice(index, 1)
        }
    }


    async createProgram() 
    {
        if (!this.validate()) 
            return false

        const payload = {
            name: this.program_name,
            schedule: {
                periods: this.periods.map(period => ({
                    days: period.days,
                    slots: period.slots.map(slot => ({
                        time: slot.time,
                        temp: typeof slot.temp === 'string' ? slot.temp.toLowerCase() : slot.temp
                    }))
                }))
            }
        };

        try {
            const response = await fetch(`${authStore.server_url}/heating-programs`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            })

            return response.ok
        } 
        catch (err) {
            console.error(err)

            return false
        }
    }
}