<script lang="ts">
    import { page } from "$app/state";
    import ErrorBanner from "@components/error-banner.svelte";
    import Pencil from "@components/icons/pencil.svelte";
    import InputNumber from "@components/input-number.svelte";
    import RoomTempCard from "@components/room-temp-card.svelte";
    import TempProgram from "@components/temp-program.svelte";
    import TopbarBack from "@components/topbar-back.svelte";
    import { RoomTempController } from "@controllers/room-temp-program.controller.svelte";
    import { userStore } from "@services/user-profile";
    import { onMount } from "svelte";

    const controller = new RoomTempController()
    let offset = $state(controller.offset)

    let has_server_connection = $state(true)

    async function saveOffset()
    {
        const result = await controller.setRoomOffset(offset)

        if (!result)
            return

        controller.is_edit_offset = false
    }

    function cancelOffset()
    {
        controller.is_edit_offset = false;
        controller.offset_error = ""
        offset = controller.offset
        console.log(offset)
    }

    onMount(() => 
    {
        const id = Number(page.params.id)
        
        if (id) 
        {
            controller.loadData(id);
        }

		const interval = setInterval( () => 
        {
			controller.loadData(id)
		}, 30_000)

		return () => 
        {
			clearInterval(interval);
		}
	})
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
    {#if controller.is_edit_offset}
        <div class="sensor-offset-editor">
            <InputNumber 
                label="Sensor offset"
                type="number"
                bind:value={offset}
                error={controller.offset_error}
            />

            <div class="offset-buttons">
                <button
                    onclick={saveOffset}
                >
                    Save
                </button>
                <button 
                    class="cancel"
                    onclick={cancelOffset}
                >
                    Cancel
                </button>
            </div>
        </div>
    {:else}
        <div class="sensor-offset">
            <span>Sensor offset:</span>
            <span class="value">{controller.offset}</span>
            <button onclick={ () => { offset = controller.offset; controller.is_edit_offset = true } }>
                <Pencil width={16} height={16} />
            </button>
        </div>
    {/if}

    {#if controller.room?.temp_program_id === null}
        <div class="heat-info">
            <span>Heating has been disabled.</span>
            <span class="muted">Select any program to re-enable it.</span>
        </div>
    {:else}
        <RoomTempCard 
            current_temp={Number(controller.room?.current_temp ?? 0) + Number(controller.room?.offset_value ?? 0)}
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

    <div class="action-buttons">
        {#if userStore.isAdmin()}
            <a 
                class="add-program"
                href="/add-temp-program"
            >
                Add program
            </a>
        {/if}

        {#if controller.room?.temp_program_id !== null}
            <button
                class="disable-heating"
                onclick={ () => controller.setRoomProgram(null) }
            >
                Disable heating
            </button>
        {/if}
    </div>
</div>



<style>
    .content {
        display: flex;
        flex-direction: column;
        padding: 16px;
        gap: 16px;
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

    .action-buttons {
        display: flex;
        flex-direction: row;
        gap: 4px;
    }

    .disable-heating {
        color: var(--red-text);
        text-decoration: underline;
        text-align: center;
        flex: 1;
    }

    .add-program {
        text-decoration: underline;
        text-align: center;
        flex: 1;
    }

    .sensor-offset {
        display: flex;
        flex-direction: row;
        gap: 16px;
        align-items: center;
        padding: 8px;

        & .value {
            flex: 1;
        }

        & button {
            color: var(--text-secondary);
        }
    }

    .sensor-offset-editor {
        display: flex;
        flex-direction: column;
        gap: 8px;

        & .offset-buttons {
            display: flex;
            flex-direction: row;
            padding: 0 16px;

            & > * {
                flex: 1;
                text-decoration: underline;
                text-align: center;
            }

            & .cancel {
                color: var(--text-primary);
            }
        }
    }
</style>