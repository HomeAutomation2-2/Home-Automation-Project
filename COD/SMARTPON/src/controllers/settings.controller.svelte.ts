import type { HomeSettings } from "@data-types/home-settings"
import { api } from "@services/api"



export class SettingsController
{
    histerezis_original = $state(0)
    histerezis = $state(0)

    antifreeze_original = $state(0)
    antifreeze = $state(0)

    sampling_period_original = $state(60)
    sampling_period = $state(60)

    error = $state("")

    is_histerezis_modified = $derived(this.histerezis !== this.histerezis_original)
    is_antifreeze_modified = $derived(this.antifreeze !== this.antifreeze_original)
    is_sampling_period_modified = $derived(this.sampling_period !== this.sampling_period_original)
    is_modified = $derived(this.is_antifreeze_modified || this.is_histerezis_modified || this.is_sampling_period_modified)


    /**
     * Get the settings from the server.
     */
    async loadData(): Promise<void>
    {
        const result = await api.get("/home-settings")

        if (!result.ok)
            return

        const data: HomeSettings = await result.json()

        this.histerezis = data.hysteresis
        this.histerezis_original = data.hysteresis
        this.antifreeze = data.antifreezeTemp
        this.antifreeze_original = data.antifreezeTemp
        this,this.sampling_period = data.samplingPeriod
        this.sampling_period_original = data.samplingPeriod
    }


    /**
     * Update the data on the server.
     * @returns `true` if the data was updated, else `false`.
     */
    async onSave(): Promise<boolean>
    {
        const result = await api.patch("/home-settings", { 
            histerezis: this.histerezis, 
            antifreeze: this.antifreeze,
            sampling_period: this.sampling_period
        })

        if (!result.ok)
        {
            this.error = "Could not update the values"
            return false
        }

        this.histerezis_original = this.histerezis
        this.antifreeze_original = this.antifreeze
        this.sampling_period_original = this.sampling_period

        return true
    }


    /**
     * Cancel the changes.
     */
    onCancel(): void
    {
        this.histerezis = this.histerezis_original
        this.antifreeze = this.antifreeze_original
        this.sampling_period = this.sampling_period_original
    }
}