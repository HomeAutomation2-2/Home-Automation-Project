<script lang="ts">
    import Checkmark from "./icons/checkmark.svelte";

    let {
        selected = false
    } : {
        selected?: boolean
    } = $props()
</script>



<div 
    class="box"
    class:selected={selected}
>
    {#if selected}
        <Checkmark width={16} height={16} />
    {/if}
</div>



<style>
    .box {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 24px;
        height: 24px;
        border-radius: 4px;
        border: 1px solid var(--text-secondary)
    }

    .selected {
        background-color: var(--text-primary);
        border: 1px solid var(--text-primary);
        color: var(--text-inverted);
    }
</style>