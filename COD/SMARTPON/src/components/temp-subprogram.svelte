<script lang="ts">
    import type { Period } from "@data-types/period";
    import TempSlot from "./temp-slot.svelte";
    import WeekDaySelector from "./week-day-selector.svelte";
    import Trash2 from "./icons/trash-2.svelte";
    import Ex from "./icons/ex.svelte";

    let { 
        period = $bindable(), 
        onRemove, 
        showRemove,
        onDaySelect,
        index
    } : { 
        period: Period, 
        onRemove: () => void, 
        showRemove: boolean
        onDaySelect?: (period_id: number, id: number) => void
        index: number
    } = $props();


    function addSlot() 
    {
        period.slots.push({ time: "12:00", temp: 20.0 })
    }

    function removeSlot(index: number) 
    {
        period.slots.splice(index, 1)
    }
</script>




<div class="temp-subprogram">
    <div class="header">
        <WeekDaySelector 
            bind:grup={period.days} 
            onDaySelect={ (day) => onDaySelect?.(index, day) }
        />

        {#if showRemove}
            <button 
                class="remove-btn" 
                onclick={onRemove}
            >
                <Trash2 />
            </button>
        {/if}
    </div>


    <div class="slots">
        {#each period.slots as slot, index}
            <div class="slot-row">
                {#if period.slots.length > 1}
                    <button 
                        class="delete-slot" 
                        onclick={() => removeSlot(index)}
                    >
                        <Ex 
                            width={16} 
                            height={16}
                        />
                    </button>
                {/if}

                <TempSlot 
                    bind:slot={period.slots[index]} 
                />
            </div>
        {/each}
    </div>

    <button class="add-slot-btn" onclick={addSlot}>
        + New slot
    </button>
</div>



<style>
    .temp-subprogram {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 16px;
        padding: 24px 0;
        border-bottom: 1px solid var(--dividers);
        align-self: stretch;
    }

    .header {
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        align-self: stretch;
    }

    .remove-btn { 
        color: var(--red-text); 
        font-size: 0.9rem; 
    }

    .slots {
        display: flex;
        flex-direction: column;
        align-self: stretch;
    }

    .slot-row {
        display: flex;
        align-items: center;
        align-self: stretch;
        gap: 4px;
        padding: 0 8px;
    }

    .delete-slot { 
        color: var(--red-text); 
        background: none; 
        border: none; 
        padding: 4px;
    }

    .add-slot-btn { 
        color: var(--text-primary); 
    }
</style>