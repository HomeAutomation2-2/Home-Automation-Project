<script lang="ts">
    import TopbarTabbed from "../../components/topbar-tabbed.svelte";

    let { children } = $props()
</script>


<TopbarTabbed 
    page_name="Dashboard"
    tabs={[
        { label: "Lights", href: "/dashboard"},
        { label: "Temps", href: "/dashboard/temps"},
    ]}
/>
<div class="content">
    {@render children()}
</div>



<style>
</style>