import { Preferences } from '@capacitor/preferences';


class AuthStore 
{
    _token_key = "auth_token"
    token: string = $state("")

    _server_url_key = "server_url"
    server_url: string = $state("")

    isAuthenticated: boolean = $derived(this.token !== "")


    async init() 
    {
        try {
            const saved_token = await Preferences.get({ key: this._token_key })
            if (saved_token.value) this.token = saved_token.value

            const saved_url = await Preferences.get({ key: this._server_url_key })
            if (saved_url.value) this.server_url = saved_url.value
        } 
        catch (e) {
            console.error("Error while reading the session token:", e)
        }
    }


    async setToken(new_token: string) 
    {
        this.token = new_token
        await Preferences.set({ key: this._token_key, value: new_token })
    }


    async setUrl(new_url: string) 
    {
        this.server_url = new_url
        await Preferences.set({ key: this._server_url_key, value: new_url })
    }


    async logout() 
    {
        this.token = ""
        await Preferences.remove({ key: this._token_key })
        this.server_url = ""
        await Preferences.remove({ key: this._server_url_key })
    }
}


export const authStore = new AuthStore();