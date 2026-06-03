<script lang="ts">
    import Button from "@components/button.svelte";
    import InputNumber from "@components/input-number.svelte";
    import { SettingsController } from "@controllers/settings.controller.svelte";
    
    const controller = new SettingsController()
    controller.loadData()
</script>



<div class="page-contents">
    <div class="inputs">
        <InputNumber
            label="Histerezis"
            type="number"
            bind:value={controller.histerezis}
        />
        <InputNumber
            label="Antifreeze temp"
            type="number"
            bind:value={controller.antifreeze}
        />
        <span class="error">{controller.error}</span>
    </div>

    {#if controller.is_modified}
        <div class="buttons">
            <Button 
                text="Cancel"
                type="secondary"
                fill
                onClick={ () => controller.onCancel() }
            />
            <Button 
                text="Save"
                type="primary"
                fill
                onClick={ () => controller.onSave() }
            />
        </div>
    {/if}
</div>



<style>
    .page-contents {
        display: flex;
        flex-direction: column;
        padding: 16px;
        gap: 32px;  
    }

    .inputs {
        display: flex;
        flex-direction: column;
        gap: 16px;
    }

    .error {
        color: var(--red-text);
        font-size: small;
    }

    .buttons {
        display: flex;
        flex-direction: row;
        gap: 8px;
    }
</style>