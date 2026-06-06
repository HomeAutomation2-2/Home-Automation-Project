import { Preferences } from '@capacitor/preferences';


class AuthStore 
{
    _token_key = "auth_token"
    token: string = $state("")

    _server_url_key = "server_url"
    server_url: string = $state("")

    _is_admin_key = "is_user_admin"
    is_admin: boolean = false;

    _bt_code_key = "bt_access_code"
    bt_code: string = $state("")

    _is_home_key = "is_home"
    is_home: boolean = $state(false)

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

            const saved_bt = await Preferences.get({ key: this._bt_code_key })
            if (saved_bt.value)
                this.bt_code = saved_bt.value

            const saved_is_home = await Preferences.get({ key: this._is_home_key })
            if (saved_is_home.value)
                this.is_home = saved_is_home.value === "true"
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

    async setBtCode(code: string)
    {
        this.bt_code = code
        await Preferences.set({ key: this._bt_code_key, value: code })
    }

    async setIsHome(is_home: boolean)
    {
        this.is_home = is_home
        await Preferences.set({ key: this._is_home_key, value: is_home ? "true" : "false" })
    }


    async logout() 
    {
        this.token = ""
        await Preferences.remove({ key: this._token_key })
        this.server_url = ""
        await Preferences.remove({ key: this._server_url_key })
        this.bt_code = ""
        await Preferences.remove({ key: this._bt_code_key })
        this.is_home = false
        await Preferences.remove({ key: this._is_home_key })
        this.is_admin = false
        await Preferences.remove({ key: this._is_admin_key })
    }
}


export const authStore = new AuthStore();