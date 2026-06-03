export class UserStore 
{
    private profileKey = "app_user_profile"
    private cachedProfile: any = null
    

    async init()
    {
        console.log("Initializing UserProfile")

        const stored = localStorage.getItem(this.profileKey)

        if (!stored)
        {
            console.log("User info not set")
            return
        }

        try {
            this.cachedProfile = JSON.parse(stored);
            console.log(this.cachedProfile)
        } 
        catch {
            this.clearProfile();
        }
    }


    public getId()
    {
        return this.cachedProfile?.id
    }


    public setProfile(user: any): void 
    {
        const { passwordHash, btCodeHash, ...safeProfile } = user;
        
        this.cachedProfile = safeProfile;
        localStorage.setItem(this.profileKey, JSON.stringify(safeProfile));
    }


    public getProfile(): any | null 
    {
        return this.cachedProfile;
    }


    public clearProfile(): void 
    {
        console.log("Cleared user profile")

        this.cachedProfile = null;
        localStorage.removeItem(this.profileKey);
    }


    public isAdmin(): boolean 
    {
        const result = this.cachedProfile?.isAdmin === true
        console.log(result)

        return result
    }


    public isSuspended(): boolean 
    {
        return this.cachedProfile?.isSuspended === true;
    }
}


export const userStore = new UserStore()