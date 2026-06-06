<script lang="ts">
    import { onMount } from 'svelte'
    import { api } from '@services/api'
    import RoomChart from '@components/room-chart.svelte'

    type Room = { id: number; name: string }
    type Reading = { value: number; occuredAt: string }

    let rooms: Room[] = $state([])
    let readings: Record<number, Reading[]> = $state({})
    let loading = $state(true)

    onMount(async () => {
        const roomsRes = await api.get('/rooms')
        rooms = await roomsRes.json()

        const results = await Promise.all(
            rooms.map(r => 
                api.get(`/temperature-readings?room_id=${r.id}`)
                    .then(res => res.json())
                    .then(data => ({ id: r.id, data }))
            )
        )

        results.forEach(r => readings[r.id] = r.data)
        loading = false
        console.log(results)
    })
</script>

{#if loading}
    <p>Loading...</p>
{:else}
    <div class="charts">
        {#each rooms as room}
            <RoomChart
                room_name={room.name}
                readings={readings[room.id] ?? []}
            />
        {/each}
    </div>
{/if}

<style>
    .charts {
        display: flex;
        flex-direction: column;
        padding: 1rem;
    }
</style>