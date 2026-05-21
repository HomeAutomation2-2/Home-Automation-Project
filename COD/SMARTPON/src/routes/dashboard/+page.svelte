<script lang="ts">
    import ErrorBanner from "../../components/error-banner.svelte";
    import LightCard from "../../components/light-card.svelte";

    
    let has_server_connection = $state(false)
    let is_on = $state(true)
</script>




{#if !has_server_connection}
    <ErrorBanner 
        message="Can’t contact to server. Functionality is limited."
    />
{/if}

<div class="cards">
    <div class="location">
        <span>Living room</span>
        <LightCard 
            name="Main lights" 
            is_on={is_on}
            onClick={ () => is_on = !is_on }
        />
    </div>

    <div class="location">
        <span>Hallway</span>
        <LightCard 
            name="Wall lamps" 
        />
    </div>

    <div class="location">
        <span>Bedroom</span>
        <LightCard 
            name="Main lights" 
        />
    </div>
</div>


<style>
    .cards {
        display: flex;
        flex-direction: column;
        padding: 16px;
        gap: 20px;
    }

    .location {
        display: flex;
        flex-direction: column;
        gap: 4px;

        & span {
            padding: 0 12px;
        }
    }
</style>