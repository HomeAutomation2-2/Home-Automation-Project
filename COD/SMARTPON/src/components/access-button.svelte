<script lang="ts">
    import LockKeyholeOpen from "./icons/lock-keyhole-open.svelte";
    import LockKeyhole from "./icons/lock-keyhole.svelte";

    let {
        state = $bindable(0)
    } : {
        state?: number
    } = $props()
</script>



<button>
    {#if state === 0}
        <LockKeyhole width={48} height={48} />
        <span>Hold to unlock</span>
    {:else}
        <LockKeyholeOpen width={48} height={48} />
        <span>Tap to lock</span>
    {/if}
</button>



<style>
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
        }

        &:active {
            box-shadow: 
            inset 0 4px 8px 0 rgba(255 255 255 / 0.25),
            inset 0 -4px 8px 0 rgba(0 0 0 / 0.25);
        }
    }
</style>