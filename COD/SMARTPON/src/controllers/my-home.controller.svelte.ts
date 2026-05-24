import type { UnifiedLog } from "@data-types/log";
import type { UserPresence } from "@data-types/user-presence";
import { authStore } from "@services/auth-store.svelte";



export class MyHomeController
{
    users_presence = $state<UserPresence[]>([])
    logs = $state<UnifiedLog[]>([])

    presence_load_error = $state("")
    logs_load_error = $state("")

    users_total = $derived(this.users_presence.length)
    users_home = $derived(this.users_presence.filter(it => it.is_home).length)


    async updatePresence()
    {
        if (!authStore.token)
        {
            console.log("no session token. aborting")
            return
        }

        console.log("requesting presence...")

        this.presence_load_error = ""

        const response = await fetch(`${authStore.server_url}/users/presence`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${authStore.token}`,
                "Content-Type": "application/json"
            }
        })

        if (!response.ok)
        {
            this.presence_load_error = "Failed to fetch user presence"
            throw new Error("Failed to fetch presence")
        }

        const data: UserPresence[] = await response.json()
        this.users_presence = data
        console.log(data)
    }


    async updateLogs()
    {
        if (!authStore.token)
        {
            console.log("no session token. aborting")
            return
        }

        console.log("requesting logs...")

        this.logs_load_error = ""

        const response = await fetch(`${authStore.server_url}/users/logs`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${authStore.token}`,
                "Content-Type": "application/json"
            }
        })

        if (!response.ok)
        {
            this.presence_load_error = "Failed to fetch logs"
            throw new Error("Failed to fetch logs")
        }

        const data: UnifiedLog[] = await response.json()
        this.logs = data
        console.log(data)
    }
}