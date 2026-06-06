<script lang="ts">
    import ChevronRight from "./icons/chevron-right.svelte";
    import Flame from "./icons/flame.svelte";

    let {
        href,
        room_name = "Room name",
        current_temp = 0.0,
        target_temp = 0.0,
        program = "Program name",
        next_temp = 0.0,
        next_temp_time = "00:00",
        is_heating = false,
        enabled = true,
    } : {
        href?: string
        room_name?: string
        current_temp?: number
        target_temp?: number
        program?: string
        next_temp?: number
        next_temp_time?: string
        is_heating?: boolean
        enabled?: boolean
    } = $props()
</script>



<a 
    href={href}
    class="room-status-card"
>
    <div class="top">
        <span>{room_name}</span>
        <ChevronRight />
    </div>

    {#if enabled}
        <div class="temp-wrapper">
            <div class="temp">
                <span class="header">CURRENT</span>
                <span>{current_temp.toFixed(1)}°C</span>
            </div>

            <div 
                class="arrow-wrapper"
                class:heating={is_heating}
            >
                <Flame width={16} height={16} />
                <div class="arrow"></div>
                <span>{is_heating ? "heating" : "heat off"}</span>
            </div>

            <div class="temp">
                <span class="header">TARGET</span>
                <span>{target_temp.toFixed(1)}°C</span>
            </div>
        </div>

        <div class="info">
            <span>{program}</span>
            <span>·</span>
            <span>{next_temp.toFixed(1)}°C at {next_temp_time}</span>
        </div>
    {:else}
        <div class="info">
            <span>Heat disabled</span>
            <span>·</span>
            <span>tap to change</span>
        </div>
    {/if}
</a>



<style>
    .room-status-card {
        display: flex;
        flex-direction: column;
        padding: 20px;
        gap: 24px;
        border-radius: 16px;
        background-color: var(--raised);
        border: 1px solid var(--raised-border);
        align-items: center;
    }

    .top {
        display: flex;
        flex-direction: row;
        align-items: center;
        gap: 8px;
        align-self: stretch;
        
        & span {
            font-size: 1.1rem;
            font-weight: 500;
            flex: 1;
        }
    }

    .temp-wrapper {
        display: flex;
        flex-direction: row;
        gap: 24px;
        align-self: stretch;
    }

    .temp {
        display: flex;
        flex-direction: column;
        gap: 4px;

        & span {
            text-align: center;
        }

        & .header {
            color: var(--text-secondary);
            letter-spacing: 0.05rem;
        }
    }

    .arrow-wrapper {
        display: flex;
        flex-direction: column;
        flex: 1;
        gap: 4px;
        align-items: center;
        fill: var(--text-secondary);
        color: var(--text-secondary);

        &.heating {
            fill: var(--red-text);
            color: var(--red-text);
        }

        & span {
            font-size: 0.75rem;
        }
    }

    .arrow {
        position: relative;
        width: 100%;
        height: 2px;
        background: currentColor;
        border-radius: 2px;
    }

    .arrow::after {
        content: "";
        position: absolute;
        right: -1px;
        top: 50%;
        transform: translateY(-50%);
        
        width: 0;
        height: 0;

        border-top: 7px solid transparent;
        border-bottom: 7px solid transparent;
        border-left: 12px solid currentColor;
    }

    .info {
        display: flex;
        flex-direction: row;
        gap: 8px;
        color: var(--text-secondary);
    }
</style>