<script lang="ts">
    import InputText from "@components/input-text.svelte";

    let server_url = $state("")
    let error_message = "Error message here"
</script>



<div class="page">
    <div class="center">
        <div class="info">
            <span class="title">Select a server to connect</span>
            <span class="details">Enter the URL address of the server you want to connect to. If you do not know it or do not know what that means, asks the server’s admin.</span>
        </div>

        <InputText 
            label="URL"
            usage="server URL"
            placeholder="http(s)://"
            value={server_url}
            error={error_message}
        />
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
</style>