<script lang="ts">
    type ButtonType = "primary" | "secondary" | "passive" | "border"

    let {
        text = "Button",
        type = "primary",
        href = undefined,
        fill = false,
        is_disabled = false,
        onClick,
    } : {
        text?: string
        type?: ButtonType
        href?: string
        fill?: boolean
        is_disabled?: boolean
        onClick?: () => void
    } = $props()
</script>



{#if href}
    <a
        href={is_disabled ? undefined : href}
        class:primary={type === "primary"}
        class:secondary={type === "secondary"}
        class:passive={type === "passive"}
        class:border={type === "border"}
        class:disabled={is_disabled}
        class:fill={fill}
        aria-disabled={is_disabled}
        tabindex={is_disabled ? -1 : undefined}
        onclick={ (e) => {
            if (is_disabled) {
                e.preventDefault();
            }
        }}
    >
        <span>{text}</span>
    </a>
{:else}
    <button
        class:primary={type === "primary"}
        class:secondary={type === "secondary"}
        class:passive={type === "passive"}
        class:border={type === "border"}
        class:disabled={is_disabled}
        disabled={is_disabled}
        class:fill={fill}
        onclick={onClick}
    >
        <span>{text}</span>
    </button>
{/if}



<style>
    button,
    a {
        border-radius: 12px;
        padding: 12px 16px;
        display: flex;
        justify-content: center;
        flex: 0 0 auto;
    }

    span {
        font-weight: 400;
        text-align: center;
    }

    .primary {
        background-color: var(--text-primary);
        color: var(--text-inverted);
    }

    .secondary {
        background-color: var(--raised);
        color: var(--text);
        border: 1px solid var(--raised-border);
        box-shadow: 0 0 2px 0 rgba(0, 0, 0, 0.25);
    }

    .passive {
        background-color: var(--raised-border);
        border: 1px solid var(--dividers);
        color: var(--text-secondary);
        box-shadow: 0 0 2px 0 rgba(0, 0, 0, 0.25);
    }

    .border {
        background-color: transparent;
        border: 1px solid var(--text-secondary);
    }

    .disabled {
        opacity: 0.5;
    }

    .fill {
        flex: 1;
    }
</style>