<script lang="ts">
    let {
        label = "Label",
        usage,
        type = "text",
        placeholder,
        value = $bindable(""),
        error
    } : {
        label?: string
        usage?: string
        type?: string
        placeholder?: string
        value?: string,
        error?: string
    } = $props()
</script>



<div class="input-text">
    <label for={usage}>{label}</label>
    <input
        id={usage}
        type={type}
        placeholder={placeholder}
        bind:value={value}
    />
    {#if error}
        <span>{error}</span>
    {/if}
</div>



<style>
    .input-text {
        display: flex;
        flex-direction: column;
        gap: 4px;
        align-self: stretch;
    }

    label {
        padding-left: 8px;
    }

    input {
        all: unset;
        border: 1px solid var(--lowered-border);
        border-radius: 16px;
        background-color: var(--lowered);
        padding: 12px 16px;
    }

    span {
        font-size: 0.75rem;
        color: var(--red-text);
        padding-left: 8px;
    }
</style>