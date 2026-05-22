import { Preferences } from '@capacitor/preferences';


class AuthStore 
{
    token: string = $state("")

    isAuthenticated: boolean = $derived(this.token !== "")


    async init() 
    {
        try {
            const { value } = await Preferences.get({ key: "auth_token" })
            if (value) 
            {
                this.token = value
            }
        } 
        catch (e) {
            console.error("Error while reading the session token:", e)
        }
    }


    async setToken(newToken: string) 
    {
        this.token = newToken
        await Preferences.set({ key: "auth_token", value: newToken })
    }


    async logout() 
    {
        this.token = ""
        await Preferences.remove({ key: 'auth_token' })
    }
}


export const authStore = new AuthStore();