import type { UserInfo } from "@data-types/user-info"
import { api } from "@services/api"



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


    /**
     * Re-request user data from the server.
     */
    async reloadData(): Promise<void>
    {
        if (!this.given_user_id)
            return

        await this.loadData(this.given_user_id)
    }


    /**
     * Request data for a user from the server.
     * @param user_id The ID of the user whose data is requested.
     */
    async loadData(user_id: number): Promise<void>
    {
        this.given_user_id = user_id

        console.log("requesting user info...")

        const response = await api.get(`/users/${user_id}`)

        if (!response.ok)
        {
            throw new Error("Failed to fetch user profile")
        }

        this.user = await response.json()
    }


    /**
     * Delete the user's account.
     * @returns `true` if the account was deleted, else `false`.
     */
    async deleteAccount(): Promise<boolean>
    {
        if (!this.given_user_id)
        {
            console.log("no user ID set")
            return false
        }

        console.log("deleting user...")

        const response = await api.delete(`/users/${this.given_user_id}`)

        if (!response.ok)
        {
            throw new Error("Failed to delete user")
        }
        
        return true
    }


    /**
     * Toggle the `suspended` status of the user.
     * @returns `true` if the toggle was successful, else false.
     */
    async suspendOrEnableAccount(): Promise<boolean>
    {
        if (!this.given_user_id)
        {
            console.log("no user ID set")
            return false
        }

        console.log("deleting user...")

        const response = await api.patch(`/users/${this.given_user_id}/suspend`, undefined)

        if (!response.ok)
        {
            throw new Error("Failed to suspend user")
        }
        
        return true
    }
}