import { Preferences } from '@capacitor/preferences'
import { accessService } from '@services/access-service'
import { api } from '@services/api'
import { describe, it, expect, beforeEach, vi, type Mock } from 'vitest' // Added Vitest imports



vi.mock('@capacitor/preferences', () => ({
    Preferences: {
        get: vi.fn(),
        set: vi.fn(),
    }
}))

vi.mock('@services/api', () => ({
    api: {
        post: vi.fn()
    }
}))



describe('AccessService', () => 
{
    beforeEach(() => 
    {
        vi.clearAllMocks()
    })


    it('trimite evenimentul direct la server dacă conexiunea e disponibilă', async () => 
    {
        (api.post as Mock).mockResolvedValue({ ok: true })

        await accessService.saveEvent('in')

        expect(api.post).toHaveBeenCalledWith('/events/access-sync', {
            events: [expect.objectContaining({
                direction: 'in',
            })]
        })
        expect(Preferences.set).not.toHaveBeenCalled()
    })


    it('stochează local dacă serverul nu e disponibil', async () => 
    {
        (api.post as Mock).mockRejectedValue(new Error('Network error'))
        ;(Preferences.get as Mock).mockResolvedValue({ value: '[]' })

        await accessService.saveEvent('out')

        expect(Preferences.set).toHaveBeenCalledWith({
            key: 'offline_access_events',
            value: expect.stringContaining('"direction":"out"')
        })
    })

    
    it('syncPendingEvents trimite evenimentele stocate local', async () => 
    {
        const localEvents = [
            { direction: 'in', occurred_at: '2026-01-01T10:00:00Z' },
            { direction: 'out', occurred_at: '2026-01-01T11:00:00Z' }
        ]

        ;(Preferences.get as Mock).mockResolvedValue({ 
            value: JSON.stringify(localEvents) 
        })
        ;(api.post as Mock).mockResolvedValue({ ok: true })

        await accessService.syncPendingEvents()

        expect(api.post).toHaveBeenCalledWith('/events/access-sync', {
            events: expect.arrayContaining([
                expect.objectContaining({ direction: 'in' }),
                expect.objectContaining({ direction: 'out' })
            ])
        })
        expect(Preferences.set).not.toHaveBeenCalled()
    })


    it('syncPendingEvents nu face nimic dacă nu sunt evenimente locale', async () => 
    {
        ;(Preferences.get as Mock).mockResolvedValue({ value: null })

        await accessService.syncPendingEvents()

        expect(api.post).not.toHaveBeenCalled()
    })
})