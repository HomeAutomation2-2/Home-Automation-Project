import type { Room } from "@data-types/room";
import type { TempProgram } from "@data-types/temp-program";
import { authStore } from "@services/auth-store.svelte";
import { getCurrentProgramTemp } from "@services/room-temp-join";



export class RoomTempController
{
    given_room_id?: number
    room = $state<Room|undefined>(undefined)
    room_program_id = $state<number|null>(null)
    temp_programs = $state<TempProgram[]>([])
    error = $state("")

    target_temp = $derived.by( () =>
    {
        if (!this.room || !this.room.temp_program_id)
            return undefined

        const program = this.temp_programs.find(it => it.id === this.room?.temp_program_id)

        if (!program)
            return undefined

        return getCurrentProgramTemp(program)
    })


    async setRoomProgram(id: number|null)
    {
        if (!this.room)
            return

        this.room_program_id = id

        const response = await fetch(`${authStore.server_url}/rooms/${this.room.id}/temp-program`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ temp_program_id: id })
        });

        if (!response.ok)
            this.room_program_id = this.room?.temp_program_id ?? null
        else
            this.room.temp_program_id = id
    }


    async loadData(room_id: number)
    {
        this.error = ""
        this.given_room_id = room_id

        try {
            const [room_response, programs_response] = await Promise.all([
                fetch(`${authStore.server_url}/rooms/${room_id}`),
                fetch(`${authStore.server_url}/heating-programs`),
            ])

            if (!room_response.ok) 
                throw new Error("Failed to fetch room data")

            if (!programs_response.ok) 
                throw new Error("Failed to fetch temp program data")

            this.room = await room_response.json()
            this.temp_programs = await programs_response.json()
            this.room_program_id = this.room?.temp_program_id ?? null
        } 
        catch (err: any) {
            this.error = err.message || "A network error occurred"
        } 
    }
}