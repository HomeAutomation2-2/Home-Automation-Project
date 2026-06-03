<script lang="ts">
    import TabBar from "./tab-bar.svelte";

    let {
        page_name = "Page name",
        tabs
    } : {
        page_name?: string
        tabs: { label: string; href: string;}[]
    } = $props()
</script>



<div class="topbar-access">
    <span>{page_name}</span>
    <TabBar tabs={tabs} />
</div>



<style>
    .topbar-access {
        display: flex;
        flex-direction: column;
        justify-content: center;
        padding-top: calc(max(24px, env(safe-area-inset-top)));
        gap: 8px;

        font-size: large;
        font-weight: 500;
    }

    span {
        text-align: center;
        padding: 0 16px;
    }
</style>