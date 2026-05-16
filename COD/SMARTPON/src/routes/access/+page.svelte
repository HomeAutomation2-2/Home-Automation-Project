<script lang="ts">
    import { onDestroy } from "svelte";
    import AccessButton from "../../components/access-button.svelte";
    import ErrorBanner from "../../components/error-banner.svelte";
    import LocationSelector from "../../components/location-selector.svelte";
    import TopbarAccess from "../../components/topbar-access.svelte";
    import AccesDirection from "../../components/acces-direction.svelte";

    let has_connection = $state(false)
    let door_state = $state(0);
    let timeout: ReturnType<typeof setTimeout>;

    $effect(() => {
        if (door_state === 1) 
        {
            timeout = setTimeout(() => 
            {
                const is_unlocked = Math.random() < 0.5;
                door_state = is_unlocked ? 2 : 3
            }, 1000);
        }
    });

	onDestroy(() => {
		clearTimeout(timeout);
	});
</script>




<TopbarAccess 
    is_locked={door_state === 3 ? undefined : door_state !== 2 }
/>

{#if !has_connection}
    <ErrorBanner 
        message="Can’t contact server. Functionality is limited."
    />
{/if}

<div class="wrapper">
    <div class="date-time">
        <span class="time">15:33</span>
        <span class="date">28 Apr 2026</span>
    </div>
    
    <div class="access-button-wrapper">
        <AccessButton bind:state={door_state}/>
    </div>
    
    <div class="indicator-wrapper">
        <span>You are now:</span>
        {#if door_state !== 2}
            <LocationSelector />
        {:else}
            <AccesDirection />
        {/if}
    </div>
</div>
    


<style>
    .wrapper {
        display: flex;
        flex-direction: column;
		justify-content: space-evenly;
        flex: 1;
    }
    .date-time {
        display: flex;
        flex-direction: column;
        color: var(--text-secondary);
        align-items: center;

        & .time { font-size: 4rem; }

        & .date { font-size: 1.15rem; }
    }

    .access-button-wrapper {
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 0 15%;
    }

    .indicator-wrapper {
        display: flex;
        flex-direction: column;
        gap: 8px;
        padding: 0 15%;

        & span {
            text-align: center;
            color: var(--text-secondary);
        }
    }
</style>