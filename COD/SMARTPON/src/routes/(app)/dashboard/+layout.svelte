<script lang="ts">
    import TopbarTabbed from '@components/topbar-tabbed.svelte';
    import { DashboardController } from '@controllers/dashboard.controller.svelte';
    import { setContext } from 'svelte';


    let { children } = $props()

    const dash_controller = new DashboardController()
    dash_controller.loadLights()

    setContext("dashboard-controller", dash_controller)
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
    .content {
        position: relative;
        flex: 1;
        overflow-y: auto;
        scrollbar-width: none;
	    -ms-overflow-style: none;
    }

    .content::-webkit-scrollbar {
        display: none;
    }
</style>