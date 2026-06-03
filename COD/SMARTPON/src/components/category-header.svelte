<script lang="ts">
    import Plus from "./icons/plus.svelte";

    let {
        name = "Header",
        onClick
    } : {
        name?: string
        onClick?: () => void
    } = $props()
</script>



<button 
    class="category-header"
    onclick={onClick}
>
    <span>{name}</span>
    <Plus />
</button>



<style>
    .category-header {
        display: flex;
        flex-direction: row;
        padding: 8px;
        gap: 8px;
        color: var(--text-secondary);
        align-items: center;
    }

    span {
        color: var(--text);
        flex: 1;
    }
</style>