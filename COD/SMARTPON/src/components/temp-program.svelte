<script lang="ts">
    import { formatDays } from "@services/day-interval-combiner";
    import RadioSelector from "./radio-selector.svelte";
    import type { Period } from "@data-types/period";

    let {
        id,
        name,
        schedule,
        onSelect,
        selected_id
    } : {
        id: number
        name: string
        schedule: Period[]
        onSelect?: () => void
        selected_id?: number|null
    } = $props()
</script>



<button 
    class="temp-program"
    onclick={onSelect}
>
    <div class="header">
        <span>{name}</span>
        <RadioSelector 
            selected={id === selected_id}
        />
    </div>

    {#each schedule as period (period)}
        <div class="subprogram">
            <span class="days">{formatDays(period.days)}</span>
            <div class="time-slots">
                {#each period.slots as slot (slot.time)}
                    {#if typeof slot.temp === "number"}
                        <span 
                            class:t17-19={slot.temp >= 17 && slot.temp < 19 }
                            class:t19-21={slot.temp >= 19 && slot.temp < 21 }
                            class:t21-23={slot.temp >= 21 && slot.temp < 23 }   
                            class:t23-25={slot.temp >= 23 && slot.temp < 25 }   
                            class:disabled={id !== selected_id}
                        >
                            {slot.temp}°C
                        </span>
                    {:else}
                        <span
                            class:antifreeze={slot.temp === "antifreeze"}
                            class:off={slot.temp === "off"}
                            class:disabled={id !== selected_id}
                        >
                            {slot.temp.toLocaleUpperCase()}
                        </span>
                    {/if}
                {/each}
            </div>
        </div>
    {/each}
</button>



<style>
    .temp-program {
        display: flex;
        flex-direction: column;
        gap: 8px;
        padding-top: 16px;
        padding-bottom: 20px;
        border-bottom: 1px solid var(--dividers);

        /* does not work without them here */
        --t17-19: hsl(220 70% 65%);
        --t17-19-secondary: hsl(220 45% 75%);
        --t19-21: hsl(100 35% 50%);
        --t19-21-secondary: hsl(100 30% 70%);
        --t21-23: hsl(45 60% 50%);
        --t21-23-secondary: hsl(45 50% 65%);
        --t23-25: hsl(15 60% 55%);
        --t23-25-secondary: hsl(15 40% 70%);
        --off: hsl(0 0% 70%);
        --off-secondary: hsl(0 0% 80%);
        --antifreeze: hsl(193 50% 60%);
        --antifreeze-secondary: hsl(193 30% 75%);
    }

    .header {
        display: flex;
        flex-direction: row;
        justify-content: center;
        gap: 8px;
        padding-left: 4px;

        & span {
            flex: 1;
        }
    }

    .subprogram {
        display: flex;
        flex-direction: column;
        gap: 2px;

        & .days {
            padding: 0 4px;
            font-size: 0.8rem;
            color: var(--text-secondary)
        }
    }

    .time-slots {
        display: flex;
        flex-direction: row;
        gap: 2px;
        text-align: center;

        & > * {
            color: var(--text-inverted);
            font-weight: 500;
            flex: 1;
            padding: 4px 8px;
        }

        & > *:first-child {
            border-top-left-radius: 6px;
            border-bottom-left-radius: 6px;
        }

        & > *:last-child {
            border-top-right-radius: 6px;
            border-bottom-right-radius: 6px;
        }
    }

    .t17-19 {
        background-color: var(--t17-19);
    }
    .t19-21 {
        background-color: var(--t19-21);
    }
    .t21-23 {
        background-color: var(--t21-23);
    }
    .t23-25 {
        background-color: var(--t23-25);
    }
    .antifreeze {
        background-color: var(--antifreeze);
    }
    .off {
        background-color: var(--off);
    }

    .t17-19.disabled {
        background-color: var(--t17-19-secondary);
    }
    .t19-21.disabled {
        background-color: var(--t19-21-secondary);
    }
    .t21-23.disabled {
        background-color: var(--t21-23-secondary);
    }
    .t23-25.disabled {
        background-color: var(--t23-25-secondary);
    }
    .antifreeze.disabled {
        background-color: var(--antifreeze-secondary);
    }
    .off.disabled {
        background-color: var(--off-secondary);
    }
</style>