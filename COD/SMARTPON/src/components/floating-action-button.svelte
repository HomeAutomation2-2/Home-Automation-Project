<script lang="ts">
    import Plus from "./icons/plus.svelte"

    let {
        href
    } : {
        href?: string
    } = $props()
</script>



{#if href}
    <a class="fab" href="{href}">
        <Plus 
            width={32}
            height={32}
        />
    </a>
{:else}
    <button class="fab">
        <Plus 
            width={32}
            height={32}
        />
    </button>
{/if}



<style>
    .fab {
        display: flex;
        align-items: center;
        justify-content: center;

        border-radius: 100%;
        aspect-ratio: 1 / 1;
        padding: 16px;

        background-color: var(--text-primary);
        color: var(--text-inverted);

        text-decoration: none;
        border: none;
        
        cursor: pointer;
    }
</style>