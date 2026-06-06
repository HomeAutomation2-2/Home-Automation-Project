<script lang="ts">
    import ErrorBanner from "@components/error-banner.svelte";
    import FloatingActionButton from "@components/floating-action-button.svelte";
    import RoomStatusCard from "@components/room-status-card.svelte";
    import { DashboardController } from "@controllers/dashboard.controller.svelte";
    import { getContext, onMount } from "svelte";

    
    const dash_controller = getContext("dashboard-controller") as DashboardController
    
    let has_server_connection = $state(false)

    onMount(() => 
    {
        const interval = setInterval( () => 
        {
			dash_controller.loadData()
		}, 30_000)

		return () => 
        {
			clearInterval(interval);
		}
	})
</script>



{#if !has_server_connection}
    <ErrorBanner 
        message="Can’t contact to server. Functionality is limited."
    />
{/if}

<div class="cards">
    {#each dash_controller.getRoomsForTempDisplay() as room (room.id)}
        {#if room.temp_program_id === null}
            <RoomStatusCard 
                href={`/room/${room.id}`}
                room_name={room.name}
                enabled={false}
            />
        {:else}
            <RoomStatusCard 
                href={`/room/${room.id}`}
                room_name={room.name}
                current_temp={room.current_temp}
                target_temp={room.target_temp}
                program={room.program_name}
                next_temp={room.next_temp}
                next_temp_time={room.next_temp_time}
                is_heating={room.is_heating}
            />
        {/if}
    {/each}
</div>

<div class="fab">
    <FloatingActionButton 
        href="/add-room"
    />
</div>



<style>
    .cards {
        display: flex;
        flex-direction: column;
        padding: 16px;
        gap: 8px;
    }

    .fab {
        position: absolute;
        right: 24px;
        bottom: 24px;
    }
</style>