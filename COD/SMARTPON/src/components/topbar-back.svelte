<script lang="ts">
    import ChevronLeft from "./icons/chevron-left.svelte";

    let {
        page_name = "Page name"
    } : {
        page_name?: string
    } = $props()
</script>



<div class="topbar-back">
    <button
        onclick={ () => history.back() }
    >
        <ChevronLeft />
    </button>
    <span>{page_name}</span>
    <div class="placeholder"></div>
</div>



<style>
    .topbar-back {
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

    button,
    .placeholder {
        width: 48px;
        height: 48px;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    span {
        flex: 1;
        text-align: center;
    }
</style>