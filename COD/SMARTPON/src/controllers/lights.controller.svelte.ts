import type { LightZone } from "@data-types/light-zone";
import type { Room } from "@data-types/room";
import { authStore } from "@services/auth-store.svelte";



export class LightsController
{
    rooms = $state<Room[]>([])
    zones = $state<LightZone[]>([])
    room_error = $state("")
    zone_error = $state("")

    async loadLights()
    {
        this.room_error = ""

        try {
            const [rooms_response, zones_response] = await Promise.all([
                fetch(`${authStore.server_url}/rooms`),
                fetch(`${authStore.server_url}/light-zones`)
            ])

            if (!rooms_response.ok || !zones_response.ok) 
                throw new Error("Failed to fetch dashboard data")

            this.rooms = await rooms_response.json()
            this.zones = await zones_response.json()
        } 
        catch (err: any) {
            this.room_error = err.message || "A network error occurred"
        } 
    }

    getRoomName(id?: number)
    {
        if (!id) return

        return this.rooms.find(it => it.id === id)?.name || ""
    }

    async toggleZone(zoneId: number, currentStatus: boolean) 
    {
        const zone = this.zones.find(it => it.id === zoneId)
        
        if (!zone) return

        const old_status = zone.is_on
        zone.is_on = !currentStatus

        try {
            const response = await fetch(`${authStore.server_url}/light-zones/${zoneId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ is_on: zone.is_on })
            })

            if (!response.ok) 
                throw new Error()
        } 
        catch (err) {
            zone.is_on = old_status
            alert("Could not change light state because of a server error")
        }
    }


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
            const response = await fetch(`${authStore.server_url}/light-zones`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    name: name,
                    room_id: roomId
                })
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

    getZonesForRoom(room_id: number)
    {
        return this.zones.filter(it => it.room_id === room_id)
    }
}