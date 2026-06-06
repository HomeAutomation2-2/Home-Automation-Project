<script lang="ts">
    import Flame from "./icons/flame.svelte";


    let {
        is_heating = true,
        current_temp = 0.0,
        target_temp = 0.0,
    } : { 
        is_heating?: boolean
        current_temp?: number
        target_temp?: number
    } = $props()
</script>




<div class="room-temp">
    <div class="temp">
        <span class="header">CURRENT</span>
        <span>{current_temp?.toFixed(1)}°C</span>
    </div>
    
    {#if is_heating}
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
    {/if}
</div>



<style>
    .room-temp {
        display: flex;
        flex-direction: row;
        justify-content: center;
        gap: 24px;
        align-self: stretch;
        background-color: var(--raised);
        border: 1px solid var(--raised-border);
        padding: 20px 16px;
        border-radius: 16px;
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
</style>