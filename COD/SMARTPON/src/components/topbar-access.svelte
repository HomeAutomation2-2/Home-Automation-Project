<script lang="ts">
    let {
        is_locked = undefined
    } : {
        is_locked?: boolean
    } = $props()
</script>



<div class="topbar-access">
    <span>Door status:</span>
    <div 
        class="status"
        class:locked={is_locked === true}
        class:unlocked={is_locked === false}
        class:unknown={is_locked === undefined}
    >
        {
            is_locked === undefined 
                ? "Unknown" 
                : is_locked ? "Locked" : "Unlocked"
        }
    </div>
</div>



<style>
    .topbar-access {
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: center;
        padding: 24px 16px;
        padding-top: calc(max(24px, env(safe-area-inset-top)));
        gap: 8px;

        font-size: large;
        font-weight: 500;
    }

    .locked { color: var(--green-text); }
    .unlocked { color: var(--red-text); }
    .unknown { color: var(--text-secondary); }
</style>