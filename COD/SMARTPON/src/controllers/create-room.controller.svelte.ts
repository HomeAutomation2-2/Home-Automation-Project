import { authStore } from "@services/auth-store.svelte"


export class CreateRoomController
{
    name = $state("")
    error = $state("")

    is_name_invalid = $derived(this.name.trim().length === 0)


    async createRoom(): Promise<boolean>
    {
        const response = await fetch(`${authStore.server_url}/rooms`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                name: this.name
            })
        })
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