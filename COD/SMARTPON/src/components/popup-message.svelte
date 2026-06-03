<script lang="ts">
    let {
        title = "Popup title",
        message = "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
        action_button_message = "Action",
        onAction,
        onCancel,
    } : {
        title?: string
        message?: string
        action_button_message?: string
        onAction?: () => void
        onCancel?: () => void
    } = $props()
</script>



<div class="popup">
    <div class="card">
        <span class="title">{title}</span>
        <span class="message">{message}</span>

        <div class="buttons">
            <button 
                class="action"
                onclick={onAction}
            >
                {action_button_message}
            </button>

            <button 
                class="cancel"
                onclick={onCancel}
            >
                Cancel
            </button>
        </div>
    </div>
</div>



<style>
    .popup {
        width: 100vw;
        height: 100vh;
        background-color: rgba(0, 0, 0, 0.5);
        position: fixed;
        top: 0;
        left: 0;
        z-index: 10;
        padding: 24px;
        display: flex;
        align-items: center;
        justify-content: center;
        box-sizing: border-box;
    }

    .card {
        display: flex;
        flex-direction: column;
        padding: 24px;
        gap: 16px;
        border-radius: 24px;
        background-color: var(--raised);
    }

    .title {
        font-size: 1.25rem;
    }

    .message {
        font-weight: 300;
    }

    .buttons {
        display: flex;
        flex-direction: row;
        gap: 16px;
        justify-content: flex-end;
    }

    button {
        padding: 12px 16px;

        &.cancel {
            color: var(--text-primary);
        }
    }
</style>