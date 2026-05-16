<script lang="ts">
    import CurcleX from "./icons/curcle-x.svelte";
    import LockKeyholeOpen from "./icons/lock-keyhole-open.svelte";
    import LockKeyhole from "./icons/lock-keyhole.svelte";

    /**
     * `state` can be:
     *  - 0 = locked
     *  - 1 = waiting for unlock confirmation
     *  - 2 = unlocked
     *  - 3 = errored
     *  - 4 = waiting for lock confirmation
     */
    let {
        state = $bindable(0),
    } : {
        state?: number
    } = $props()


    let is_holding = false;
    let unlocked_by_hold = false;

    /**
     * handle the transition to 100% completion of the progress bar on the button wrapper. 
     * this indicates that the timer for user pressing the button has finished and something shoud happen.
     * @param event
     */
    function handleTransitionEnd(event: TransitionEvent) {
        // Guard: only fire when `--progress` completes while the user is still
        // physically holding down. This prevents the reverse transition (bar
        // resetting to 0% after an aborted press) from triggering an unlock.
        if (event.propertyName === "--progress" && state === 0 && is_holding) 
        {
            state = 1
            unlocked_by_hold = true
        }
    }

    function handlePointerDown() 
    {
        if (state === 0)
            is_holding = true
    }

    function handlePointerUp() 
    {
        is_holding = false
        unlocked_by_hold = false
    }

    function handleTap() 
    {
        if (unlocked_by_hold)
        {
            unlocked_by_hold = false
            return
        }

        if (state === 2) 
            state = 4
        else if (state === 3)
            state = 1
    }
</script>



<div
    class="progress"
    class:unlocked={state === 2}
    class:awaiting-confirmation={state === 1 || state === 4}
    class:errored={state === 3}
    ontransitionend={handleTransitionEnd}
>
    <button
        class:unlocked={state === 2}
        class:awaiting-confirmation={state === 1 || state === 4}
        class:errored={state === 3}
        onpointerdown={handlePointerDown}
        onpointerup={handlePointerUp}
        onpointercancel={handlePointerUp}
        onclick={handleTap}
    >
        {#if state === 0}
            <LockKeyhole width={48} height={48} />
            <span>Hold to unlock</span>
        {:else if state === 1 || state === 4}
            <LockKeyhole width={48} height={48} />
            <span>Unlocking...</span>
        {:else if state === 2}
            <LockKeyholeOpen width={48} height={48} />
            <span>Tap to lock</span>
        {:else if state === 3}
            <CurcleX width={48} height={48} />
            <div class="info">
                <span>Error</span>
                <span class="hint">Tap to retry</span>
            </div>
        {/if}
    </button>
</div>



<style>
    @property --progress {
        syntax: '<percentage>';
        inherits: true;
        initial-value: 0%;
    }

    .progress {
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 100%;
        padding: 32px;
        box-sizing: border-box;
        flex: 1;
        background: conic-gradient(
            var(--19-21-secondary) var(--progress), 
            transparent var(--progress));
        transition: --progress 1s linear;

        /* trigger the animation by setting the variable */
        &:not(.unlocked):not(.awaiting-confirmation):not(.errored):has(button:active) {
            --progress: 100%;
        }

        /* reset the timer if unlocked or the user let go */
        &.unlocked,
        &.errored {
            --progress: 0%;
            transition: none;
        }

        &.awaiting-confirmation {
            --progress: 12%;
            transition: none;
            animation: spin 1.5s linear infinite;
        }
    }

    button {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 32px;
        gap: 8px;
        aspect-ratio: 1;
        border-radius: 100%;
        flex: 1;
        background-color: var(--green-text);
        color: var(--text-inverted);
        box-shadow: 
            2px 8px 8px 0 rgba(0 0 0 / 0.25),
            inset 0 4px 8px 0 rgba(255 255 255 / 0.25),
            inset 0 -4px 8px 0 rgba(0 0 0 / 0.25);

        & span {
            font-weight: 500;
            font-size: 1.4rem;
            text-align: center;
        }

        &:active {
            box-shadow: 
            inset 0 4px 8px 0 rgba(255 255 255 / 0.25),
            inset 0 -4px 8px 0 rgba(0 0 0 / 0.25);
        }

        &.unlocked {
            animation: pop 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
            background-color: var(--orange-text);
        }

        &.awaiting-confirmation {
            animation: counter-spin 1.5s linear infinite;
            cursor: default;
            pointer-events: none;
        }

        &.errored {
            background-color: var(--red-text);
        }
    }

    .info {
        display: flex;
        flex-direction: column;
        align-items: center;
        
        & .hint {
            font-size: 1rem;
            font-weight: 400;
        }
    }

    @keyframes spin {
        to { transform: rotate(360deg); }
    }

    @keyframes counter-spin {
        to { transform: rotate(-360deg); }
    }

    @keyframes pop {
        0% { transform: scale(1); }
        50% { transform: scale(1.12); }
        100% { transform: scale(1); }
    }
</style>