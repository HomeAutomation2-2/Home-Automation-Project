<script lang="ts">
    import { goto } from "$app/navigation";
    import BottomSheet from "@components/bottom-sheet.svelte";
    import CategoryHeader from "@components/category-header.svelte";
    import ErrorBanner from "@components/error-banner.svelte";
    import FloatingActionButton from "@components/floating-action-button.svelte";
    import LightCardPlaceholder from "@components/light-card-placeholder.svelte";
    import LightCard from "@components/light-card.svelte";
    import { DashboardController } from "@controllers/dashboard.controller.svelte";
    import { authStore } from "@services/auth-store.svelte";
    import { getContext, onMount } from "svelte";

    
    onMount( () =>
    {
        if (!authStore.isAuthenticated)
            goto("/login/select-server")
    })

    const dash_controller = getContext("dashboard-controller") as DashboardController
    
    let has_server_connection = $state(false)
    let new_zone_parent_id = $state<number|undefined>(undefined)
    let new_zone_name = $state("")

    async function addZone()
    {
        const result = await dash_controller.addZone(new_zone_name, new_zone_parent_id!)

        if (result)
        {
            new_zone_parent_id = undefined
            new_zone_name = ""   
        }
    }
</script>




{#if !has_server_connection}
    <ErrorBanner 
        message="Can’t contact to server. Functionality is limited."
    />
{/if}

<div class="cards">
    {#each dash_controller.rooms as room (room.id)}
        <div class="location">
            <CategoryHeader 
                name={room.name}
                onClick={ () => new_zone_parent_id = room.id }
            />
            
            {#if dash_controller.getZonesForRoom(room.id).length === 0}
                <LightCardPlaceholder />
            {/if}
            {#each dash_controller.getZonesForRoom(room.id) as zone (zone.id)}
                <LightCard 
                    name={zone.name}
                    onClick={ () => dash_controller.toggleZone(zone.id, zone.is_on) }
                    is_on={zone.is_on}
                />
            {/each}
        </div>
    {/each}
</div>
<div class="fab">
    <FloatingActionButton 
        href="/add-room"
    />
</div>
{#if new_zone_parent_id !== undefined}
    <BottomSheet 
        zone_name={dash_controller.getRoomName(new_zone_parent_id)}
        bind:value={new_zone_name}
        onAdd={addZone}
        onCancel={ () => { new_zone_parent_id = undefined; new_zone_name = "" } }
        error_message={dash_controller.zone_error}
    />
{/if}


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
    }

    .fab {
        position: fixed;
        right: 24px;
        bottom: 90px;
    }
</style>