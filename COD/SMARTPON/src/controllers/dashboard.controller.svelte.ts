import type { LightZone } from "@data-types/light-zone";
import type { Room, RoomForTempDisplay } from "@data-types/room";
import type { TempProgram } from "@data-types/temp-program";
import { api } from "@services/api";
import { authStore } from "@services/auth-store.svelte";
import { processRoomForDisplay } from "@services/room-temp-join";



export class DashboardController
{
    rooms_org = $state<Room[]>([])
    zones = $state<LightZone[]>([])
    temp_programs = $state<TempProgram[]>([])
    room_error = $state("")
    zone_error = $state("")

    rooms = $derived(this.rooms_org.toSorted( (a, b) => a.id - b.id ))


    /**
     * Request all data necessary from the server. This includes the rooms, light zones and heating programs.
     */    
    async loadData()
    {
        this.room_error = ""

        try {
            const [rooms_response, zones_response, programs_response] = await Promise.all([
                api.get(`/rooms`),
                api.get(`/light-zones`),
                api.get(`/heating-programs`),
            ])

            if (!rooms_response.ok) 
                throw new Error("Failed to fetch room data")

            if (!zones_response.ok) 
                throw new Error("Failed to fetch zone data")

            if (!programs_response.ok) 
                throw new Error("Failed to fetch temp program data")

            this.rooms_org = await rooms_response.json()
            this.zones = await zones_response.json()
            this.temp_programs = await programs_response.json()
        } 
        catch (err: any) {
            this.room_error = err.message || "A network error occurred"
        } 
    }


    /**
     * Get the name of a room based on it's ID.
     * @param id The ID of the room.
     * @returns The name of the room or `undefined`.
     */
    getRoomName(id?: number) : string|undefined
    {
        if (!id) 
            return undefined

        return this.rooms_org.find(it => it.id === id)?.name || undefined
    }


    /**
     * Toggles the state of a lighting zone.
     * @param zoneId The ID of the lighting zone.
     * @param currentStatus The new status of the zone, `true` for light on, `false` for light off.
     */
    async toggleZone(zoneId: number, currentStatus: boolean): Promise<void>
    {
        const zone = this.zones.find(it => it.id === zoneId)
        
        if (!zone) return

        const old_status = zone.is_on
        zone.is_on = !currentStatus

        try {
            const response = await api.patch(`/light-zones/${zoneId}`, { is_on: zone.is_on })

            if (!response.ok) 
            {
                const errorData = await response.json().catch(() => ({}))
                const errorMessage = errorData.message || `Status ${response.status}`

                throw new Error(errorMessage)
            }
        } 
        catch (err) {
            zone.is_on = old_status
            alert(`Could not change light state because of a server error:\n\n${err}`)
        }
    }


    /**
     * Create a new lighting zone.
     * @param name The name of the lighting zone.
     * @param roomId The ID of the room the zone is part of.
     * @returns `true` if the room was created, else `false` and the error message is set.
     */
    async addZone(name: string, roomId: number): Promise<boolean> 
    {
        if (!roomId)
            throw new Error("Room id has to be defined")
        
        if (name === "") 
        {
            this.zone_error = "The name cannot be empty"
            console.error("Zone name cannot be empty"

            )
            return false
        }

        try {
            const response = await api.post("/light-zones", {
                name: name,
                room_id: roomId
            })

            if (!response.ok) 
            {
                if (response.status === 409)
                {
                    this.zone_error = "A zone with this name already exists"
                    return false
                }

                const errorText = await response.text()
                throw new Error(`Failed to add zone: ${errorText}`)
            }

            const new_zone = await response.json()
            this.zones = [...this.zones, new_zone]

            return true
        } 
        catch (error) {
            console.error("Error creating zone:", error)

            return false
        }
    }


    /**
     * Get all zones associated with a specified room.
     * @param room_id The ID of the room.
     * @returns A list of all zones associated with the specified room.
     */
    getZonesForRoom(room_id: number)
    {
        return this.zones.filter(it => it.room_id === room_id)
    }


    /**
     * Get all necessary information for displaying the room temp status and the next program.
     * @returns A list of objects containing all necessary information.
     */
    getRoomsForTempDisplay(): RoomForTempDisplay[]
    {
        
        const result = this.rooms_org.map( (room) => {
            const result = processRoomForDisplay(room, this.temp_programs) 

            if (!("target_temp" in result))
                return {
                    ...result,
                    target_temp: 0,
                    next_temp: 0,
                    next_temp_time: "",
                    program_name: ""
                }
            
            return result
        })
        .sort( (a, b) => a.id - b.id)

        return result
    }
}