<script lang="ts">
    let {
        key = "Key",
        value = "Value"
    } : {
        key?: string,
        value?: string
    } = $props()
</script>



<div class="entry-info">
    <span class="key">{key}</span>
    <span class="value">{value}</span>
</div>



<style>
    .entry-info {
        display: flex;
        flex-direction: row;
        padding: 12px 8px;
        border-bottom: 1px solid var(--dividers);
        justify-content: space-between;
    }

    .key {
        color: var(--text-secondary);
    }
</style>