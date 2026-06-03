import { api } from "@services/api"



export class CreateRoomController
{
    name = $state("")
    error = $state("")

    is_name_invalid = $derived(this.name.trim().length === 0)


    /**
     * Create a new room
     * @returns `true` if the room was created, else `false`.
     */
    async createRoom(): Promise<boolean>
    {
        const response = await api.post("/rooms", { name: this.name })
        const data = await response.json()

        if (!response.ok)
        {
            if (response.status == 409)
            {
                this.error = "A room with this name already exists"

                return false
            }
            else
                throw new Error(data.message)
        }

        return true
    }
}