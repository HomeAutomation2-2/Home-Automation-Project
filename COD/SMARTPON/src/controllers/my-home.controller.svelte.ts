import type { UnifiedLog } from "@data-types/log";
import type { UserPresence } from "@data-types/user-presence";
import { api } from "@services/api";



export class MyHomeController
{
    users_presence = $state<UserPresence[]>([])
    logs = $state<UnifiedLog[]>([])

    presence_load_error = $state("")
    logs_load_error = $state("")

    users_total = $derived(this.users_presence.length)
    users_home = $derived(this.users_presence.filter(it => it.is_home).length)


    /**
     * Request all user presence data from the server.
     */
    async updatePresence(): Promise<void>
    {
        console.log("requesting presence...")

        this.presence_load_error = ""

        const response = await api.get("/users/presence")

        if (!response.ok)
        {
            this.presence_load_error = "Failed to fetch user presence"
            throw new Error("Failed to fetch presence")
        }

        const data: UserPresence[] = await response.json()
        this.users_presence = data
        console.log(data)
    }


    /**
     * Request logs from the server. If the current user is an admin the logs will be of all users,
     * else only current user's logs.
     */
    async updateLogs(): Promise<void>
    {
        console.log("requesting logs...")

        this.logs_load_error = ""

        const response = await api.get("/users/logs")

        if (!response.ok)
        {
            this.logs_load_error = "Failed to fetch logs"
            throw new Error("Failed to fetch logs")
        }

        const data: UnifiedLog[] = await response.json()
        this.logs = data
        console.log(data)
    }
}