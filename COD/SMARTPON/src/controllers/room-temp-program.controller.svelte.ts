import type { Room } from "@data-types/room";
import type { TempProgram } from "@data-types/temp-program";
import { api } from "@services/api";
import { getCurrentProgramTemp } from "@services/room-temp-join";



export class RoomTempController
{
    given_room_id?: number
    room = $state<Room|undefined>(undefined)
    room_program_id = $state<number|null>(null)
    temp_programs = $state<TempProgram[]>([])

    error = $state("")
    offset_error = $state("")
    is_edit_offset = $state(false)
    
    offset = $derived(this.room?.offset_value ?? 0)
    target_temp = $derived.by( () =>
    {
        if (!this.room || !this.room.temp_program_id)
            return undefined

        const program = this.temp_programs.find(it => it.id === this.room?.temp_program_id)

        if (!program)
            return undefined

        return getCurrentProgramTemp(program)
    })


    /**
     * Assign a new progrom to the room.
     * @param id The ID of the program.
     */
    async setRoomProgram(id: number|null): Promise<void>
    {
        if (!this.room)
            return

        this.room_program_id = id

        const response = await api.patch(`/rooms/${this.room.id}/temp-program`, { temp_program_id: id })

        if (!response.ok)
            this.room_program_id = this.room?.temp_program_id ?? null
        else
        {
            this.room.temp_program_id = id
            this.offset = this.room?.offset_value ?? 0
        }
    }


    /**
     * Change the room's offset value. If it cannot be applied it is reverted to the old one.
     * @param offset The new offset value.
     */
    async setRoomOffset(offset: number): Promise<boolean>
    {
        if (!this.room) 
            return false

        this.offset_error = ""

        const response = await api.patch(`/rooms/${this.room.id}/offset`, { offset: offset })

        if (!response.ok)
        {
            this.offset_error = "Server cannot apply this offset."
            return false
        }
        else
        {
            this.room.offset_value = offset
            return true
        }
    }



    /**
     * Request all necessary data from the server: the room info and the temp programs.
     * @param room_id The ID of the current room.
     */
    async loadData(room_id: number)
    {
        this.error = ""
        this.given_room_id = room_id

        try {
            const [room_response, programs_response] = await Promise.all([
                api.get(`/rooms/${room_id}`),
                api.get("/heating-programs")
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