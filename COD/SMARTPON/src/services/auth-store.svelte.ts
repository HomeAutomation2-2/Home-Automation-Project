import { Preferences } from '@capacitor/preferences';


class AuthStore 
{
    _token_key = "auth_token"
    token: string = $state("")

    _server_url_key = "server_url"
    server_url: string = $state("")

    _is_admin_key = "is_user_admin"
    is_admin: boolean = false;

    isAuthenticated: boolean = $derived(this.token !== "")


    async init() 
    {
        try {
            const saved_token = await Preferences.get({ key: this._token_key })
            if (saved_token.value) 
                this.token = saved_token.value

            const saved_url = await Preferences.get({ key: this._server_url_key })
            if (saved_url.value) 
                this.server_url = saved_url.value

            const saved_status = await Preferences.get({ key: this._is_admin_key })
            if (saved_status.value) 
                this.is_admin = saved_status.value === "true"
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

    async setStatus(is_admin: boolean)
    {
        this.is_admin = is_admin
        await Preferences.set({ key: this._is_admin_key, value: is_admin ? "true" : "false" })
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