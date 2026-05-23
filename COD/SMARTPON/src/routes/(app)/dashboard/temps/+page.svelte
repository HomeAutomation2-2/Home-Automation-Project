<script lang="ts">
    import ErrorBanner from "@components/error-banner.svelte";
    import FloatingActionButton from "@components/floating-action-button.svelte";
    import RoomStatusCard from "@components/room-status-card.svelte";

    
    let has_server_connection = $state(false)
</script>




{#if !has_server_connection}
    <ErrorBanner 
        message="Can’t contact to server. Functionality is limited."
    />
{/if}

<div class="cards">
    <RoomStatusCard 
        room_name="Bedroom"
        current_temp={19.1}
        target_temp={21}
        program="Winter school week"
        next_temp={20}
        next_temp_time="16:30"
        is_heating={true}
    />

    <RoomStatusCard 
        room_name="Living room"
        current_temp={19}
        target_temp={17}
        program="Winter"
        next_temp={19}
        next_temp_time="13:00"
        is_heating={false}
    />

    <RoomStatusCard 
        room_name="Guest room"
        enabled={false}
    />
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