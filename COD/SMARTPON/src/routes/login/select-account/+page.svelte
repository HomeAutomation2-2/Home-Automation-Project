<script lang="ts">
    import { goto } from "$app/navigation";
    import Button from "@components/button.svelte";
    import InputText from "@components/input-text.svelte";
    import TopbarBack from "@components/topbar-back.svelte";
    import type { LoginController } from "@controllers/login.controller.svelte";
    import { authStore } from "@services/auth-store.svelte";
    import { getContext, onMount } from "svelte";


    onMount( () => 
    {
        if (authStore.isAuthenticated)
            goto("/dashboard")
    })

    const login_controller = getContext("login-controller") as LoginController

    async function onContinue()
    {
        const has_logged_in = await login_controller.loginUser()

        if (has_logged_in)
            goto("/dashboard")
    }
</script>



<div class="page">
    <TopbarBack 
        page_name={login_controller.server_name}
    />

    <div class="body">
        <div class="center">
            <div class="info">
                <span class="title">Enter credentials</span>
                <span class="details">Enter the username and password the server admin has given you.</span>
            </div>

            <div class="inputs">
                <InputText 
                    label="Phone number"
                    usage="phone number"
                    bind:value={login_controller.phone_number}
                    type="tel"
                />

                <InputText 
                    label="Password"
                    usage="password"
                    bind:value={login_controller.password}
                    type="password"
                />

                {#if login_controller.login_error}
                    <span class="error">{login_controller.login_error}</span>
                {/if}
            </div>
        </div>

        <Button
            text="Continue"
            type="primary"
            onClick={onContinue}
            is_disabled={login_controller.are_credentials_invalid}
        />
    </div>
</div>



<style>
    .page {
        width: 100%;
        height: 100%;
        display: flex;
        flex-direction: column;
    }

    .body {
        padding: 32px;
        padding-top: 0;
        display: flex;
        flex-direction: column;
        align-self: stretch;
        flex: 1;
    }

    .center {
        flex: 1;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 24px;
    }

    .info {
        display: flex;
        flex-direction: column;
        gap: 20px;
        padding: 16px 0;

        & .title {
            font-size: 1.5rem;
            font-weight: 600;
            text-align: center;
        }

        & .details {
            font-size: 0.9rem;
            color: var(--text-secondary);
            text-align: center;
        }
    }

    .inputs {
        display: flex;
        flex-direction: column;
        align-self: stretch;
        gap: 8px;
    }

    .error {
        font-size: 0.75rem;
        color: var(--red-text);
        padding-left: 8px;
    }
</style>