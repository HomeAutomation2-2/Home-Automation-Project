<script lang="ts">
    import InputText from "@components/input-text.svelte";
    import TopbarConfirmCancel from "@components/topbar-confirm-cancel.svelte";
    import { CreateRoomController } from "@controllers/create-room.controller.svelte";


    const room_controller = new CreateRoomController()

    async function onSave()
    {
        const result = await room_controller.createRoom()

        if (result)
            history.back()
    }
</script>



<TopbarConfirmCancel
    title="Add a room"
    onCancel={ () => history.back() }
    onConfirm={onSave}
/>
<div class="page-body">
    <InputText 
        label="Name"
        usage="room name"
        bind:value={room_controller.name}
        error={room_controller.error}
    />
</div>



<style>
    .page-body {
        display: flex;
        flex-direction: column;
        padding: 16px;
    }
</style>