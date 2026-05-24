<script lang="ts">
    import Checkbox from "@components/checkbox.svelte";
    import InputText from "@components/input-text.svelte";
    import TopbarConfirmCancel from "@components/topbar-confirm-cancel.svelte";
    import { AddUserController } from "@controllers/add-user.controller.svelte";


    const controller = new AddUserController()

    async function onSave()
    {
        const result = await controller.createUser()

        if (result)
            history.back()
    }
</script>



<TopbarConfirmCancel
    title="Add user"
    onCancel={ () => history.back() }
    onConfirm={onSave}
/>
<div class="page-body">
    <InputText 
        label="First name"
        usage="first name"
        bind:value={controller.first_name}
        error={controller.first_name_error}
    />

    <InputText 
        label="Last name"
        usage="last name"
        bind:value={controller.last_name}
        error={controller.last_name_error}
    />

    <InputText 
        label="CNP"
        usage="cnp"
        bind:value={controller.cnp}
        error={controller.cnp_error}
    />

    <InputText 
        label="Phone number"
        usage="phone number"
        bind:value={controller.phone_number}
        error={controller.phone_number_error}
    />

    <InputText 
        label="Password"
        usage="password"
        type="password"
        bind:value={controller.password}
        error={controller.password_error}
    />

    <button 
        class="toggle-option"
        onclick={ () => controller.is_admin = !controller.is_admin }
    >
        <span>Is admin?</span>
        <Checkbox selected={controller.is_admin} />
    </button>
</div>



<style>
    .page-body {
        display: flex;
        flex-direction: column;
        padding: 16px;
        gap: 20px;
    }

    .toggle-option {
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: right;
        gap: 8px;
        padding: 8px;
    }
</style>