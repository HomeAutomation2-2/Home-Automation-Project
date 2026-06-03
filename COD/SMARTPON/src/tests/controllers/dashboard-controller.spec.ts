import { DashboardController } from "@controllers/dashboard.controller.svelte"
import { describe, it, expect, beforeEach } from 'vitest'


describe('DashboardController', () => 
{
    let controller: DashboardController


    beforeEach(() => {
        controller = new DashboardController()
    })


    describe('getRoomName', () => 
    {
        it('returnează numele camerei pentru un id valid', () => 
        {
            controller.rooms = [
                { id: 1, name: 'Living', is_heating: false, offset_value: 1, current_temp: 1, temp_program_id: 1 }, 
                { id: 2, name: 'Dormitor', is_heating: false, offset_value: 1, current_temp: 1, temp_program_id: 1 }
            ]

            expect(controller.getRoomName(1)).toBe('Living')
        })

        it('returnează undefined pentru un id inexistent', () => 
        {
            controller.rooms = [{ id: 1, name: 'Living', is_heating: false, offset_value: 1, current_temp: 1, temp_program_id: 1 }]

            expect(controller.getRoomName(99)).toBeUndefined()
        })
    })


    describe('getZonesForRoom', () => 
    {
        it('returnează doar zonele pentru camera specificată', () => 
        {
            controller.zones = [
                { id: 1, room_id: 1, name: 'Lumina principala', is_on: false },
                { id: 2, room_id: 2, name: 'Lumina dormitor', is_on: true },
                { id: 3, room_id: 1, name: 'Lumina secundara', is_on: false },
            ]

            const result = controller.getZonesForRoom(1)

            expect(result).toHaveLength(2)
            expect(result.every(z => z.room_id === 1)).toBe(true)
        })
    })
})