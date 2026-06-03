import { authStore } from "@services/auth-store.svelte"
import { userStore } from "@services/user-profile"


export class LoginController
{
    given_server_url: string = $state("")
    working_server_url: string = $state("")
    server_name: string = $state("Unknown server")
    phone_number: string = $state("")
    password: string = $state("")

    select_server_error = $state("")
    login_error = $state("")

    is_url_invalid = $derived(this.given_server_url.length < 1)
    are_credentials_invalid = $derived(this.phone_number.length !== 10 || this.password.length < 6)


    /**
     * Checks if the server is reachable.
     * @returns `true` if the server responds, else `false`.
     */
    async testServerConnection()
    {
        if (!this.given_server_url) return false

        try {
            const full_url = this._makeUrlProper(this.given_server_url)

            const controller = new AbortController()
            const timeoutId = setTimeout( () => controller.abort(), 4000 )

            const response = await fetch(`${full_url}/health`, { 
                signal: controller.signal 
            })
            
            clearTimeout(timeoutId)

            if (!response.ok) 
            {
                throw new Error(`Serverul a răspuns cu status: ${response.status}`);
            }

            const data = await response.json()
            this.server_name = data.name || "Unknown server"
            this.select_server_error = ""
            this.working_server_url = full_url

            return true
        }
        catch {
            this.server_name = "Unknown server"
            this.select_server_error = "Could not reach server. Check your netwoerk connection."
            this.working_server_url = ""

            return false;
        }
    }


    /**
     * Send a login request to the server and wait for a new session to be generated.
     * @returns `true` if the login is successfull, else `false`.
     */
    async loginUser(): Promise<boolean>
    {
        if (this.working_server_url === "") 
        {
            this.login_error = "Server URL is not defined. Go back to the server selection screen and set it up."
            this.given_server_url = ""

            return false
        }

        if (!this.phone_number || !this.password) 
        {
            this.login_error = "All fields are mandatory"

            return false
        }

        try {
            const response = await fetch(`${this.working_server_url}/auth-sessions/login`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    phone_number: this.phone_number,
                    password_plaintext: this.password
                })
            })

            const data = await response.json();

            if (!response.ok) 
            {
                this.login_error = data.message || "Invalid credentials"

                return false
            }

            authStore.setToken(data.token)
            authStore.setUrl(this.working_server_url)
            console.log(data.token)
            // try twice before logging out the user if the profile cannot be loaded
            const profileFetched = await this.fetchUserProfile(data.token) || await this.fetchUserProfile(data.token)
            
            if (!profileFetched) 
            {
                this.login_error = "Login was successful but failed to fetch user data"
                
                authStore.logout()
                
                return false
            }
            
            this.login_error = ""
            
            return true;

        } 
        catch (error: any) {
            console.error(error)
            this.login_error = "Error while authentificating"

            return false
        }
    }


    /**
     * Retrieve the user info from the server.
     * @param token The user's session token.
     * @returns `true` if the user info was successfully retrieved, else `false`.
     */
    async fetchUserProfile(token: string): Promise<boolean> 
    {
        try {
            const response = await fetch(`${this.working_server_url}/users/me`, {
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                }
            })

            if (!response.ok) 
                return false

            const profileData = await response.json()
            userStore.setProfile(profileData)

            return true
        } 
        catch (error) {
            return false
        }
    }


    /**
     * Clean up the URL provided by the user.
     * @param url The URL provided by the user.
     * @returns The URL with `https` added if no protocol is specified and with trailing `/` removed.
     */
    _makeUrlProper(url: string): string
    {
        let new_url = url

        if (new_url.endsWith('/')) 
            new_url = new_url.slice(0, -1)

        if (!new_url.startsWith("http"))
            new_url = `https://${new_url}`

        return new_url
    }
}