<script lang="ts">
    import type { TimeSlot } from "@data-types/time-slot";
    import Minus from "./icons/minus.svelte";
    import Plus from "./icons/plus.svelte";


    let { 
        slot = $bindable() 
    } : { 
        slot: TimeSlot 
    } = $props()

    let last_numeric_value = 20.0
    let can_modify = $derived(typeof slot.temp === "number")

    function adjustTemp(amount: number) 
    {
        if (typeof slot.temp === "number") 
        {
            slot.temp = parseFloat((slot.temp + amount).toFixed(1))
            last_numeric_value = slot.temp
        }
    }

    function cycleTempState() 
    {
        if (slot.temp === "antifreeze") 
            slot.temp = "off";
        else if (slot.temp === "off")
            slot.temp = last_numeric_value;
        else
            slot.temp = "antifreeze";
    }

    function formatDisplayState(val: typeof slot.temp): string 
    {
        if (typeof val === 'number') 
            return val + "°C"

        return val.charAt(0).toUpperCase() + val.slice(1)
    }
</script>



<div class="temp-slot">
    <input
        type="time"    
        bind:value={slot.time}
    />

    <div class="temp-selector">
        <button
            class="temp-adjuster"
            class:disabled={!can_modify}
            onclick={() => adjustTemp(0.5)}
        >
            <Plus />
        </button>

        <button
            class="temp-state"
            onclick={cycleTempState}
        >
            {formatDisplayState(slot.temp)}
        </button>

        <button
            class="temp-adjuster"
            class:disabled={!can_modify}
            onclick={() => adjustTemp(-0.5)}
        >
            <Minus />
        </button>
    </div>
</div>




<style>
    .temp-slot {
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        flex: 1;
        padding: 4px 0;
    }
    .temp-selector {
        display: flex;
        flex-direction: row;
        justify-content: center;
        gap: 4px;
    }
    .temp-selector .temp-adjuster {
        display: flex;
        align-items: center;
        justify-content: center;
        aspect-ratio: 1;
        width: 32px;
    }
    .temp-selector .temp-state {
        font-size: large;
        min-width: 100px;
        text-align: center;
    }
    .disabled {
        color: var(--dividers);
        pointer-events: none;
        opacity: 0.3;
    }
    input {
        all: unset;
        background-color: var(--lowered);
        border-radius: 8px;
        padding: 4px 12px;
    }
</style>