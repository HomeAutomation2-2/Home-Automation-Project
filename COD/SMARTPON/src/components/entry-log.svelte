<script lang="ts">
    let {
        type = "Type",
        message = "Message"
    } : {
        type?: string
        message?: string
    } = $props()
</script>



<div class="log-entry">
    <span class="type">{type.toUpperCase()}</span>
    <span class="message">{message}</span>
</div>



<style>
    .log-entry {
        display: flex;
        flex-direction: row;
        gap: 8px;
        padding: 12px 8px;
        border-bottom: 1px soild var(--dividers);
    }

    .type {
        font-weight: 500;
        min-width: 80px;
    }

    .message {
        flex: 1;
        color: var(--text-secondary);
    }
</style>