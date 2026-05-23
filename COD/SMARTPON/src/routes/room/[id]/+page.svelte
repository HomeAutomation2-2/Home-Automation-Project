<script lang="ts">
    import { page } from "$app/state";
    import ErrorBanner from "@components/error-banner.svelte";
    import RoomTempCard from "@components/room-temp-card.svelte";
    import TempProgram from "@components/temp-program.svelte";
    import TopbarBack from "@components/topbar-back.svelte";
    import { RoomTempController } from "@controllers/room-temp-program.controller.svelte";

    const controller = new RoomTempController()
    
    $effect( () => {
        const id = Number(page.params.id);
        if (id) {
            controller.loadData(id);
        }
    })

    let has_server_connection = $state(false)
</script>


<TopbarBack 
    page_name={controller.room?.name + " program"}
/>

{#if !has_server_connection}
    <ErrorBanner 
        message="Can’t contact to server. Functionality is limited."
    />
{/if}

<div class="content">
    {#if controller.room?.temp_program_id === null}
        <div class="heat-info">
            <span>Heating has been disabled.</span>
            <span class="muted">Select any program to re-enable it.</span>
        </div>
    {:else}
        <RoomTempCard 
            current_temp={controller.room?.current_temp}
            target_temp={controller.target_temp ?? 0.0}
            is_heating={controller.room?.is_heating}
        />
    {/if}


    {#each controller.temp_programs as program (program.id)}
        <TempProgram 
            id={program.id}
            name={program.name}
            schedule={program.schedule}
            selected_id={controller.room_program_id}
            onSelect={ () => controller.setRoomProgram(program.id) }
        />
    {/each}

    <button
        class="disable-heating"
        onclick={ () => controller.setRoomProgram(null) }
    >
        Disable heating
    </button>
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
        padding: 20px 0;
        text-align: center;
    }

    .muted {
        color: var(--text-secondary);
    }

    .disable-heating {
        color: var(--red-text);
        text-decoration: underline;
        text-align: center;
        align-self: center;
    }
</style>