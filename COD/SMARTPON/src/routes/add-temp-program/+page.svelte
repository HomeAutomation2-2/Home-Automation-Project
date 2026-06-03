<script lang="ts">
    import Button from "@components/button.svelte";
    import InputText from "@components/input-text.svelte";
    import TempSubprogram from "@components/temp-subprogram.svelte";
    import TopbarConfirmCancel from "@components/topbar-confirm-cancel.svelte";
    import { CreateTempController } from "@controllers/create-temp-program.controller.svelte";


    const temp_controller = new CreateTempController()

    async function onSave()
    {
        const result = await temp_controller.createProgram()

        if (result)
            history.back()
    }
</script>



<TopbarConfirmCancel
    title="Add temp program"
    onCancel={ () => history.back() }
    onConfirm={onSave}
/>
<div class="page-body">
    <InputText 
        label="Name"
        usage="room name"
        bind:value={temp_controller.program_name}
        error={temp_controller.error}
    />
    
    {#each temp_controller.periods as period, index}
        <TempSubprogram 
            bind:period={temp_controller.periods[index]} 
            onRemove={ () => temp_controller.removeSubprogram(index) }
            showRemove={temp_controller.periods.length > 1}
            onDaySelect={temp_controller.toggleDay}
            index={index}
        />
    {/each}

    <Button 
        text="Add subprogram"
        type="border"
        onClick={ () => temp_controller.addSubprogram() }
    />
</div>



<style>
    .page-body {
        display: flex;
        flex-direction: column;
        padding: 16px;
        gap: 16px;
    }
</style>