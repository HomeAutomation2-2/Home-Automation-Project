<script lang="ts">
    import ErrorBanner from "../../components/error-banner.svelte";
    import RoomTempCard from "../../components/room-temp-card.svelte";
    import TopbarBack from "../../components/topbar-back.svelte";


    let has_server_connection = $state(false)
    let is_heating = $state(false)
</script>



<TopbarBack 
    page_name="Bedroom program"
/>

{#if !has_server_connection}
    <ErrorBanner 
        message="Can’t contact to server. Functionality is limited."
    />
{/if}

<div class="content">
    {#if !is_heating}
        <div class="heat-info">
            <span>Heating has been disabled.</span>
            <span class="muted">Select any program to re-enable it.</span>
        </div>
    {/if}

    <RoomTempCard 
        current_temp={19.2}
        target_temp={21}
        is_heating={is_heating}
    />
</div>


<style>
    .content {
        display: flex;
        flex-direction: column;
        padding: 16px;
        gap: 8px;
    }

    .heat-info {
        display: flex;
        flex-direction: column;
        gap: 4px;
        padding-bottom: 20px;
        text-align: center;
    }

    .muted {
        color: var(--text-secondary);
    }
</style>