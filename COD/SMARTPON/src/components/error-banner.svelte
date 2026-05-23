<script lang="ts">
    let {
        message,
        secondary
    } : {
        message?: string
        secondary?: string
    } = $props()
</script>



<div class="error-banner">
    <span class="message">{message}</span>
    <div class="secondary">{secondary}</div>
</div>



<style>
    .error-banner {
        display: flex;
        flex-direction: column;
        gap: 4px;
        align-items: center;
        background-color: #E1E5B6;
        padding: 8px 16px;

        position: sticky;
        top: 0;
        left: 0;
    }

    .secondary {
        color: var(--text-secondary);
    }
</style>