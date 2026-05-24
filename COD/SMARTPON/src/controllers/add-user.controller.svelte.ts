import { authStore } from "@services/auth-store.svelte"



export class AddUserController
{
    first_name = $state("")
    last_name = $state("")
    cnp = $state("")
    phone_number = $state("")
    password = $state("")
    is_admin = $state(false)

    first_name_error = $state("")
    last_name_error = $state("")
    cnp_error = $state("")
    phone_number_error = $state("")
    password_error = $state("")


    async createUser()
    {
        this.first_name_error = ""
        this.last_name_error = ""
        this.cnp_error = ""
        this.phone_number_error = ""
        this.password_error = ""

        this.first_name = this.first_name.trim()
        this.last_name = this.last_name.trim()
        this.cnp = this.cnp.trim()
        this.phone_number = this.phone_number.trim()

        if (this.first_name === "")
        {
            this.first_name_error = "Please entry a name"
            return
        }

        if (this.last_name === "")
        {
            this.last_name_error = "Please entry a name"
            return
        }

        if (this.cnp.length !== 13)
        {
            this.cnp_error = `CNP has to be 13 characters long (currently ${this.cnp.trim().length})`
            return
        }
        else if (!this._isNumericString(this.cnp))
        {
            this.cnp_error = `CNP has to be all numbers`
            return
        }

        if (this.phone_number.length < 10)
        {
            this.phone_number_error = "Phone number has to be 10 characters long"
            return
        }

        if (this.password.length < 6)
        {
            this.password_error = "Password has to be minimum 6 caracters"
            return
        }

        const new_user = JSON.stringify({
            firstName: this.first_name,
            lastName: this.last_name,
            cnp: this.cnp,
            phone: this.phone_number,
            password_plaintext: this.password,
            isAdmin: this.is_admin,
        })
        console.log(new_user)

        const response = await fetch(`${authStore.server_url}/users/register`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: new_user
        })

        const data = await response.json()

        if (!response.ok)
        {
            if (response.status == 409)
            {
                this.phone_number_error = "A user with this phone number of CNP already exists"
                this.cnp_error = "A user with this phone number of CNP already exists"

                return false
            }
            else
            {
                this.password_error = "Some error occured while trying to create the user"
                throw new Error(data.message)
            }
        }

        return true
    }


    _isNumericString(value: string): boolean 
    {
        return /^\d+$/.test(value);
    }
}