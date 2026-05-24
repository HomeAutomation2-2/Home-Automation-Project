<script lang="ts">
    import Button from "./button.svelte";
    import InputText from "./input-text.svelte";

    let {
        zone_name = "Zone",
        error_message,
        value = $bindable(""),
        onAdd,
        onCancel
    } : {
        zone_name?: string
        error_message?: string
        value?: string
        onAdd?: () => void
        onCancel?: () => void
    } = $props()
</script>



<div 
    class="overlay"
    onclick={ (event) => { event.stopPropagation(); onCancel?.() }}
>
    <div 
        class="bottom-sheet"
        onclick={ (event) => event.stopPropagation() }
    >
        <span>Add a new zone to {zone_name}</span>
    
        <div class="content">
            <InputText 
                label="Name"
                bind:value={value}
                error={error_message}
            />
            <Button 
                text="Add"
                type="primary"
                onClick={onAdd}
            />
        </div>
    </div>
</div>



<style>
    .overlay {
        width: 100vw;
        height: 100vh;
        background-color: rgba(0, 0, 0, 0.5);
        position: fixed;
        top: 0;
        left: 0;
        z-index: 10;
    }

    .bottom-sheet {
        position: absolute;
        bottom: 0;
        left: 0;
        right: 0;
        display: flex;
        flex-direction: column;
        padding: 32px;
        border-radius: 16px 16px 0 0;
        background-color: var(--raised);
        gap: 24px;
    }

    .content {
        display: flex;
        flex-direction: column;
        gap: 16px;
    }

    span {
        font-size: 1.1rem; 
    }
</style>