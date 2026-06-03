<script lang="ts">
    import Ex from "./icons/ex.svelte";
    import Checkmark from "./icons/checkmark.svelte";

    let { 
        title = "",
        onCancel,
        onConfirm
    } : {
        title?: string
        onCancel?: () => void
        onConfirm?: () => void
    } = $props();
</script>



<div class="back-topbar-base">
    <div class="content">
       <button onclick={onCancel}>
            <Ex />
       </button>
        
        <span>{title}</span>
        
        <button onclick={onConfirm}>
            <Checkmark />
        </button>
    </div>
</div>
    


<style>
    .back-topbar-base {
        background-color: var(--base);

        position: sticky;
        top: 0;
        container-type: scroll-state;
        z-index: 1;
    }

    @container scroll-state(stuck: top) {
        .content {
            border-bottom: 1px solid var(--dividers) !important;
        }
    }

    .content {
        display: flex;
        flex-direction: row;
        gap: 4px;
        align-items: center;
        padding: 24px 16px;
        padding-top: calc(max(24px, env(safe-area-inset-top)));
        border-bottom: 1px solid var(--base);
        transition: border-color 0.25s ease;
    }

    span {
        flex: 1;
        text-align: center;
        font-size: larger;
        font-weight: 500;
    }
</style>