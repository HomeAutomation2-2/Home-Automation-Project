import type { UserInfo } from "@data-types/user-info"
import { authStore } from "@services/auth-store.svelte"



export class ManageUserController
{
    given_user_id: number|undefined = undefined
    user = $state<UserInfo|undefined>(undefined)


    full_name = $derived(`${this.user?.first_name} ${this.user?.last_name}`)
    initials = $derived.by( () =>
    {
        if (!this.user)
            return "??"

        const initials = this.user.first_name[0] + this.user.last_name[0]

        return initials.toUpperCase()
    })

    cnp = $derived(this.user?.cnp ?? "")
    location = $derived(this.user?.is_home ? "Home" : "Away")
    account_type = $derived(this.user?.is_admin ? "Admin" : "User")
    is_suspended = $derived(this.user?.is_suspended ?? true)


    async reloadData()
    {
        if (!this.given_user_id)
            return

        await this.loadData(this.given_user_id)
    }


    async loadData(user_id: number)
    {
        this.given_user_id = user_id

        if (!authStore.token)
        {
            console.log("no session token. aborting")
            return
        }

        console.log("requesting user info...")

        const response = await fetch(`${authStore.server_url}/users/${user_id}`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${authStore.token}`,
                "Content-Type": "application/json"
            }
        })

        if (!response.ok)
        {
            throw new Error("Failed to fetch user profile")
        }

        this.user = await response.json()
        console.log(this.user)
    }


    async deleteAccount()
    {
        if (!this.given_user_id)
        {
            console.log("no user ID set")
            return false
        }

        if (!authStore.token)
        {
            console.log("no session token. aborting")
            return false
        }

        console.log("deleting user...")

        const response = await fetch(`${authStore.server_url}/users/${this.given_user_id}`, {
            method: "DELETE",
            headers: {
                "Authorization": `Bearer ${authStore.token}`,
                "Content-Type": "application/json"
            }
        })

        if (!response.ok)
        {
            throw new Error("Failed to delete user")
        }
        
        return true
    }


    async suspendOrEnableAccount()
    {
        if (!this.given_user_id)
        {
            console.log("no user ID set")
            return false
        }

        if (!authStore.token)
        {
            console.log("no session token. aborting")
            return false
        }

        console.log("deleting user...")

        const response = await fetch(`${authStore.server_url}/users/${this.given_user_id}/suspend`, {
            method: "PATCH",
            headers: {
                "Authorization": `Bearer ${authStore.token}`,
                "Content-Type": "application/json"
            }
        })

        if (!response.ok)
        {
            throw new Error("Failed to suspend user")
        }
        
        return true
    }
}