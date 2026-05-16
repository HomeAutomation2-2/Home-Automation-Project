<script>
    import AccessButton from "../../components/access-button.svelte";
    import ErrorBanner from "../../components/error-banner.svelte";
    import LocationSelector from "../../components/location-selector.svelte";
    import Navbar from "../../components/navbar.svelte";
    import TopbarAccess from "../../components/topbar-access.svelte";

    let has_connection = $state(false)
</script>




<TopbarAccess 
    is_locked={true}
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
        <AccessButton />
    </div>
    
    <div class="indicator-wrapper">
        <span>You are now:</span>
        <LocationSelector />
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
        padding: 0 20%;
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