<script lang="ts">
    import { page } from "$app/state";
    import Button from "@components/button.svelte";
    import EntryInfo from "@components/entry-info.svelte";
    import PopupMessage from "@components/popup-message.svelte";
    import TopbarBack from "@components/topbar-back.svelte";
    import { ManageUserController } from "@controllers/manage-user.controller.svelte";
    import { userStore } from "@services/user-profile";

    
    const controller = new ManageUserController()
    
    $effect( () => 
    {
        const id = Number(page.params.id);
        if (id) 
        {
            controller.loadData(id)
        }
    })

    let show_suspend_popup = $state(false)
    let show_delete_popup = $state(false)

    async function deleteAcc()
    {
        show_delete_popup = false
        const result = await controller.deleteAccount()

        if (result)
            history.back()
    }


    async function suspendOrEnableAcc()
    {
        show_suspend_popup = false
        await controller.suspendOrEnableAccount()
        controller.reloadData()
    }
</script>



<div class="page">
    <TopbarBack 
        page_name={controller.full_name}
    />

    <div class="content">
        <div class="top">
            <div class="avatar">
                <span>{controller.initials}</span>
            </div>
            <span 
                class="status"
                class:suspended={controller.is_suspended}
            >
                {controller.is_suspended ? "Suspended" : "Active"}
            </span>
        </div>

        <div class="list">
            <EntryInfo 
                key="CNP"
                value={controller.cnp}
            />
            <EntryInfo 
                key="Location"
                value={controller.location}
            />
            <EntryInfo 
                key="Account type"
                value={controller.account_type}
            />
        </div>

        <div class="actions">
            <Button 
                text={controller.is_suspended ? "Enable account" : "Suspend account"}
                type="secondary"
                onClick={ () => show_suspend_popup = true }
            />
            <button
                class="delete-account"
                onclick={ () => show_delete_popup = true }
            >
                Delete acccount
            </button>
        </div>
    </div>

    {#if show_suspend_popup}
        <PopupMessage 
            title={controller.is_suspended ? "Enable account?" : "Suspend account?"}
            message={controller.is_suspended ? "While the account is active, the user has access to your home." : "While the account is suspended, the user will not be able to interact with the app."}
            action_button_message={controller.is_suspended ? "Enable" : "Suspend"}
            onCancel={ () => show_suspend_popup = false }
            onAction={suspendOrEnableAcc}
        />
    {:else if show_delete_popup}
        <PopupMessage 
            title="Delete account?"
            message="The account will be immediatly deleted and the user will not have access to the house anymore."
            action_button_message="Delete"
            onCancel={ () => show_delete_popup = false }
            onAction={deleteAcc}
        />
    {/if}
</div>




<style>
    .page {
        width: 100vw;
        height: 100vh;
        display: flex;
        flex-direction: column;
    }

    .content {
        display: flex;
        flex-direction: column;
        padding: 16px;
        gap: 32px;
        flex: 1;
    }

    .top {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 8px;
    }

    .avatar {
        aspect-ratio: 1;
        width: 64px;
        border-radius: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        background-color: var(--green-background);
        color: var(--text-inverted);
        font-size: 1.5rem;
        font-weight: 500;
    }

    .status {
        color: var(--green-text);

        &.suspended {
            color: var(--red-text);
        }
    }

    .actions {
        display: flex;
        flex-direction: column;
        flex: 1;
        justify-content: end;
        padding-bottom: 16px;
    }

    .delete-account {
        border-radius: 12px;
        padding: 12px 16px;
        display: flex;
        justify-content: center;
        flex: 0 0 auto;
        color: var(--red-text);
    }
</style>