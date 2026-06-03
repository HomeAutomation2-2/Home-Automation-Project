<script lang="ts">
    import LampCeiling from "./icons/lamp-ceiling.svelte";

    let {
        name,
        is_on = false,
        onClick
    } : {
        name: string
        is_on?: boolean
        onClick?: () => void
    } = $props()
</script>



<button 
    class="light-card"
    class:on={is_on}
    onclick={onClick}
>
    <div class="top">
        <span>{is_on ? "ON" : "OFF"}</span>
        <LampCeiling 
            width={48} 
            height={48} 
        />
    </div>

    <span>{name}</span>
</button>



<style>
    .light-card {
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        gap: 12px;
        padding: 20px;
        flex: 1;
        background-color: var(--raised);
        border: 1px solid var(--raised-border);
        color: var(--text-secondary);
        border-radius: 16px;
        fill: none;

        &.on {
            border: 1px solid var(--gold-text);
            background-color: var(--gold-background);
            color: var(--text);
            fill: var(--gold-text);
        }
    }

    .top {
        display: flex;
        flex-direction: column;
        text-align: center;     
        font-weight: 500;
    }
</style>