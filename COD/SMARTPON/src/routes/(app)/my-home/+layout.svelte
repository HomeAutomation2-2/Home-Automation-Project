<script lang="ts">
    import TopbarTabbed from '@components/topbar-tabbed.svelte';
    import { MyHomeController } from '@controllers/my-home.controller.svelte';
    import { userStore } from '@services/user-profile';
    import { setContext } from 'svelte';


    let { children } = $props()

    const home_controller = new MyHomeController()
    home_controller.updatePresence()
    home_controller.updateLogs()

    setContext("home-controller", home_controller)
</script>



{#if userStore.isAdmin()}
    <TopbarTabbed 
        page_name={userStore.isAdmin() ? "My Home (Admin)" : "My Home"  }
        tabs={[
            { label: "Presence", href: "/my-home/presence"},
            { label: "Logs", href: "/my-home/logs"},
            { label: "Temps", href: "/my-home/temps"},
            { label: "Other", href: "/my-home/other"},
        ]}
    />
{:else}
    <TopbarTabbed 
        page_name={userStore.isAdmin() ? "My Home (Admin)" : "My Home"  }
        tabs={[
            { label: "Presence", href: "/my-home/presence"},
            { label: "Logs", href: "/my-home/logs"},
        ]}
    />
{/if}
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