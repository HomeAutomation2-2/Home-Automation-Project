<script lang="ts">
    import InputText from "../../../components/input-text.svelte";

    let server_name = "example.server.com"
    let error_message = "Error message here"
    let phone_number = $state("")
    let password = $state("")
</script>



<div class="page">
    <div class="center">
        <div class="info">
            <span class="title">Enter credentials</span>
            <span class="details">Enter the username and password the server admin has given you.</span>
        </div>

        <div class="inputs">
            <InputText 
                label="Phone number"
                usage="phone number"
                value={phone_number}
                type="tel"
            />

            <InputText 
                label="Password"
                usage="password"
                value={password}
                type="password"
            />

            {#if error_message}
                <span class="error">{error_message}</span>
            {/if}
        </div>
    </div>

    <button>Continue</button>
</div>



<style>
    .page {
        width: 100%;
        height: 100%;
        padding: 32px;
        box-sizing: border-box;
        display: flex;
        flex-direction: column;
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