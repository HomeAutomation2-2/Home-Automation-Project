import { Preferences } from '@capacitor/preferences'
import { api } from './api'
import type { AccessEvent } from '@data-types/access'


const STORAGE_KEY = 'offline_access_events'


export class AccessService 
{
    /**
     * Handles a new access event. Tries to push it to the server, but if it failed it saves it locally to be sent later.
     * @param direction The direction the of the user, `in` for into the house, else `out`.
     */
    async saveEvent(direction: 'in' | 'out'): Promise<void> 
    {
        const event: AccessEvent = {
            direction,
            occurred_at: new Date().toISOString(),
        }

        try {
            const response = await api.post('/events/access-sync', {
                events: [{ direction: event.direction, occurred_at: event.occurred_at }]
            })

            if (response.ok) 
            {
                return
            }
        } 
        catch { }

        const events = await this.getLocalEvents()
        events.push(event)

        await Preferences.set({
            key: STORAGE_KEY,
            value: JSON.stringify(events)
        })
    }


    /**
     * Tries to send all pending events to the server. Removes all sent events from the local storage.
     */
    async syncPendingEvents(): Promise<void> 
    {
        const events = await this.getLocalEvents()

        if (events.length === 0) 
            return

        try {
            const response = await api.post("/events/access-sync", {
                events: events
            })

            if (response.ok) 
            {
                await Preferences.remove({ key: STORAGE_KEY })
            }
        } 
        catch {
        }
    }


    /**
     * Gets all access events from local storage.
     * @returns A list of access events.
     */
    private async getLocalEvents(): Promise<AccessEvent[]> 
    {
        const result = await Preferences.get({ key: STORAGE_KEY })

        if (!result.value) 
            return []
        
        try {
            return JSON.parse(result.value)
        } 
        catch {
            return []
        }
    }
}



export const accessService = new AccessService()